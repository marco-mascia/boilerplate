/* --------------------------------------------------------- */
/* DRAW CHART                                                */
/* --------------------------------------------------------- */
//import * as d3 from "d3";
import responsivefy from "./responsivefy.ts";
import packageHierarchy from "./packageHierarchy.ts";
import packageImports from "./packageImports.ts";
import getDivWidth from "./getDivWidth.ts";
import jobs from "../assets/jobs.json";
import { json } from "d3";

const color = d3.scale.category10();
const line_color = "#CCCCCC";
const duration = 350;

//let nodes, links, splines, groupData, groupArc, arcs;
let  
  path,
  cluster,
  bundle,
  root,
  svg;

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

var line = d3.svg.line
  .radial()
  .interpolate("bundle")
  .tension(tension_smooth)
  .radius(function(d) {
    return d.y;
  })
  .angle(function(d) {
    return (d.x / 180) * Math.PI;
  });

//TOOLTIP
var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

    

let jsonDataBackup, jsonData;

export default function drawChart(data) {
  console.log('data ', data); 

  //DATA CLONE
  jsonData = [];
  jsonDataBackup = [];

  jsonData = data;
  jsonDataBackup = data;


  svg = div
    .append("svg:svg")
    .attr("id", function(d) {
      return "impact";
    })
    .attr("width", w)
    .attr("height", w)
    .append("svg:g")
    .attr("transform", "translate(" + rx + "," + ry + ")");


  cluster = d3.layout
  .cluster()
  .size([360, ry - 180])
  .sort(function(a, b) {
    return d3.ascending(a.key, b.key);
  })
  /*
  .separation(function(a,b){
    return 20 + d3.sum([a,b].map(function(d){
      return d.status=="D" ? 70 : 0;
    }))
  });
  */

  //.sum(d => d.value).sort((a, b) => b.value - a.value);  
  
  bundle = d3.layout.bundle();

  let currentTension = tension_smooth;
  updateBundle(jsonData);

  /*
  setTimeout(function() {    
    //updateBundle(jobs);
  }, 5000);
  */
  

  d3.select("input[type=range]").on("change", function() {
    line.tension(this.value / 100);
    path.attr("d", function(d, i) {
      return line(splines[i]);
    });
  });

  d3.select("#tension").on("click", function() {
    if (currentTension == tension_smooth) {
      line.tension(tension_tense);
      currentTension = tension_tense;
    } else {
      line.tension(tension_smooth);
      currentTension = tension_smooth;
    }

    path.attr("d", function(d, i) {
      return line(splines[i]);
    });
  });
}

/* --------------------------------------------------------- */

export function selectEntity(name) {
  let arr = name.split(".");
  let key = arr.slice(-1)[0];
  let groupKey = arr[1];

  svg
    .selectAll("path.link.target-" + key)
    .classed("target", true)
    .each(updateNodes("source", true))
    .style("stroke", function() {
      return color(groupKey);
    });

  svg
    .selectAll("path.link.source-" + key)
    .classed("source", true)
    .each(updateNodes("target", true))
    .style("stroke", function() {
      return color(groupKey);
    });
}

export function deselectEntity(name) {
  let arr = name.split(".");
  let key = arr.slice(-1)[0];
  svg
    .selectAll("path.link.target-" + key)
    .classed("target", true)
    .each(updateNodes("source", true))
    .style("stroke", function() {
      return line_color;
    });

  svg
    .selectAll("path.link.source-" + key)
    .classed("source", true)
    .each(updateNodes("target", true))
    .style("stroke", function() {
      return line_color;
    });
}

export function toggleGroup(groupName){
  console.log('toggleGroup ', groupName);
  console.log('jsonData ', jsonData);
  let newData;

  let isVisible = jsonData.find((el) => {    
    let index = el.name.indexOf(groupName);
    if(index != -1)
      return el;
  }); 

  console.log("isVisible ", isVisible);
  
}


