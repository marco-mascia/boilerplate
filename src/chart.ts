/* --------------------------------------------------------- */
/* DRAW CHART                                                */
/* --------------------------------------------------------- */
//import * as d3 from "d3";
import responsivefy from "./responsivefy.ts";
import packageHierarchy from "./packageHierarchy.ts";
import packageImports from "./packageImports.ts";
import getDivWidth from "./getDivWidth.ts";

const color = d3.scale.category10();
const line_color = '#CCCCCC';

var nodes, links, splines, path, cluster, bundle, root;

const divWidth = getDivWidth(".container-chart");
const diameter = divWidth,
  radius = diameter / 2,
  innerRadius = radius - divWidth / 7;

const margin = { top: 10, right: 10, bottom: 10, left: 10 };
const width = divWidth - margin.left - margin.right;
const height = divWidth - margin.top - margin.bottom;
const tension_smooth = 0.85;
const tension_tense = 0;

let w = width,
h = height,
rx = w / 2,
ry = h / 2,
m0,
rotate = 0;

let div = d3
.select(".container-chart")
.style("width", w + "px")
.style("height", w + "px")
.style("position", "absolute");

let svg

//var link = svg.append("g").selectAll(".link");
let node;
let nodeText;

export default function drawChart(jsonData) {

  console.log('jsonData ', jsonData);

  svg = div
  .append("svg:svg")
  .attr("id", function(d) {
    return "impact";
  })
  .attr("width", w)
  .attr("height", w)
  .append("svg:g")
  .attr("transform", "translate(" + rx + "," + ry + ")");
  node = svg.selectAll("g.node");

  setTimeout(function(){     
    //nodeText.select('text');
    //update(jsonData[0]);

  }, 5000);
  
  let currentTension = tension_smooth;

  cluster = d3.layout
    .cluster()    
    .size([360, ry - 180])
    .sort(function(a, b) {
      return d3.ascending(a.key, b.key);
    });

  bundle = d3.layout.bundle();

  var line = d3.svg.line
    .radial()
    .interpolate("bundle")
    .tension(tension_smooth)
    .radius(function(d) {
      return d.y;
    })
    .angle(function(d) {
      return (d.x / 180) * Math.PI;
    })
    
  // Chrome 15 bug: <http://code.google.com/p/chromium/issues/detail?id=98951>

  nodes = cluster.nodes(packageHierarchy(jsonData));
  links = packageImports(nodes);
  splines = bundle(links);

  path = svg
    .selectAll("path.link")
    .data(links)    
    .enter()    
    .append("svg:path")
    .attr("class", function(d) {
      return "link source-" + d.source.key + " target-" + d.target.key + " group-" + d.source.parent.key;
    })
    .attr("d", function(d, i) {
      return line(splines[i]);
    }) 
   
  var groupData = svg
    .selectAll("g.group")
    .data(
      nodes.filter(function(d) {
        return (   
          (d.key== "Bayard" || d.key == "Freelance" || d.key == "Jobs" || d.key == "analytics" || d.key == "animate" || d.key == "data" || d.key == "physics" || d.key == "query" || d.key == "scale" || d.key == "util" || d.key == "vis" || d.key == "crop" || d.key == "month" || d.key == "interest" || d.key == "international" || d.key == "national" || d.key == "AllScales" || d.key == "local")
          && d.children
        );
      })
    )
    .enter()
    .append("group")
    .attr("class", function(d){
        return d.key
    })
    

  var groupArc = d3.svg.arc()
    .innerRadius(ry - 177)
    .outerRadius(ry - 157)
    .startAngle(function(d) {      
      return ((findStartAngle(d.__data__.children) - 2) * Math.PI) / 180;
    })
    .endAngle(function(d) {      
      return ((findEndAngle(d.__data__.children) + 2) * Math.PI) / 180;
    })
     
    var arcs = svg.selectAll("g.arc")
        .data(groupData[0])
        .enter().append('g')
            .attr("class", "arc")            
        arcs.append('path')
            .attr('fill', function(d,i){
                return color($(d).attr("class")); 
            })
            .attr('d', groupArc);
        arcs.append("text")
            .attr("transform", function(d){               
                return "translate("+groupArc.centroid(d) +")"; 
            })
            .attr("text-anchor", "middle")
            .text(function(d){ 
                return $(d).attr("class"); 
            })            
        arcs.on("mouseup", groupClick);        
  

    /**
     * 
     * @param d toggle group selection
     */
    function groupClick(d){         
      let group = $(d).attr("class");      
      svg
      .selectAll("path.link.group-" + group)      
      .style('stroke', function(d){        
        let newColor = color(group);              
        let rgb = d3.select(this).style("stroke")
        rgb = rgb.replace("rgb(", "");
        rgb = rgb.replace(")", "");        
        let arrgb = rgb.split(',');        
        let currentColor = rgbToHex(+arrgb[0], +arrgb[1], +arrgb[2]);            
        if(currentColor === newColor){
          newColor = line_color;
        }        
        return newColor;
      })   
    }
      

    node
    .data(
      nodes.filter(function(n) {
        return !n.children;
      })
    )    
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("id", function(d) {
      return "node-" + d.key;
    })
    .attr("transform", function(d) {
      return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
    })
    .append("svg:text")
    .attr("dx", function(d) {
      return d.x < 180 ? 25 : -25;
    })
    .attr("dy", ".31em")
    .attr("text-anchor", function(d) {
      return d.x < 180 ? "start" : "end";
    })
    .attr("transform", function(d) {
      return d.x < 180 ? null : "rotate(180)";
    })
    .text(function(d) {
      return d.key.replace(/_/g, " ");
    })
    .style("fill", function(d) {  
        var splitName = d.name.split(".");             
        var group = splitName[1]; 
        return color(group); 
    })
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    




  d3.select("input[type=range]").on("change", function() {
    line.tension(this.value / 100);
    path.attr("d", function(d, i) {
      return line(splines[i]);
    });
  });

  d3.select("#tension").on("click", function() {    
    if (currentTension == tension_smooth){
        line.tension(tension_tense);
        currentTension = tension_tense;
    }else{
        line.tension(tension_smooth);
        currentTension = tension_smooth;
    }
    
    path.attr("d", function(d, i) {
      return line(splines[i]);
    });
  });

  d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

  function mouse(e) {
    return [e.pageX - rx, e.pageY - ry];
  }

  function mousedown() {
    m0 = mouse(d3.event);
    d3.event.preventDefault();
  }

  function mousemove() {
    if (m0) {
      var m1 = mouse(d3.event),
        dm = (Math.atan2(cross(m0, m1), dot(m0, m1)) * 180) / Math.PI;
      div.style(
        "-webkit-transform",
        "translate3d(0," +
          (ry - rx) +
          "px,0)rotate3d(0,0,0," +
          dm +
          "deg)translate3d(0," +
          (rx - ry) +
          "px,0)"
      );
    }
  }

  function mouseup() {
    if (m0) {
      var m1 = mouse(d3.event),
        dm = (Math.atan2(cross(m0, m1), dot(m0, m1)) * 180) / Math.PI;

      rotate += dm;
      if (rotate > 360) rotate -= 360;
      else if (rotate < 0) rotate += 360;
      m0 = null;

      div.style("-webkit-transform", "rotate3d(0,0,0,0deg)");

      svg
        .attr(
          "transform",
          "translate(" + rx + "," + ry + ")rotate(" + rotate + ")"
        )
        .selectAll("g.node text")
        .attr("dx", function(d) {
          return (d.x + rotate) % 360 < 180 ? 25 : -25;
        })
        .attr("text-anchor", function(d) {
          return (d.x + rotate) % 360 < 180 ? "start" : "end";
        })
        .attr("transform", function(d) {
          return (d.x + rotate) % 360 < 180 ? null : "rotate(180)";
        });
    }
  }

  function mouseover(d) {

    let groupKey = d.key;
    svg
      .selectAll("path.link.target-" + d.key)
      .classed("target", true)
      .each(updateNodes("source", true))
      .style('stroke', function(){         
        return color(groupKey);  
      })

    svg
      .selectAll("path.link.source-" + d.key)
      .classed("source", true)
      .each(updateNodes("target", true))
      .style('stroke', function(){           
        return color(groupKey);  
      })

 
  }

  function mouseout(d) {
    svg
      .selectAll("path.link.source-" + d.key)
      .classed("source", false)
      .each(updateNodes("target", false));

    svg
      .selectAll("path.link.target-" + d.key)
      .classed("target", false)
      .each(updateNodes("source", false));
      
      resetLinkColor();
  }

  function cross(a, b) {
    return a[0] * b[1] - a[1] * b[0];
  }

  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }

  function findStartAngle(children) {
    var min = children[0].x;
    children.forEach(function(d) {
      if (d.x < min) min = d.x;
    });
    //console.log('min' , min);
    return +min;
  }

  function findEndAngle(children) {
    var max = children[0].x;
    children.forEach(function(d) {
      if (d.x > max) max = d.x;
    });
    //console.log('max' , max);
    return +max;
  }  
  
}

