define(['cartoon-battle/config', 'cartoon-battle/Rarity'], function (config, Rarity) {

if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    'use strict';
    if (this == null) {
      throw new TypeError('can\'t convert ' + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    if (count != count) {
      count = 0;
    }
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    if (count == Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
      return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }
    var rpt = '';
    for (var i = 0; i < count; i++) {
      rpt += str;
    }
    return rpt;
  }
}
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
      // Function.prototype doesn't have a prototype property
      fNOP.prototype = this.prototype; 
    }
    fBound.prototype = new fNOP();

    return fBound;
  };
}

    if (typeof Object.assign != 'function') {
        Object.assign = function(target, varArgs) { // .length of function is 2
            'use strict';
            if (target == null) { // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource != null) { // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    if (typeof Object.create != 'function') {
        Object.create = (function(undefined) {
            var Temp = function() {};
            return function (prototype, propertiesObject) {
                if(prototype !== null && prototype !== Object(prototype)) {
                    throw TypeError('Argument must be an object, or null');
                }
                Temp.prototype = prototype || {};
                var result = new Temp();
                Temp.prototype = null;
                if (propertiesObject !== undefined) {
                    Object.defineProperties(result, propertiesObject);
                }

                // to imitate the case of Object.create(null)
                if(prototype === null) {
                    result.__proto__ = null;
                }
                return result;
            };
        })();
    }

    function make_api_call(message, params, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://cb-live.synapse-games.com/api.php?message=' + message);
        xhr.onload = function () {
            cb && cb(JSON.parse(xhr.responseText));
        };
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        params = Object.assign(params, {
            user_id: params.user_id || 7232069,
            password: params.password || '1027fd20001a5e38de00a7d35c257c58'
        });

        xhr.send(Object.keys(params).map(function (name) {
            return name + '=' + encodeURIComponent(params[name])
        }).join('&'));
    }

    function get_user_info(user_id, cb, credentials) {
        credentials = credentials || window.localStorage || {};

        make_api_call('getUserProfile', {
            "target_user_id": user_id,
            "user_id": credentials.user_id,
            "password": credentials.password
        }, cb);
    }

    function object_to_array(object) {
        return object ? Object.keys(object).map(function (key) {
            return object[key];
        }) : [];
    }

    function util__slugify(name) {
        return name.replace(/[^\d\w -]/g, '').replace(/ /g, '-').toLowerCase();
    }


    function rarities__filter(rarities) {
        return function (card) {
            return 0 === rarities.length || !!~rarities.indexOf(config.rarities[card.rarity-1]);
        }
    }

    return {
        "slugify": util__slugify,

        "get_user_info": get_user_info,
        "make_api_call": make_api_call,

        "object_to_array": object_to_array,

        "card_with_level_re": /^\s*(.+?)(?:\s+((\d+|\^)\s*[*]{0,2}))?\s*$/,

        "rarities_filter": rarities__filter,

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
