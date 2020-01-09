


export default function drawGraph(jsonData) {

    console.log('drawChartFiltered data: ', jsonData);

  var diameter = 960,
    radius = diameter / 2,
    innerRadius = radius - 120;

  var cluster = d3.layout.cluster().size([360, innerRadius]);  

  var bundle = d3.layout.bundle();

  var line = d3.svg.line
    .radial()
    .interpolate("bundle")
    .tension(0.85)
    .radius(function(d) {return d.y;})
    .angle(function(d) {return (d.x / 180) * Math.PI;});

  var canvas = d3
    .select(".container-chart")
    .append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")")
    .append("g");

  updateBundle(jsonData);

  function updateBundle(data) {     

    var nodes = cluster.nodes(packageHierarchy(data));
    var links = packageImports(nodes);

    var link = canvas.selectAll(".link").data(bundle(links));
    var node = canvas.selectAll(".node").data(
      nodes.filter(function(n) {
        return !n.children;
      })
    );

    link.enter().append("path");

    //link.transition().duration(500);

    link
      .each(function(d) {
        (d.source = d[0]),
          (d.target = d[d.length - 1]),
          (d.link_color = d.source.link_colors[d.target.keyname]),
          (d.link_weight = d.source.link_weights[d.target.keyname]);
      })
      .attr("class", "link")
      .attr("d", line)
      .style("stroke", function(d) {
        return d.link_color;
      });

    node.enter().append("text");

    //node.transition().duration(500);

    node
      .attr("class", "node")
      .attr("dy", ".31em")
      .attr("transform", function(d) {
        return (
          "rotate(" +
          (d.x - 90) +
          ")translate(" +
          (d.y + 8) +
          ",0)" +
          (d.x < 180 ? "" : "rotate(180)")
        );
      })
      .style("text-anchor", function(d) {
        return d.x < 180 ? "start" : "end";
      })
      .text(function(d) {
        return d.name;
      })
      .style("fill", function(d) {
        return d.node_color;
      })
      .on("mouseover", mouseovered)
      .on("mouseout", mouseouted);

    node.exit().remove();
    link.exit().remove();

    function mouseovered(d) {
      node.each(function(n) {
        n.target = n.source = false;
      });

      link
        .classed("link--target", function(l) {
          if (l.target === d) return (l.source.source = true);
        })
        .classed("link--source", function(l) {
          if (l.source === d) return (l.target.target = true);
        })
        .filter(function(l) {
          return l.target === d || l.source === d;
        })
        .each(function() {
          this.parentNode.appendChild(this);
        });

      node
        .classed("node--both", function(n) {
          return n.source && n.target;
        })
        .classed("node--target", function(n) {
          return n.target;
        })
        .classed("node--source", function(n) {
          return n.source;
        });
    }

    function mouseouted(d) {
      link.classed("link--target", false).classed("link--source", false);

      node
        .classed("node--both", false)
        .classed("node--target", false)
        .classed("node--source", false);
    }

    //d3.select(self.frameElement).style("height", diameter + "px");

    function packageHierarchy(classes) {        
      var map = {};
      
      function find(keyname, data) {
        var node = map[keyname],
          i;
        if (!node) {
          node = map[keyname] = data || { keyname: keyname, children: [] };
          if (keyname.length) {
            node.parent = find(
              keyname.substring(0, (i = keyname.lastIndexOf("#")))
            );
            node.parent.children.push(node);
            node.key = keyname.substring(i + 1);
          }
        }
        return node;
      }
     




      classes.forEach(function(d) {
        find(d.keyname, d);
      });

      return map[""];
    }

    function packageImports(nodes) {
      var map = {},
        imports = [];

      nodes.forEach(function(d) {
        map[d.keyname] = d;
      });

      nodes.forEach(function(d) {
        if (d.imports)
          d.imports.forEach(function(i) {
            imports.push({ source: map[d.keyname], target: map[i] });
          });
      });

      return imports;
    }
  }

  d3.select("input[type=range]").on("change", function() {
    //d3.selectAll("svg > *").remove();

    updateBundle(jsonData);
    let flareData = eval(filterData(+this.value));
    updateBundle(flareData);
  });

  function filterData(thresh) {
    //let flData = eval(Object.assign([], flareData));

    var FlareData = [];
    var data = [];
    var allImports = [];

    //Remove nodes from imports with weight below threshold
    for (var i = 0; i < jsonData.length; i++) {
      var flare = jsonData[i];

      var link_weights = flare.link_weights;
      var link_colors = flare.link_colors;
      var imports = flare.imports;

      var newLink_weights = {};
      var newLink_colors = {};
      var newImports = [];

      for (const [key, value] of Object.entries(link_weights)) {
        if (value > thresh / 100) {
          newLink_weights[key] = value;
          newLink_colors[key] = link_colors[key];
          newImports.push(key);
          allImports.push(key);
        }
      }

      flare.link_weights = newLink_weights;
      flare.link_colors = newLink_colors;
      flare.imports = newImports;

      data.push(flare);
    }

    //Remove nodes with no links
    for (var j = 0; j < data.length; j++) {
      var flare = data[j];

      var keyName = flare.keyname;

      var index = allImports.indexOf(keyName);

      if (index >= 0) {
        FlareData.push(flare);
      }
    }

    return FlareData;
  }
}
