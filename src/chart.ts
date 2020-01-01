/* --------------------------------------------------------- */
/* DRAW CHART                                                */
/* --------------------------------------------------------- */
import * as d3 from "d3";


export default function drawChart(jsonData) {

    console.log('drawChart data: ', jsonData);


    const diameter = 1152,
        radius = diameter / 2,
        innerRadius = radius - 300;

    const cluster = d3.cluster()
        .size([360, innerRadius]);

    const line = d3.radialLine()
        .curve(d3.curveBundle.beta(0.85))
        .radius(function (d) { return d.y; })
        .angle(function (d) { return d.x / 180 * Math.PI; });


    const svg = d3.select(".container-chart")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-576 -576 1152 1152")
    .classed("svg-content", true);

    /*
    svg
    .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")")
    .transition();
    */

    const root = packageHierarchy(jsonData)
    .sum(function (d) { return d.size; });

    const plot = (root, svg) => {

        cluster(root);
    
        var x = packageImports(root.leaves());
    
        var arr = [], arr2 = [];
        for (var i = 0; i < x.length; i++) {
            arr.push(x[i][0].data.key);
            arr2.push(x[i][x[i].length - 1].data.key);
        }

        svg
            .enter()
            .append("g")
            .attr("transform", "translate(" + radius + "," + radius + ")")
            .transition();
        svg
            .exit()
            .transition()
            .attr('g', 0)
            .remove();

        let link = svg.selectAll(".link");

        link
            .data(packageImports(root.leaves()))
            .enter()
            .append("path")
            .each(function (d) { d.source = d[0], d.target = d[d.length - 1]; })
            .attr("class", "link")
            .attr("d", line);
 
        link
            .exit()
            .transition()
            .attr('r', 0)
            .remove();


        let node = svg.selectAll(".node");

        node
            .data(root.leaves())
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
            .merge(node);
        
        node
            .exit()
            .transition()
            .attr('r', 0)
            .remove();

    }

    plot(root, svg);

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
    setTimeout(function () {
        console.log(jsonData.length);
        //let newData = { "name": "flare.lab Jester", "size": 3534, "imports": ["flare.month.SEPTEMBER", "flare.month.OCTOBER"] }
        jsonData.pop();
        jsonData.pop();
        //jsonData.push(newData);
        //console.log(jsonData);
        console.log(jsonData.length);
debugger;
        let root = packageHierarchy(jsonData)
        .sum(function (d) { return d.size; });
        plot(root, svg);
        
    }, 5000);
  
}

/* --------------------------------------------------------- */