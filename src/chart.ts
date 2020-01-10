/* --------------------------------------------------------- */
/* DRAW CHART                                                */
/* --------------------------------------------------------- */
//import * as d3 from "d3";
import responsivefy from "./responsivefy.ts";
import packageHierarchy from "./packageHierarchy.ts";
import packageImports from "./packageImports.ts";
import getDivWidth from "./getDivWidth.ts";

export default function drawChart(jsonData) {

  const divWidth = getDivWidth(".container-chart");
  const diameter = divWidth,
    radius = diameter / 2,
    innerRadius = radius - divWidth / 7;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const width = divWidth - margin.left - margin.right;
  const height = divWidth - margin.top - margin.bottom;

  var color = d3.scale.category10();

  var w = width,
    h = height,
    rx = w / 2,
    ry = h / 2,
    m0,
    rotate = 0;

  var cluster = d3.layout
    .cluster()
    .size([360, ry - 180])
    .sort(function(a, b) {
      return d3.ascending(a.key, b.key);
    });

  var bundle = d3.layout.bundle();

  var line = d3.svg.line
    .radial()
    .interpolate("bundle")
    .tension(0.85)
    .radius(function(d) {
      return d.y;
    })
    .angle(function(d) {
      return (d.x / 180) * Math.PI;
    });

  // Chrome 15 bug: <http://code.google.com/p/chromium/issues/detail?id=98951>
  var div = d3
    .select(".container-chart")
    .style("width", w + "px")
    .style("height", w + "px")
    .style("position", "absolute");

  var svg = div
    .append("svg:svg")
    .attr("width", w)
    .attr("height", w)
    .append("svg:g")
    .attr("transform", "translate(" + rx + "," + ry + ")");

  svg
    .append("svg:path")
    .attr("class", "arc")
    .attr("d",
      d3.svg.arc()
        .outerRadius(ry - 180)
        .innerRadius(0)
        .startAngle(0)
        .endAngle(2 * Math.PI)
    )
    .on("mousedown", mousedown)
    .style("fill", function(d) {         
        //var splitName = d.name.split(".");             
        //var group = splitName[0] + '.' + splitName[1];            
        console.log(d);
        return null; 
    })

  var nodes = cluster.nodes(packageHierarchy(jsonData[2]));
  var links = packageImports(nodes);
  var splines = bundle(links);

  var path = svg
    .selectAll("path.link")
    .data(links)
    .enter()
    .append("svg:path")
    .attr("class", function(d) {
      return "link source-" + d.source.key + " target-" + d.target.key;
    })
    .attr("d", function(d, i) {
      return line(splines[i]);
    }) 

  var groupData = svg
    .selectAll("g.group")
    .data(
      nodes.filter(function(d) {
        return (
          //(d.key == "crop" || d.key == "month") 
          //(d.key == "analytics" || d.key == "animate" || d.key == "data" || d.key == "physics" || d.key == "query" || d.key == "scale" || d.key == "util" || d.key == "vis")
          (d.key == "interest" || d.key == "international" || d.key == "national" || d.key == "AllScales" || d.key == "local")
          && d.children
        );
      })
    )
    .enter()
    .append("group")
    .attr("class", "group");    

  var groupArc = d3.svg.arc()
    .innerRadius(ry - 177)
    .outerRadius(ry - 157)
    .startAngle(function(d) {      
      return ((findStartAngle(d.__data__.children) - 2) * Math.PI) / 180;
    })
    .endAngle(function(d) {      
      return ((findEndAngle(d.__data__.children) + 2) * Math.PI) / 180;
    });
    

  svg
    .selectAll("g.arc")
    .data(groupData[0])
    .enter()
    .append("svg:path")
    .attr("d", groupArc)
    .attr("class", "groupArc")
    .style("fill", "#1f77b4")
    .style("fill-opacity", 0.5) 
    

  svg
    .selectAll("g.node")
    .data(
      nodes.filter(function(n) {
        return !n.children;
      })
    )
    .enter()
    .append("svg:g")
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
        var group = splitName[0] + '.' + splitName[1];            
        return color(group); 
    })
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

  d3.select("input[type=range]").on("change", function() {
    line.tension(this.value / 100);
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
    svg
      .selectAll("path.link.target-" + d.key)
      .classed("target", true)
      .each(updateNodes("source", true));

    svg
      .selectAll("path.link.source-" + d.key)
      .classed("source", true)
      .each(updateNodes("target", true));
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
  }

  function updateNodes(name, value) {
    return function(d) {
      if (value) this.parentNode.appendChild(this);
      svg.select("#node-" + d[name].key).classed(name, value);
    };
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
/*
export function clicked(d, i) {
  debugger;
  console.log("i ", i);
  console.log("d ", d);
  debugger;
  node.attr("stroke", n => {
    if (d.data.name === n.data.name) return "black";
  });
}
*/

/* --------------------------------------------------------- */
