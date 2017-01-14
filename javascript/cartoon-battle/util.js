define(['cartoon-battle/config', 'cartoon-battle/Rarity'], function (config, Rarity) {
    function util__slugify(name) {
        return name.replace(/[^\d\w -]/g, '').replace(/ /g, '-').toLowerCase();
    }

    return {
        "slugify": util__slugify,

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

        "rarityCounter": function util__rarityCounter(data) {
            return [1,2,3,4].map(function (key) {
                return {
                    rarity: new Rarity(key),
                    count: data[key] || 0
                }
            }).reduce(function (div, item) {
                div.className = 'btn-group btn-counter';

                var img = document.createElement('img');
                img.src = config.images_cdn + "icons/rarityicon_" + item.rarity.name + ".png";
                img.alt = item.rarity.name;

                var button = document.createElement('button');
                button.setAttribute('type', 'button');
                button.className = 'btn btn-default';

                button.appendChild(document.createTextNode(item.count + ' '));
                button.appendChild(img);

                div.appendChild(button);

                return div;

            }, document.createElement('div'));
        },

        "createTable": function util__createTable(data, keys) {
            if (!data.length) {
                return ;
            }

            function row(data, type) {
                return data.map(function (name) {
                    var element = document.createElement(type || 'td');

                    if ('TH' === element.nodeName && "string" === typeof name) {
                        element.className = util__slugify(name);
                    }

                    return element.appendChild(
                        "function" === typeof name ? name() : document.createTextNode(name)
                    ).parentNode;
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