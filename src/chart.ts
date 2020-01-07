/* --------------------------------------------------------- */
/* DRAW CHART                                                */
/* --------------------------------------------------------- */
import * as d3 from "d3";
import responsivefy from './responsivefy.ts'

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

    const cluster = d3.cluster()
        .size([360, innerRadius]);

    const line = d3.radialLine()
        .curve(d3.curveBundle.beta(0.85))
        .radius(function (d) { return d.y; })
        .angle(function (d) { return d.x / 180 * Math.PI; });

    const svg = d3.select(".container-chart")
        .append('svg')    
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .call(responsivefy)
        .append('g')
        .attr('transform', `translate(${width/2}, ${height/2})`);

    let root = packageHierarchy(jsonData)
        .sum(function (d) { return d.size; });
    console.log('root ', root.children);

          
    

  /*
    svg.append("svg:path")
    .attr("class", "arc")
    .attr("d", d3.arc().outerRadius(ry - 180).innerRadius(0).startAngle(0).endAngle(2 * Math.PI))  

    var nodes = cluster(root);
    var groupData = svg.selectAll("g.group")
    .data(nodes.filter(function(d) { return (d.key=='data' || d.key == 'animate' || d.key == 'display') && d.children; }))
    .enter().append("group")
    .attr("class", "group");

    var groupArc = d3.arc()
    .innerRadius(ry - 177)
    .outerRadius(ry - 157)
    .startAngle(function(d) { return (findStartAngle(d.__data__.children)-2) * Math.PI / 180;})
    .endAngle(function(d) { return (findEndAngle(d.__data__.children)+2) * Math.PI / 180});
    
    svg.selectAll("g.arc")
    .data(groupData[0])
    .enter()
    .append("svg:path")
    .attr("d", groupArc)
    .attr("class", "groupArc")
    .style("fill", "#1f77b4")
    .style("fill-opacity", 0.5);
    */

    var color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 7));

    const plot = (root, svg) => {

        cluster(root);    
        var x = packageImports(root.leaves());
    
        var arr = [], arr2 = [];
        for (var i = 0; i < x.length; i++) {
            arr.push(x[i][0].data.key);
            arr2.push(x[i][x[i].length - 1].data.key);
        }
 
        const link = svg.append("g").selectAll(".link")
            .data(packageImports(root.leaves()))
            .enter()
            .append("path")
            .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
            .attr("class", "link")
            .attr("d", line)
            /*
            .style("stroke", function(d) { 
                var splitName = d.source.data.name.split(".");             
                var group = splitName[0] + '.' + splitName[1];            
                return color(group); 
            });
            */
            
        link
            .exit()
            .transition()
            .attr('r', 0)
            .remove();     



        // Update the nodes...
        let node = svg.append("g").selectAll(".node")
            .data(root.leaves(), function(d) {
                return d.id || (d.id = ++i);
            });

   

        var nodeEnter = node
            .enter()            
            .append("a")
            .attr("class", "node")
            .attr("dy", "0.31em")
            .attr("xlink:href", function (d) {
                if (d.data.url === undefined) {
                } else {
                    return d.data.url;
                }
            })
            .append("text")
            .attr("class", "node")
            .attr("dy", "0.31em")
            .attr("transform", function (d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
            .attr("text-anchor", function (d) { return d.x < 180 ? "start" : "end"; })
            .text(function (d) { return d.data.key; })           
            .style("fill", function(d) { 
                var splitName = d.data.name.split(".");             
                var group = splitName[0] + '.' + splitName[1];            
                return color(group); 
            })   
            .on("mouseover", mouseovered)
            .on("mouseout", mouseouted);
          
        let nodeExit = node
            .exit()
            .transition()
            .duration(duration)
            .attr('r', 0)
            .remove(); 
        
        nodeExit.select('node').attr('r', 0);
  

        // Update
        let nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        
        nodeUpdate.transition().
            duration(duration);

            

        // Update the node attributes and style
        /*
        nodeUpdate.select('circle.node').
            attr('r', 25).
            style("fill", function(d) {
                return "#0e4677";
            }).
            attr('cursor', 'pointer');
            */

       
        function mouseovered(d) {
            node
                .each(function (n) { n.target = n.source = false; });    
            link                
                .classed("link--target", function (l) { if (l.target === d) return l.source.source = true; })
                .classed("link--source", function (l) { if (l.source === d) return l.target.target = true; })
                .filter(function (l) { return l.target === d || l.source === d; })
                .style("stroke", function(d) { 
                    var splitName = d.source.data.name.split(".");             
                    var group = splitName[0] + '.' + splitName[1];            
                    return color(group); 
                })
                .raise();    
            node
                .classed("node--target", function (n) { return n.target; })
                .classed("node--source", function (n) { return n.source; });            
        }
    
        function mouseouted(d) {
            link
                .classed("link--target", false)
                .classed("link--source", false)
                .style("stroke", function(d) {        
                    return 'steelblue'; 
                });
    
            node
                .classed("node--target", false)
                .classed("node--source", false);            
        }

    }

    plot(root, svg);


    //LOOK
    //https://jsfiddle.net/a6pLqpxw/8/

    setTimeout(function () {
        /*
        let newData = { "name": "flare.lab.Jester", "size": 3534, "imports": ["flare.display.DirtySprite"] }
        jsonData.push(newData);
        root = packageHierarchy(jsonData)
        .sum(function (d) { return d.size; });
        //console.log(jsonData);
        //console.log(jsonData.length);
        plot(root, svg);
        */
        //creates New OBJECT
        var newNodeObj = {
            type: 'resource-delete',
        name: "flare.lab.Jester",
        attributes: [],
        children: []
        };

        //Creates new Node 
        var newNode = d3.hierarchy(newNodeObj);
        newNode.depth = root.depth; 
        newNode.height = root.height - 1;
        newNode.parent = root; 


       //root.children.push(newNode);
       //root.data.children.push(newNode.data);
       
       /plot(root, svg);
       
   
    }, 5000);
    

/*
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
*/

    // Lazily construct the package hierarchy from class names.
    function packageHierarchy(classes) {
        var map = {};
    
        function find(name, data) {
            var node = map[name], i;
            if (!node) {
                node = map[name] = data || { name: name, children: [] };
                if (name.length) {
                    node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                    node.parent.children.push(node);
                    node.key = name.substring(i + 1);                
                }               
            }
            return node;
        }
    
        classes.forEach(function (d) {
            find(d.name, d);
        });
    
        return d3.hierarchy(map[""]);
    }

    // Return a list of imports for the given array of nodes.
    function packageImports(nodes) {
        var map = {},
            imports = [];
    
        // Compute a map from name to node.
        nodes.forEach(function (d) {
            map[d.data.name] = d;
        });
    
        // For each import, construct a link from the source to target node.
        nodes.forEach(function (d) {            
            if (d.data.imports) d.data.imports.forEach(function (i) {
                imports.push(map[d.data.name].path(map[i]));
            });
        });
    
        return imports;
    }

    // get the dom element width
    function getDivWidth (div) {
        var width = d3.select(div)
        // get the width of div element
        .style('width')
        // take of 'px'
        .slice(0, -2)
        // return as an integer
        return Math.round(Number(width))
    }
}

/* --------------------------------------------------------- */