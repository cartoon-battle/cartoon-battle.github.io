/* global define */ define(['react', 'cartoon-battle/config'], function (React, config) {
    var $ = React.createElement;

    var ItemButton = React.createClass({
        "displayName": "ItemButton",
        "propTypes": {
            "onChange": React.PropTypes.func,
            "item": React.PropTypes.shape({
                "label": React.PropTypes.string.isRequired,
                "value": React.PropTypes.string.isRequired
            }).isRequired,
            "imagePath": React.PropTypes.string,
            "active": React.PropTypes.bool,
            "width": React.PropTypes.number.isRequired,
            "height": React.PropTypes.number.isRequired
        },
        "getDefaultProps": function () {
            return {
                "active": false,
                "onChange": function () {
                }
            }
        },
        "onClick": function () {
            this.props.onChange(this.props.item.value, !this.props.active);
        },
        render: function () {
            var className = this.props.active ? "btn-info active" : "btn-default";

            return $('button', {"type": "button", "className": "btn " + className, "onClick": this.onClick},
                this.props.imagePath ? $('img', {
                    "src": config.images_cdn + this.props.imagePath.replace("%s", this.props.item.value),
                    "alt": this.props.item.label,
                    "title": this.props.item.label,
                    "width": this.props.width,
                    "height": this.props.height
                }) : this.props.item.label
            )
        }
    });

    var ItemFilter = React.createClass({
        "displayName": "ItemFilter",
        "propTypes": {
            "label": React.PropTypes.string,
            "onChange": React.PropTypes.func,
            "selected": React.PropTypes.arrayOf(React.PropTypes.string),
            "items": React.PropTypes.arrayOf(React.PropTypes.oneOfType([
                React.PropTypes.string,
                React.PropTypes.shape({
                    "value": React.PropTypes.string.isRequired,
                    "label": React.PropTypes.string.isRequired
                })
            ])),
            "width": React.PropTypes.number.isRequired,
            "height": React.PropTypes.number.isRequired,
            "imagePath": React.PropTypes.string
        },
        "getInitialState": function () {
            return {
                "items": this.props.selected
            };
        },
        "getDefaultProps": function () {
            return {
                "onChange": function () {
                },
                "selected": [],
                "label": "Show results for selected cards:"
            }
        },
        "onChange": function (item, value) {
            var items = this.state.items;

            if (value && !~items.indexOf(item)) {
                items = items.concat(item);
            } else if (!value) {
                items = items.filter(function (compare) {
                    return item !== compare;
                });
            }

            this.setState({"items": items});
            this.props.onChange(items);
        },
        render: function () {
            return $('div', {},
                $('div', {"className": "form-group"}, $("label", {}, this.props.label)),
                $('div', {"className": "btn-group btn-group-lg", "role": "group"},
                    this.props.items.map(function (item) {
                        if ("string" === typeof item) {
                            item = {value: item, label: item};
                        }

                        return $(ItemButton, {
                            "item": item,
                            "key": item.value,
                            "active": !!~this.state.items.indexOf(item.value),
                            "imagePath": this.props.imagePath,
                            "width": this.props.width,
                            "height": this.props.height,
                            "onChange": this.onChange
                        })
                    }.bind(this))
                )
            );
        }
    });

    return function (props) {
        return React.createElement(ItemFilter, props);
    }
});
