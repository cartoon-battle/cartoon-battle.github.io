/* global define */ define([
    'react',
    'cartoon-battle/util',
    'views/Kongregate/Authorization',
    'views/ButtonGroupFilter'
], function (React, util, Authorization, ButtonGroupFilter) {

    var e = React.createElement, PropTypes = React.PropTypes;

    var localStorage = window.localStorage || {};

    function get_stored_credentials() {
        if ('user_id' in localStorage) {
            return {
                user_id: localStorage['user_id'],
                password: localStorage['password']
            }
        }

        return null;
    }

    var Settings = React.createClass({
        displayName: "Settings",

        propTypes: {
            "onChange": PropTypes.func.isRequired,
            "data": PropTypes.object.isRequired,
            "form": PropTypes.object.isRequired
        },

        getInitialState: function () {
            return this.props.data;
        },

        saveSettings: function () {
            this.props.onChange(this.state);
        },

        render: function () {
            var enabled = this.state.enabled, setState = this.setState.bind(this);

            return e('div', {},
                e('button', {
                    className: "btn " + (enabled ? "btn-default active" : "btn-primary"),
                    onClick: function () {
                        setState({
                            enabled: !enabled
                        });
                    }
                }, this.props.form.children.enabled.label),
                e('div', {style: {display: enabled ? 'block' : 'none'}},
                    ButtonGroupFilter({
                        "label": this.props.form.children.settings.label,
                        "onChange": function (items) {
                            setState({
                                settings: items
                            })
                        },
                        "selected": this.state.settings,
                        "items": this.props.form.children.settings.choices,
                        "width": 0,
                        "height": 0
                    }),
                    ButtonGroupFilter({
                        "label": this.props.form.children.adventureMissions.label,
                        "onChange": function (items) {
                            setState({
                                adventureMissions: items
                            })
                        },
                        "selected": this.state.adventureMissions,
                        "items": this.props.form.children.adventureMissions.choices,
                        "width": 0,
                        "height": 0
                    })
                ),
                e('button', {
                    className: "btn btn-success",
                    onClick: this.saveSettings
                }, "Save settings")
            );
        }
    });
    var Farming = React.createClass({
        displayName: "Farming",

        componentDidMount: function () {
            this.saveSettings([]);
        },

        getInitialState: function () {
            return {
                form: null,
                farming: null,
                message: null,
                logs: null
            }
        },

        propTypes: {
            credentials: PropTypes.shape({
                "user_id": PropTypes.string.isRequired,
                "password": PropTypes.string.isRequired
            }).isRequired
        },

        saveSettings: function (data) {
            var setState = this.setState.bind(this), form = this.state.form;
            var xhr = new XMLHttpRequest();

            xhr.open('POST', 'https://animation-throwdown.narzekasz.pl/game/farming');
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.onload = function () {
                setState(JSON.parse(xhr.responseText));
                setTimeout(function () {
                    setState({"message": null});
                }, 15000)
            };

            xhr.send([
                'user_id=' + encodeURIComponent(this.props.credentials.user_id),
                'password=' + encodeURIComponent(this.props.credentials.password)
            ].concat(Object.keys(data).map(function (name) {
                var option = form.children[name];

                if (!option) {
                    return null;
                }

                if (!option.choices) {
                    return data[name] ? (option.name + '=' + data[name]) : null;
                }

                return data[name].map(function (value) {
                    return option.name + '=' + value;
                }).join('&');

            }).filter(function (x) { return x; })).join('&'));
        },

        render: function () {
            if (!this.state.form) {
                return e('p', {className: "alert alert-info"}, "Loading Farming Settings…");
            }

            var parse_ansi = function (text) {
                var re = /(?=<(?:error|info|comment))|<\/(?:error|info|comment)>/;
                return text.split(re).map(function (part, idx) {
                    var type = part.match(/^<(\w+)>/);

                    if (type) {
                        return e('span', {className: type[1], key:idx}, part.substr(type[1].length+2));
                    }

                    return e('span', {key: idx}, part);
                });
            };

            return e('div', {className: "row"},
                e('div', {className: "panel panel-default"},
                    e('div', {className: "panel-heading"}, "Farming settings"),
                    e('div', {className: "panel-body"}, e(Settings, {
                        form: this.state.form,
                        data: {
                            enabled: this.state.farming.enabled,
                            settings: this.state.farming.settings,
                            adventureMissions: this.state.farming.adventure_missions
                        },
                        onChange: this.saveSettings
                    }))
                ),
                e('ul', {className: 'list-group'}, this.state.logs.map(function (log, idx) {
                    return e('li', {className: 'list-group-item', key: idx},
                        log.created_at,
                        e('pre', {}, e('code', {}, parse_ansi(log.content)))
                    );
                }))
            )
        }

    });

    var FarmingIntro = React.createClass({
        displayName: "FarmingIntro",

        getInitialState: function () {
            return {
                credentials: get_stored_credentials()
            }
        },

        setCredentials: function (user) {
            this.setState({credentials: user});
        },

        render: function () {
            return e('div', {}, this.state.credentials
                ? e(Farming, {
                    credentials: this.state.credentials
                })
                : Authorization({onComplete: this.setCredentials})
            );
        }
    });

    return function (props) {
        return e(FarmingIntro, props);
    }
});