/* --------------------------------------------------------- */

export function selectEntity(name){

  let arr = name.split('.');
  let key = arr.slice(-1)[0];
  let groupKey = arr[1];  

  svg
    .selectAll("path.link.target-" + key)
    .classed("target", true)
    .each(updateNodes("source", true))
    .style('stroke', function(){         
      return color(groupKey);  
    })

  svg
    .selectAll("path.link.source-" + key)
    .classed("source", true)
    .each(updateNodes("target", true))
    .style('stroke', function(){           
      return color(groupKey);  
    })

}

function updateNodes(name, value) {
  return function(d) {
    if (value) this.parentNode.appendChild(this);
    svg.select("#node-" + d[name].key).classed(name, value);
  };
}


function update(jsonData){

    nodes = cluster.nodes(packageHierarchy(jsonData));
    links = packageImports(nodes);
    splines = bundle(links);    
  
    /*
    cluster = d3.layout
    .cluster()    
    .size([360, ry - 180])
    .sort(function(a, b) {
      return d3.ascending(a.key, b.key);
    }); 
    */   

    nodeText
    .attr("dx", function(d) {
      return d.x < 180 ? 25 : -25;
    })
    .attr("dy", ".31em")
    .attr("text-anchor", function(d) {
      return d.x < 180 ? "start" : "end";
    })
    .attr("transform", function(d) {
      return d.x < 180 ? null : "rotate(180)";
    })
    .text(function(d) {
      return d.key.replace(/_/g, " ");
    })
    .style("fill", function(d) {  
        var splitName = d.name.split(".");             
        var group = splitName[1]; 
        return color(group); 
    })
    
    /*
    node = node.data(
      nodes.filter(function(n) {
        return !n.children;
      })
    )  
    node.exit().remove();
    node     
    .enter()
    .append("svg:g")
    .attr("class", "node")
    .attr("id", function(d) {
      return "node-" + d.key;
    })
    .attr("transform", function(d) {
      return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
    });
    var svgText = node
    .append("svg:text")
    .attr("dx", function(d) {
      return d.x < 180 ? 25 : -25;
    })
    .attr("dy", ".31em")
    .attr("text-anchor", function(d) {
      return d.x < 180 ? "start" : "end";
    })
    .attr("transform", function(d) {
      return d.x < 180 ? null : "rotate(180)";
    })
    .text(function(d) {
      return d.key.replace(/_/g, " ");
    })
    .style("fill", function(d) {  
        var splitName = d.name.split(".");             
        var group = splitName[1]; 
        return color(group); 
    })
    //.on("mouseover", mouseover)
    //.on("mouseout", mouseout);
    */
  };


/* UTILS */
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {  
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function resetLinkColor(){
  svg.
  selectAll("path.link")
  .style('stroke', function(d){           
    return line_color;  
  })

}
