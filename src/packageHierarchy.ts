//import * as d3 from "d3";
// Lazily construct the package hierarchy from class names.

export default function packageHierarchy(classes) {
    var map = {};

    function find(name, data) {
      
      if (!name) {
        throw "Name is empty";
      }

      var node = map[name], i;
      if (!node) {
        node = map[name] = data || {name: name, children: []};
        if (name.length) {
          node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
          node.parent.children.push(node);
          node.key = name.substring(i + 1);
        }
      }
      return node;
    }

    classes.forEach(function(d) {      
        find(d.name, d);
    });

    return map[""];
}

