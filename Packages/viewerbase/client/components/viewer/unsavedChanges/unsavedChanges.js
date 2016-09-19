
ViewerBase.UnsavedChanges = (function () {

    var API, rootTree = {};

    function createNode(name, hasChildren) {

        var node = { name: name };

        if (hasChildren) {
            node.type = 'tree';
            node.children = {};
        } else {
            node.type = 'leaf';
            node.value = 1;
        }

        return node;

    }

    function addNode(tree, path) {

        var node, result = false, name = path.shift();

        if (name !== '*') { // "*" is a special name which means "all children"
            if (name in tree) {
                node = tree[name];
                if (path.length > 0) {
                    result = node.type === 'tree' && addNode(node.children, path);
                } else if (node.type === 'leaf') {
                    node.value++;
                    result = true;
                }
            } else {
                node = createNode(name, path.length > 0);
                if (node.type !== 'tree' || addNode(node.children, path)) {
                    tree[name] = node;
                    result = true;
                }
            }
        }

        return result;

    }

    function removeNode(tree, path) {

        var node, result = false, name = path.shift();

        if (name === '*') {
            for (name in tree) {
                delete tree[name];
            }
            result = true;
        } else if (name in tree) {
            if (path.length === 0) {
                delete tree[name];
                result = true;
            } else {
                node = tree[name];
                if (node.type === 'tree') {
                    result = removeNode(node.children, path);
                }
            }
        }

        return result;

    }

    function probeNode(tree, path) {

        var node, result = 0, name = path.shift();

        if (name === '*') {
            for (name in tree) {
                node = tree[name];
                if (node.type === 'leaf') {
                    result += node.value;
                } else {
                    path.unshift('*');
                    result += probeNode(node.children, path);
                }
            }
        } else if (name in tree) {
            node = tree[name];
            if (node.type === 'tree') {
                if (path.length === 0) {
                    path.unshift('*');
                }
                result = probeNode(node.children, path);
            } else {
                result = path.length === 0 ? node.value : 0;
            }
        }

        return result;

    }

    // define exposed API
    API = {
        set: function (name) {
            if (typeof name !== 'string') {
                return false;
            }
            return addNode(rootTree, name.split('.'));
        },
        clear: function (name) {
            if (typeof name !== 'string') {
                return false;
            }
            return removeNode(rootTree, name.split('.'));
        },
        probe: function (name) {
            if (typeof name !== 'string') {
                return 0;
            }
            return probeNode(rootTree, name.split('.'));
        },
        prompt: function (name, options, callback) {
            if (API.probe(name) > 0) {
                ViewerBase.UnsavedChangesDialog.show(callback, options);
            } else if (typeof callback === 'function') {
                callback.call(null, true);
            }
        }
    };

    return API;

}());
