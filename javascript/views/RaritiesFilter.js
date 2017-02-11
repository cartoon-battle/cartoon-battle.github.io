/* global define */ define(['react', 'cartoon-battle/config'], function (React, config) {
    var $ = React.createElement;

    var RarityButton = React.createClass({
        "propTypes": {
            "onChange": React.PropTypes.func,
            "rarity": React.PropTypes.string.isRequired,
            "active": React.PropTypes.bool
        },
        "getDefaultProps": function () {
            return {
                "active": false,
                "onChange": function () {}
            }
        },
        "onClick": function () {
            this.props.onChange(this.props.rarity, !this.props.active);
        },
        render: function () {
            var className = this.props.active ? "btn-info active" : "btn-default";

            return $('button', {"type": "button", "className": "btn " + className, "onClick": this.onClick},
                $('img', {
                    "src": config.images_cdn + "icons/rarityicon_" + this.props.rarity + ".png",
                    "alt": this.props.rarity,
                    "title": this.props.rarity,
                    "width": 64,
                    "height": 48
                })
            )
        }
    });

    var RarityFilter = React.createClass({
        "propTypes": {
            "label": React.PropTypes.string,
            "onChange": React.PropTypes.func,
            "selected": React.PropTypes.arrayOf(React.PropTypes.string),
            "rarities": React.PropTypes.arrayOf(React.PropTypes.string)
        },
        "getInitialState": function () {
            return {
                "rarities": this.props.selected
            };
        },
        "getDefaultProps": function () {
            return {
                "rarities": config.rarities,
                "onChange": function () {},
                "selected": [],
                "label": "Show results for cards of selected rarity:"
            }
        },
        "onChange": function (rarity, value) {
            var rarities = this.state.rarities;

            if (value && !~rarities.indexOf(rarity)) {
                rarities = rarities.concat(rarity);
            } else if (!value) {
                rarities = rarities.filter(function(item) { return item !== rarity; });
            }

            this.setState({"rarities": rarities});
            this.props.onChange(rarities);
        },
        render: function () {
            return $('div', {},
                $('div', {"className": "form-group"}, $("label", {}, this.props.label)),
                $('div', {"className": "btn-group btn-group-lg", "role": "group"},
                    this.props.rarities.map(function (rarity) {
                        return $(RarityButton, {
                            "rarity": rarity,
                            "key": rarity,
                            "active": !!~this.state.rarities.indexOf(rarity),
                            "onChange": this.onChange
                        })
                    }.bind(this))
                )
            );
        }
    });

    return function (props) {
        return React.createElement(RarityFilter, props);
    }
});