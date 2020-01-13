/* --------------------------------------------------------- */
/* UPDATE CIRCLES EXAMPLE                                    */
/* --------------------------------------------------------- */
//import * as d3 from "d3";
import responsivefy from "./responsivefy.ts";
import packageHierarchy from "./packageHierarchy.ts";
import packageImports from "./packageImports.ts";
import getDivWidth from "./getDivWidth.ts";

export default function drawCircles(jsonData) {
  var color = d3.scale.category20();

  var my_nodes = [
    {
      cluster: 0,
      x: 50,
      y: 50
    },
    {
      cluster: 0,
      x: 100,
      y: 50
    },
    {
      cluster: 1,
      x: 100,
      y: 100
    }
  ];
  const divWidth = getDivWidth(".container-chart");
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const width = divWidth - margin.left - margin.right;
  const height = divWidth - margin.top - margin.bottom;

  let w = width,
        h = height,
        rx = w / 2,
        ry = h / 2,
        m0,
        rotate = 0;

  var div = d3
    .select(".container-chart")
    .append("svg")
    .style("width", w + "px")
    .style("height", w + "px")    

  let svg = div
    .append("svg:svg")
    .attr("width", w)
    .attr("height", w)
    .append("svg:g")
    .attr("transform", "translate(" + rx + "," + ry + ")");

  function update() {
    circles
      .attr("cx", function(d) {
        return d.x;
      })
      .attr("cy", function(d) {
        return d.y;
      })
      .attr("r", 20)
      .style("fill", function(d) {
        return color(d.cluster);
      });
  }

  var nodes = svg
    .selectAll("circle.node")
    .data(my_nodes)
    .enter()
    .append("g")
    .attr("class", "node");
  // .append("svg:circle");

  var circles = nodes.append("svg:circle");

  update();

  setTimeout(function() {
    var new_nodes = [
      { cluster: 0, x: 50, y: 50 },
      { cluster: 2, x: 100, y: 50 },
      { cluster: 2, x: 100, y: 100 }
    ];
    nodes.data(new_nodes);
    // propagate the data from parent (nodes) to child (circle).
    nodes.select("circle");
    update();
  }, 2000);
}
