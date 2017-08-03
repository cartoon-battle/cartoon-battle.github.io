/* global define */ define([
    'react',
    'cartoon-battle/util',
    'views/Kongregate/Authorization'
], function (React, util, Authorization) {

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

    var Island = React.createClass({
        displayName: "Island",

        propTypes: {
            name: PropTypes.string.isRequired,
            users: PropTypes.arrayOf(PropTypes.object).isRequired
        },

        getInitialState: function () {
            return {
                users: []
            }
        },

        componentDidMount: function () {
            var sessionStorage = window.sessionStorage || {};

            var setState = this.setState.bind(this), addUser = function (user) {
                setState(function (prevState) {
                    return {
                        users: prevState.users.concat([{
                            level: user.pvp_data.level,
                            legendaries: user.cards_by_rarity[4],
                            win_count:  user.pvp_data.win_count,
                            sfc_points: user.pvp_data.rating
                        }])
                    }
                })
            };

            this.props.users.map(function (user) {
                return user.user_id;
            }).forEach(function (user_id) {
                var key = "user_profile_" + user_id;

                if (sessionStorage[key]) {
                    return addUser(JSON.parse(sessionStorage[key]));
                }

                util.get_user_info(user_id, function (response) {
                    var user = response.user_profile_info;

                    sessionStorage[key] = JSON.stringify(user);

                    return addUser(user);
                }/* credentials are implied */)
            });
        },

        renderUsersProgress: function () {
            var loaded = this.state.users.length;
            if (loaded === this.props.users.length) {
                return loaded;
            }

            return loaded + " (of " + this.props.users.length + ")";
        },

        countAverageStat: function (key, prec) {
            prec = Math.pow(10, prec || 0);

            var map = function (user) {
                return user[key];
            };

            var reduce = function (sum, value) {
                return parseInt(sum) + parseInt(value);
            };

            return this.state.users.length
                ? Math.round(this.state.users.map(map).reduce(reduce) / this.state.users.length * prec) / prec
                : 'N/A';
        },

        render: function () {
            return e('tr', {},
                e('td', {}, this.props.name),
                e('td', {}, this.renderUsersProgress()),
                e('td', {}, this.countAverageStat("level", 2)),
                e('td', {}, this.countAverageStat("win_count")),
                e('td', {}, this.countAverageStat("legendaries")),
                e('td', {}, this.countAverageStat("sfc_points"))
            );
        }

    });

    var Locations = React.createClass({
        displayName: "Locations",

        propTypes: {
            title: PropTypes.string.isRequired,
            items: PropTypes.arrayOf(PropTypes.object).isRequired
        },

        getInitialState: function () {
            return {
                guildName: this.props.title
            }
        },

        render: function () {
            if (!this.props.items.length) {
            }

            return e('div', {className: "panel panel-default"},
                e('div', {className: "panel-heading"},
                    e("h2", {className: "panel-title"}, this.state.guildName)
                ),
                0 === this.props.items.length
                ? e('div', {className: "panel-body"},
                    e('p', {className: "alert alert-warning"}, "There is no island data. Are you sure the siege already started?")
                )

                : e("table", {className: "table"},
                    e('thead', {}, e('tr', {},
                        e('th', {}, e('div', {}, e('span', {}, "Name"))),
                        e('th', {className: 'rotate'}, e('div', {}, e('span', {}, "Players"))),
                        e('th', {className: 'rotate'}, e('div', {}, e('span', {}, "Level"))),
                        e('th', {className: 'rotate'}, e('div', {}, e('span', {}, "Win Count"))),
                        e('th', {className: 'rotate'}, e('div', {}, e('span', {}, "Legendaries"))),
                        e('th', {className: 'rotate'}, e('div', {}, e('span', {}, "SFC Points")))
                    )),
                    e('tbody', {}, this.props.items.map(function (island) {
                        return e(Island, {
                            key: island.slot_id,
                            name: island.data.name.replace(/\s*Island$/, ''),
                            users: util.object_to_array(island.users)
                        })
                    }))
                )
            );
        }
    });

    var SiegeReport = React.createClass({
        displayName: "SiegeReport",

        componentDidMount: function () {
            var setState = this.setState.bind(this);
            util.make_api_call('getGuildSiegeStatus', this.props.credentials, function (response) {
                setState({
                    "siege": response.guild_siege_status
                })
            });
        },

        getInitialState: function () {
            return {
                siege: null
            }
        },

        propTypes: {
            credentials: PropTypes.shape({
                "user_id": PropTypes.string.isRequired,
                "password": PropTypes.string.isRequired
            }).isRequired
        },

        render: function () {
            if (!this.state.siege) {
                return e('p', {className: "alert alert-info"}, "Loading Siege Data…");
            }

            return e('div', {className: "row"},
                e(Locations, {
                    title: "Enemy islands",
                    items: util.object_to_array(this.state.siege.enemy_locations)
                }),
                e(Locations, {
                    title: "Your islands",
                    items: util.object_to_array(this.state.siege.locations)
                })
            );
        }

    });

    var SiegeReportIntro = React.createClass({
        displayName: "SiegeReportIntro",

        getInitialState: function () {
            return {
                credentials: get_stored_credentials()
            }
        },

        setCredentials: function (user) {
            this.setState({credentials: user});
        },

        render: function () {
            return e('div', {},
                this.state.credentials
                    ? e(SiegeReport, {
                        credentials: this.state.credentials
                    })
                    : Authorization({onComplete: this.setCredentials})
            );
        }
    });

    return function (props) {
        return e(SiegeReportIntro, props);
    }
});