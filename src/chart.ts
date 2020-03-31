/* --------------------------------------------------------- */
/* DRAW CHART                                                */
/* --------------------------------------------------------- */
//import * as d3 from "d3";

import packageHierarchy from "./packageHierarchyReal.ts";
import packageImports from "./packageImportsReal.ts";
import getDivWidth from "./getDivWidth.ts";

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


export default function drawChart(data) {
 
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

  bundle = d3.layout.bundle();
  update(data);
}

/** WORKING DATA UPDATE  */
function update(data) {

  var nodes = cluster.nodes(packageHierarchy(data));
  var links = packageImports(nodes);


  updateNodes(nodes);
  updateLinks(links);
  
}

let updateLinks = (links) => {
/** LINKS  */
  let splines = bundle(links);
  let link = svg.selectAll("path.link").data(links);
  //let totalLength = link.node().getTotalLength();

  link
  .enter()
  .insert('svg:path');

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
   
}

let updateNodes = (nodes) => {

  /* NODES  */
  let node = svg
          .selectAll(".node")
          .data(nodes.filter(function(n) {return !n.children;})); 
  node
    .enter()
    .append("text"); 

  node
    .attr("class", "node")
    .attr("dy", ".31em")    
    .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
    .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
    .text(function(d) {
      return d.name;
    })
    .style("fill", function(d) {
      var splitName = d.name.split(".");
      var group = splitName[1];
      return color(group);
    })
  
  node
    .exit()
    .remove();  
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
