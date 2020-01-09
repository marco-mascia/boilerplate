/* --------------------------------------------------------- */
/* DRAW CHART                                                */
/* --------------------------------------------------------- */
import * as d3 from "d3";
import responsivefy from './responsivefy.ts';
import packageHierarchy from './packageHierarchy.ts';
import packageImports from './packageImports.ts';
import getDivWidth from './getDivWidth.ts';

export default function drawChart(jsonData) {

    console.log('drawChart data: ', jsonData);

    const divWidth = getDivWidth('.container-chart');    

    const diameter = divWidth,
        radius = diameter / 2,
        innerRadius = radius - divWidth/7;

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = divWidth - margin.left - margin.right;
    const height = divWidth - margin.top - margin.bottom;

    const rx = width / 2;
    const ry = height / 2;
   
    const duration = 750;
    const tension_default = 0.85;
    let tension = tension_default;

    let cluster = d3.cluster()
        .size([360, innerRadius]);

    let line = d3.radialLine()
        .curve(d3.curveBundle.beta(tension))        
        .radius(function (d) { return d.y; })
        .angle(function (d) { return d.x / 180 * Math.PI; });

    const svg = d3.select(".container-chart")
        .append('svg')    
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .call(responsivefy)
        .append('g')
        .attr('transform', `translate(${width/2}, ${height/2})`);

    let root = packageHierarchy(jsonData[0]).sum(function (d) { return d.size; });        
    var links, nodes;   

    //var link = svg.append("g").selectAll(".link");
    //var node = svg.append("g").selectAll(".node");

    var link = svg.selectAll(".link");       
    var node = svg.selectAll(".node");
    var path = svg.selectAll("path.link");

    var color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 7));

    function update(root){
           
        links = packageImports(root.descendants());
        cluster(root);  
        nodes = root.descendants();           
        
       link = link        
           .data(links)
           .enter()
           .append("path")
           .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
           .attr("class", "link")
           .attr("d", line)           
           .style("stroke", function(d) { 
               var splitName = d.source.data.name.split(".");             
               var group = splitName[0] + '.' + splitName[1];            
               return color(group); 
           });      
           link
                .exit()
                .transition()
                .attr('r', 0)
                .remove()        
           
        /** ---------------------------------------------------- */                                       

        node = node
            .data(nodes.filter(function(n) { return !n.children; }))
            .enter().append("text")
            .attr("class", "node")
            .attr("dy", ".31em")
            .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
            .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
            .text(function(d) { return d.data.key; })
            .on("mouseover", mouseovered)
            .on("mouseout", mouseouted)
            .style("fill", function(d) { 
                var splitName = d.data.name.split(".");             
                var group = splitName[0] + '.' + splitName[1];            
                return color(group); 
            });  

            /*         
            .exit()
            .transition()
            .attr('r', 0)
            .remove();
            */
                       

       
        function mouseovered(d) {
            node
                .each(function (n) { n.target = n.source = false; });    
            link                
                .classed("link--target", function (l) { if (l.target === d) return l.source.source = true; })
                .classed("link--source", function (l) { if (l.source === d) return l.target.target = true; })
                .filter(function (l) { return l.target === d || l.source === d; })
                .style("stroke", strokeLine)
                .raise();    
            node
                .classed("node--target", function (n) { return n.target; })
                .classed("node--source", function (n) { return n.source; });            
        }
    
        function mouseouted(d) {
            link
                .classed("link--target", false)
                .classed("link--source", false)
                .style("stroke", strokeLine);
            node
                .classed("node--target", false)
                .classed("node--source", false);            
        }
    
    }

    update(root);

    //LOOK
    //https://jsfiddle.net/a6pLqpxw/8/  
  

    function strokeLine(d){        
        let splitName = d.source.data.name.split(".");                     
        let group = splitName[0] + '.' + splitName[1];            
        return color(group); 
    }

    d3.timeout(function() {
       console.log('Timeout triggered');      
       root = packageHierarchy(jsonData[0]);            
       //update(root); 
    }, 5000);


    document.getElementById('tension').onclick = function() {
        console.log('tension clicked');
        line = d3.radialLine().curve(d3.curveBundle.beta(0));
    };


    function findStartAngle(children) {
        var min = children[0].x;
        children.forEach(function(d) {
           if (d.x < min)
               min = d.x;
        });
        return min;
    }
    
    function findEndAngle(children) {
        var max = children[0].x;
        children.forEach(function(d) {
           if (d.x > max)
               max = d.x;
        });
        return max;
    }   


    /*
    var path = svg.selectAll("path.link")
    .data(links)
  .enter().append("svg:path")
    .attr("class", function(d) { return "link source-" + d.source.key + " target-" + d.target.key; })
    .attr("d", function(d, i) { return line(splines[i]); });

    d3.select("input[type=range]").on("change", function() {
        line.curve(d3.curveBundle.beta(this.value / 100));
        path.attr("d", function(d, i) { return line(XPathEvaluator[i]); });
      });
      */

      /*
  // https://github.com/d3/d3-force
  let layout = d3.forceSimulation()
    // settle at a layout faster
    .alphaDecay(0.1)
    // nearby nodes attract each other
    .force("charge", d3.forceManyBody()
      .strength(10)
      .distanceMax(scales.airports.range()[1] * 2)
    )
    // edges want to be as short as possible
    // prevents too much stretching
    .force("link", d3.forceLink()
      .strength(0.7)
      .distance(0)
    )
    .on("tick", function(d) {
      links.attr("d", line);
    })
    .on("end", function(d) {
      console.log("layout complete");
    });

  layout.nodes(bundle.nodes).force("link").links(bundle.links);
      */
      

}

/* --------------------------------------------------------- */