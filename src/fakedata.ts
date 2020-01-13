
export default function gen_fake_data (size, group) {

    var random_int = function (max) {
        return Math.floor(Math.random() * max);
    };

	var nodes = [];
	var links = [];

	var root = {
		name: "root",
		imports: []
	};
	nodes.push(root);

    
	for (var i = 0; i < group; i ++) {
		var np = {
			name: "parent " + i,
			group: i,
			parent: root,
			imports: []
		};
		nodes.push(np);
		root.imports.push(np);
    }
    
	
	for (var i = 0; i < size; i ++) {
		var g = random_int(group);
		var nd = {
			name: "node " + i,
			group: g,
			parent: nodes[g + 1]
		};
		nodes.push(nd);
		nodes[g + 1].imports.push(nd);
	}
	for (var i = 0; i < Math.log2(size) * size; i ++) {
		var s = random_int(size) + group + 1;
		var e = s;
		while (e == s) {
			e = random_int(size) + group + 1;
		}
		links.push({
			source: nodes[s],
			target: nodes[e]
		});
    }
    
    return nodes;
	return {
		nodes: nodes,
		links: links
	};
};
