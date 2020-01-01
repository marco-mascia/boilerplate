import './scss/main.scss';
import flare from '../assets/flare.json';
import * as d3 from "d3";


import(
    '../assets/grafo.json'
).then(({ default: jsonData }) => {
    console.log('jsonData ', jsonData);
    //drawGraph(jsonData);
});

export function init() {
    console.log('init')
}




export function drawGraph(jsonData) {

    console.log('drawGraph')
    var width = 960,
        height = 500,
        root;

    var force = d3.layout.force()
        .linkDistance(80)
        .charge(-120)
        .gravity(.05)
        .size([width, height])
        .on("tick", tick);

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var link = svg.selectAll(".link"),
        node = svg.selectAll(".node");

    /*
d3.json(jsonData, function(error, json) {
  if (error) throw error;
  root = json;
  update();
});
*/

    root = jsonData;
    update();

    function update() {
        var nodes = flatten(root),
            links = d3.layout.tree().links(nodes);

        // Restart the force layout.
        force
            .nodes(nodes)
            .links(links)
            .start();

        // Update links.
        link = link.data(links, function (d) { return d.target.id; });

        link.exit().remove();

        link.enter().insert("line", ".node")
            .attr("class", "link");

        // Update nodes.
        node = node.data(nodes, function (d) { return d.id; });

        node.exit().remove();

        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .on("click", click)
            .call(force.drag);

        nodeEnter.append("circle")
            .attr("r", function (d) { return Math.sqrt(d.size) / 10 || 4.5; });

        nodeEnter.append("text")
            .attr("dy", ".35em")
            .text(function (d) { return d.name; });

        node.select("circle")
            .style("fill", color);
    }

    function tick() {
        link.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    }

    function color(d) {
        return d._children ? "#3182bd" // collapsed package
            : d.children ? "#c6dbef" // expanded package
                : "#fd8d3c"; // leaf node
    }

    // Toggle children on click.
    function click(d) {
        if (d3.event.defaultPrevented) return; // ignore drag
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update();
    }

    // Returns a list of all nodes under the root.
    function flatten(root) {
        var nodes = [], i = 0;

        function recurse(node) {
            if (node.children) node.children.forEach(recurse);
            if (!node.id) node.id = ++i;
            nodes.push(node);
        }

        recurse(root);
        return nodes;
    }

}


//init();


import(
    '../assets/flare.json'
).then(({ default: jsonData }) => {

    //console.log(jsonData);
    //console.log(jsonData.length);
    //drawHierarchicalEdge(jsonData);

    setTimeout(function () {
        //let newData = { "name": "flare.lab Jester", "size": 3534, "imports": ["flare.month.SEPTEMBER", "flare.month.OCTOBER"] }
        //jsonData.push(newData);
        //console.log(jsonData);
        //console.log(jsonData.length);
        //drawHierarchicalEdge(jsonData);
    }, 5000);
});

import drawChart from './chart.ts'
import(
    '../assets/flare.json'
).then(({ default: jsonData }) => {

    drawChart(jsonData);

  
});



export function drawHierarchicalEdge(jsonData) {


var root, svg, link, node;
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

const diameter = 1152,
    radius = diameter / 2,
    innerRadius = radius - 300;

const cluster = d3.cluster()
    .size([360, innerRadius]);

const line = d3.radialLine()
    .curve(d3.curveBundle.beta(0.85))
    .radius(function (d) { return d.y; })
    .angle(function (d) { return d.x / 180 * Math.PI; });

svg = d3.select(".container-chart")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-576 -576 1152 1152")
    .classed("svg-content", true);
svg
    .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")")
    .transition();

    link = svg.append("g").selectAll(".link"),
    node = svg.append("g").selectAll(".node");

    root = packageHierarchy(jsonData)
        .sum(function (d) { return d.size; });
    update();


    function mouseovered(d) {
        node
            .each(function (n) { n.target = n.source = false; });

        link
            .classed("link--target", function (l) { if (l.target === d) return l.source.source = true; })
            .classed("link--source", function (l) { if (l.source === d) return l.target.target = true; })
            .filter(function (l) { return l.target === d || l.source === d; })
            .raise();

        node
            .classed("node--target", function (n) { return n.target; })
            .classed("node--source", function (n) { return n.source; });

        div
            .transition()
            .duration(200)
            .style("opacity", .9);
        div
            .html(d.data.key + "<br/>")
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    }

    function mouseouted(d) {
        link
            .classed("link--target", false)
            .classed("link--source", false);

        node
            .classed("node--target", false)
            .classed("node--source", false);
        div
            .transition()
            .duration(500)
            .style("opacity", 0);
    }
    
    function update() {
        //var svg = d3.select("body").transition();
        
        cluster(root);
    
        var x = packageImports(root.leaves());
    
        var arr = [], arr2 = [];
        for (var i = 0; i < x.length; i++) {
            arr.push(x[i][0].data.key);
            arr2.push(x[i][x[i].length - 1].data.key);
        }
        
        link = link
            .data(packageImports(root.leaves()))
            .enter().append("path")
            .each(function (d) { d.source = d[0], d.target = d[d.length - 1]; })
            .attr("class", "link")
            .attr("d", line);
    
        link
            .exit()
            .remove();
            
    
        node = node
            .data(root.leaves())
            .enter().append("a")
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
            .merge(node);
        
        node
            .exit()
            .remove();
    }

}





// Lazily construct the package hierarchy from class names.
export function packageHierarchy(classes) {
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
export function packageImports(nodes) {
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

import drawCircle from './circle.ts'
drawCircle();

/* --------------------------------------------------------- */

