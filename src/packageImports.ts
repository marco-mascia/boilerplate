//import * as d3 from "d3";

// Return a list of imports for the given array of nodes.
export default function packageImports(nodes) {
  var map = {},
    imports = [];

  // Compute a map from name to node.
  nodes.forEach(function(d) {
    map[d.name] = d;
  });

  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
    if (d.imports)
      d.imports.forEach(function(i) {
        imports.push({ source: map[d.name], target: map[i] });
      });
  });

  return imports;
}
