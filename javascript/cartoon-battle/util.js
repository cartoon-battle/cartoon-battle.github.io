define(function () {
    return {
        "slugify": function util__slugify(name) {
            return name.replace(/[^\d\w -]/g, '').replace(/ /g, '-').toLowerCase();
        },

        "clone": function util__clone(obj) {
            if (null == obj || "object" !== typeof obj) return obj;
            var copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = util__clone(obj[attr]);
            }
            return copy;
        },

        "cleanElement": function util__cleanElement(e) {
            while (e && e.firstChild) {
                e.removeChild(e.firstChild)
            }

            return e;
        },

        "createFragment": function util__createFragment(name, children) {
            var element = document.createElement(name);
            for (var i = 0, cn; cn = children[i]; i++) {
                element.appendChild(
                    2 === cn.length ? util__createFragment(cn[0], cn[1]) : document.createElement(cn)
                )
            }

            return element;
        },

        "createTable": function util__createTable(data, keys) {
            if (!data.length) {
                return ;
            }

            function row(data, type) {
                return data.map(function (name) {
                    return document.createElement(type || 'td').appendChild(document.createTextNode(name)).parentNode;
                }).reduce(function (tr, node) {
                    return tr.appendChild(node).parentNode;
                }, document.createElement('tr'));
            }

            keys = keys || Object.keys(data[0]);

            var table = document.createElement('table');
            table.className = 'table table-striped';


            table.appendChild(document.createElement('thead').appendChild(row(keys, 'th')).parentNode);

            return data.reduce(function (tbody, item) {
                return tbody.appendChild(row(Object.keys(item).map(function (k) { return item[k]; }))).parentNode;
            }, table.appendChild(document.createElement('tbody'))).parentNode;
        }
    }
});