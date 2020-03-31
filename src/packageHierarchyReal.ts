//import * as d3 from "d3";
// Lazily construct the package hierarchy from class names.

export default function packageHierarchy(classes) {

    console.log("classes ", classes);
    
    var map = {};

    function find(id, data) {    
      var node = map[id], i;    
      if (!node) {
        node = map[id] = data || {id: id, children: []};
        if (id.length) {
          node.parent = find(id.substring(0, i = id.lastIndexOf("__")));
          node.parent.children.push(node);
          node.key = id.substring(i + 1);
        }
      }      
      return node;
    }

    classes.forEach(function(d) {      
        find(d.id, d);
    });

    return map[""];
}