export function toggleEntity(name){
  console.log('toggleEntity ', name);
  console.log('jsonData ', jsonData);

  let item = jsonData.find((el) => {return el.name === name}); 
  let newData;

  if(item){    
    //REMOVE ITEM
    newData = jsonData.filter(function(el) { return el.name != name; }); //remove the item from colletion
    newData = newData.map((item) => {         
      let importIndex = item.imports.indexOf(name);
      if(importIndex != -1){       
        item.imports.splice(importIndex, 1);
        if(!item._imports) 
          item._imports = [];
        item._imports.push(name); //save name reference
      }     
      return item;     
    })   

  }else{
    
    //RESTORE ITEM
    newData = jsonData.map((item) => {         
      if(item._imports){
        let importIndex = item._imports.indexOf(name);
        if(importIndex != -1){
          item._imports.splice(importIndex, 1);
          item.imports.push(name);
        }
      }      
      return item;     
    })   
    var itemToRestore = jsonDataBackup.find((el) => {return el.name === name});
    newData.push(itemToRestore);
  }
  
  updateBundle(newData);

}

function updateNodes(name, value) {
  return function(d) {
    if (value) this.parentNode.appendChild(this);
    svg.select("#node-" + d[name].key).classed(name, value);
  };
}

/**
 *
 * @param d toggle group selection
 */
function groupClick(d) { 

  let group = $(d).attr("class");

  svg.selectAll("path.link.group-" + group).style("stroke", function(d) {
    let newColor = color(group);
    let rgb = d3.select(this).style("stroke");
    rgb = rgb.replace("rgb(", "");
    rgb = rgb.replace(")", "");
    let arrgb = rgb.split(",");
    let currentColor = rgbToHex(+arrgb[0], +arrgb[1], +arrgb[2]);
    if (currentColor === newColor) {
      newColor = line_color;
    }
    return newColor;
  });
}

/** WORKING DATA UPDATE  */
function updateBundle(data) {
  jsonData = [];
  jsonData = data;

  var nodes = cluster.nodes(packageHierarchy(jsonData));
  var links = packageImports(nodes);
  var splines = bundle(links);

  /* NODES  */
  var node = svg.selectAll(".node").data(nodes.filter(function(n) {
    return !n.children;
  })); 
  
  node.enter().append("text"); 

  node
    .attr("class", "node")
    .attr("id", function(d) {
      return "node-" + d.key;
    })
    .attr("dy", ".31em")    
    .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
    .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
    .text(function(d) {
      return d.key.replace(/_/g, " ");
    })
    .style("fill", function(d) {
      var splitName = d.name.split(".");
      var group = splitName[1];
      return color(group);
    })
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

    /*
    .transition()
      .duration(1000)
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ")" + (d.x < 180 ? "" : "rotate(180)"); })
      */
    /*
    //working transition

    .transition()
      .duration(2000)
      .text(function(d) {
        return d.key.replace(/_/g, " ");
      })
      .style('fill', 'red');
      */    

  node.exit().remove();  
  
  function mouseover(d) {
    let splitName = d.name.split(".");
    let groupKey = splitName[1];

    d3.select(this).style("cursor", "pointer"); 
    d3.select(this).style("font-weight", "bolder"); 
    d3.select(this)
    .transition()		
    .duration(200)		
    .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 20) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })


    svg
      .selectAll("path.link.target-" + d.key)
      .classed("target", true)
      .each(updateNodes("source", true))
      .style("stroke", function() {
        return color(groupKey);
      });

    svg
      .selectAll("path.link.source-" + d.key)
      .classed("source", true)
      .each(updateNodes("target", true))
      .style("stroke", function() {
        return color(groupKey);
      });


      tooltip
      .transition()		
      .duration(200)		
      .style("opacity", .9);		
      tooltip
      .html(d.key + "<br/>")	
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px");

      /*

    tooltip
      .transition()		
      .duration(duration)		
      .style("opacity", .9);		

    tooltip
      .html(d.key + "<br/>")	
      .style("left", (d.x) + "px")
      .style("top", (d.y - 28) + "px");
      */
  }

  function mouseout(d) {

    d3.select(this).style("cursor", "default"); 
    d3.select(this).style("font-weight", "normal"); 

    d3.select(this)
    .transition()		
    .duration(200)		
    .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })

    svg
      .selectAll("path.link.source-" + d.key)
      .classed("source", false)
      .each(updateNodes("target", false));

    svg
      .selectAll("path.link.target-" + d.key)
      .classed("target", false)
      .each(updateNodes("source", false));
      
    tooltip
      .transition()		
      .duration(duration)		
      .style("opacity", 0);      

    resetLinkColor();
  }

  /** LINKS  */
  var link = svg.selectAll("path.link").data(links);

  link
  .enter()
  .insert('svg:path');

  var totalLength = link.node().getTotalLength();

  link
  .attr("d", function(d, i) {
    return line(splines[i]);
  })
  .attr("class", function(d) {
    return (
      "link source-" +
      d.source.key +
      " target-" +
      d.target.key +
      " group-" +
      d.source.parent.key
    );
  })
   /** working transition */
   /*
  .attr("stroke-dasharray", totalLength + " " + totalLength)
  .attr("stroke-dashoffset", totalLength)
  
  .transition()
    .duration(500)
    .ease("linear")
    .attr("stroke-dashoffset", 0);
    */ 
  
  link.exit().remove();
  

  /*
  function removeNode(d){ 

    console.log('removeNode ', d);
    
    let newData = jsonData.filter(function(el) { return el.name != d.name; }); 
    newData = newData.map((item) => {         
      let importIndex = item.imports.indexOf(d.name);
      if(importIndex != -1){       
        item.imports.splice(importIndex, 1); 
      }     
      return item;     
    })     
    updateBundle(newData);
  }
  */


  function toggleNode(name){    
    
    console.log('toggleNode ', name);

    let item = jsonData.find((el) => {el.name === name}); 
    let newData;

    if(item){      
      //REMOVE ITEM

      newData = jsonData.filter(function(el) { return el.name != name; }); //remove the item from colletion
      newData = newData.map((item) => {         
        let importIndex = item.imports.indexOf(name);
        if(importIndex != -1){       
          item.imports = item.imports.splice(importIndex, 1);
          if(!item._imports) 
            item._imports = [];
          item._imports.push(name); //save name reference
        }     
        return item;     
      })   

    }else{
      
      //RESTORE ITEM
      newData = jsonData.map((item) => {         
        if(item._imports){
          let importIndex = item._imports.indexOf(name);
          if(importIndex != -1){
            item._imports = item._imports.splice(importIndex, 1);
            item.imports.push(name);
          }
        }      
        return item;     
      })   
      var itemToRestore = jsonDataBackup.find((el) => {return el.name === name});
      newData.push(itemToRestore);
    }
    
    updateBundle(newData);

  }
  
