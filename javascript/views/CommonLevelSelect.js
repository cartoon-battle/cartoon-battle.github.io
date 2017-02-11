/* global define */ define(['react'], function (React) {
    var $ = React.createElement;

    var LevelSelect = React.createClass({
        "propTypes": {
            "onChange": React.PropTypes.func,
            "active": React.PropTypes.string,
            "options": React.PropTypes.object
        },
        "getDefaultProps": function () {
            return {
                "active": "^*",
                "options": {
                    "1": "unleveled cards",
                    "^": "unfused leveled",
                    "^*": "fused once leveled",
                    "^**": "maxed out"
                },
                "onChange": function () {}
            }
        },
        "onChange": function (event) {
            this.props.onChange(event.target.value);
        },
        render: function () {
            var options = this.props.options;

            return $('select', {
                "className": "form-control",
                "defaultValue": this.props.active,
                "onChange": this.onChange
            }, Object.keys(options).map(function (key) {
                return $('option', {
                    "key": key,
                    "value": key
                }, options[key])
            }));
        }
    });

    return function (props) {
        return React.createElement(LevelSelect, props);
    }
});