/** GROUP ARCS */
var groupArc = d3.svg.arc()
.innerRadius(ry - 177)
.outerRadius(ry - 157)
.startAngle(function(d) {
  return ((findStartAngle(d.__data__.children) - 2) * Math.PI) / 180;
})
.endAngle(function(d) {
  return ((findEndAngle(d.__data__.children) + 2) * Math.PI) / 180;
});

var groupData = svg.selectAll("g.group")
.data(
  nodes.filter(function(d) {
    return (
      (d.key == "Bayard" ||
        d.key == "Freelance" ||
        d.key == "Jobs" ||
        d.key == "analytics" ||
        d.key == "animate" ||
        d.key == "data" ||
        d.key == "physics" ||
        d.key == "query" ||
        d.key == "scale" ||
        d.key == "util" ||
        d.key == "vis" ||
        d.key == "tris" ||
        d.key == "entity" ||
        d.key == "crop" ||
        d.key == "month" ||
        d.key == "interest" ||
        d.key == "international" ||
        d.key == "national" ||
        d.key == "AllScales" ||
        d.key == "local") &&
      d.children
    );
  })
)
groupData
  .enter()
  .append("group")
  .attr("class", function(d) {
    return d.key;
  });
groupData.exit().remove(); 

var arcs = svg.selectAll(".arc").data(groupData[0]);  
  arcs
    .enter()
    .append("text");      
  arcs    
    .attr("class", "arc")
    .attr("transform", function(d) {
      let c = groupArc.centroid(d);
      return "translate(" + c[0] * 1.4 + "," + c[1] * 1.4 + ")";
    })
    .attr("text-anchor", "middle")
    .text(function(d) {
      return $(d).attr("class");
    })
    .attr("fill", function(d, i) {
      return color($(d).attr("class"));
    });
  arcs.on("mouseup", groupClick);
  arcs.on("mouseover", function(d){
    d3.select(this).style("cursor", "pointer"); 
    d3.select(this).style("font-weight", "bold"); 
  })
  arcs.on('mouseout', function(){
    d3.select(this).style("font-weight", "normal"); 
  })
  arcs.transition().duration(duration);    
  arcs.exit().remove();
}

/* UTILS */
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function resetLinkColor() {
  svg.selectAll("path.link").style("stroke", function(d) {
    return line_color;
  });
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
