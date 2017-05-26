/* global define */ define(['react', 'cartoon-battle/config'], function (React, config) {
    var $ = React.createElement;

    function findNextItem(array) {
        var initial = {
            isCurrent: false,
            value: null
        };

        return array.reduce(function (context, item) {
            return {
                isCurrent: item.active,
                value: context.isCurrent ? item.idx : context.value
            };
        }, initial).value;
    }


    function softBreak(string) {
        return string && ("" + string)
                .replace(/\&nbsp;/g, '\u00A0')
                .replace(/([a-z])([A-Z])/g, '$1\u200B$2')
                .replace(/([^\s-]{15})([^\s-]{5})/g, '$1\u200B$2');
    }

    function formatDate(date) {
        date = new Date(date);

        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];

        var day = date.getDate();
        var monthIndex = date.getMonth();

        return day + ' ' + monthNames[monthIndex];
    }


    var RumbleDescription = React.createClass({
        displayName: 'RumbleDescription',
        propTypes: {
            "rumble": React.PropTypes.object,
            "navigation": React.PropTypes.arrayOf(React.PropTypes.shape({
                "idx": React.PropTypes.number,
                "active": React.PropTypes.bool
            })),
            "changeRumble": React.PropTypes.func.isRequired
        },

        renderNavigation: function () {
            if (!this.props.navigation) {
                return null;
            }

            var callback = this.props.changeRumble;
            var next = findNextItem(this.props.navigation), goToNext = function () {
                null !== next && callback(next);
            };

            var prev = findNextItem(this.props.navigation.concat().reverse()), goToPrev = function () {
                null !== prev && callback(prev);
            };

            return $('div', {"className": "btn-group pull-right"},
                $('button', {"className": "btn btn-default", "disabled": null === prev, "onClick": goToPrev},
                    $('i', {"className": "glyphicon glyphicon-arrow-left"}),
                    " prev"
                ),
                $('button', {"className": "btn btn-default", "disabled": null === next, "onClick": goToNext},
                    "next ",
                    $('i', {"className": "glyphicon glyphicon-arrow-right"})
                )
            );
        },

        renderRumbleInformation: function () {
            return $('div', {},
                ['Rumble from', formatDate(this.props.rumble.start), "to", formatDate(this.props.rumble.end)].join(" "),
                this.renderNavigation()
            );
        },

        render: function () {
            return $('div', {"className": "panel-body"}, this.props.rumble
                ? this.renderRumbleInformation()
                : 'Please white while the data is loading…'
            );
        }
    });



    var RumbleStandingsRow = React.createClass({
        displayName: 'RumbleStandingsRow',
        "propTypes": {
            "place": React.PropTypes.number.isRequired,
            "change": React.PropTypes.number,
            "guild": React.PropTypes.shape({
                "name": React.PropTypes.string.isRequired,
                "message": React.PropTypes.string,
                "recruiting": React.PropTypes.bool.isRequired,
                "url": React.PropTypes.string
            }).isRequired
        },

        renderPositionChange: function () {
            if (!this.props.change) {
                return null;
            }

            if (this.props.change > 0) {
                return $('span', {"className": "label label-success"}, '+' + Math.abs(this.props.change));
            }

            return $('span', {"className": "label label-danger"}, '-' + Math.abs(this.props.change));
        },

        render: function () {
            return $('tr', {},
                $('td', {},
                    $('span', {"className": "name"}, this.props.place),
                    " ",
                    this.renderPositionChange()
                ),
                $('td', {"className": "name"}, this.props.guild.url ? $(
                    'a', {href: this.props.guild.url}, softBreak(this.props.guild.name)) : softBreak(this.props.guild.name)
                ),
                $('td', {},
                    this.props.guild.recruiting && $('span', {"className": "label label-primary pull-right"}, 'recruiting!'),
                    $('span', {dangerouslySetInnerHTML: {__html: this.props.guild.message}})
                )
            )
        }
    });

    var RumbleStandingsHeading = React.createClass({
        displayName: 'RumbleStandingsHeading',
        propTypes: {
            "onRecruitingChange": React.PropTypes.func.isRequired,
            "filter-recruiting": React.PropTypes.bool
        },

        getDefaultProps: function () {
            return {
                "filter-recruiting": false
            };
        },

        render: function () {
            return $("thead", {},
                $('tr', {},
                    $('th', {}, '#'),
                    $('th', {}, 'Guild Name'),
                    $('th', {},
                        $('span', {"style": {"whiteSpace": "nowrap"}, "className": "pull-right"}, $('label', {}, $('input', {
                            "type": "checkbox",
                            "checked": this.props['filter-recruiting'],
                            "onClick": this.props.onRecruitingChange
                        }), ' Recruiting only?')),
                        'Message'
                    )
                )
            )
        }
    });

    var RumbleStandings = React.createClass({
        displayName: 'RumbleStandings',
        propTypes: {
            "title": React.PropTypes.string
        },

        getDefaultProps: function () {
            return {
                "title": "Unofficial Rumble Standings",
            }
        },

        getInitialState: function () {
            return {"rumbles": null, "filterRecruiting": false}
        },

        componentDidMount: function() {
            var xhr = new XMLHttpRequest(), callback = this.setState.bind(this);
            xhr.open('GET', config.api_endpoint + '/rumble-standings.json');

            xhr.onload = function () {
                var rumbles = JSON.parse(xhr.responseText).filter(function (rumble) {
                    return rumble.standings.length > 0;
                });

                callback({"rumbles": rumbles, "idx": rumbles.length - 1});
            };

            xhr.send();
        },

        toggleRecruitingFilter: function () {
            this.setState(function (state) {
                return {
                    "filterRecruiting": !state.filterRecruiting
                };
            });
        },

        getRowsFilter: function() {
            if (!this.state.filterRecruiting) {
                return function () { return true; }
            }

            return function (item) {
                return item.guild.recruiting;
            }
        },

        getSelectedRumble: function () {
            return this.state.rumbles && this.state.rumbles[this.state.idx];
        },

        standingsTable: function () {
            var rumble = this.getSelectedRumble();

            if (!rumble) {
                return null;
            }

            var previousRumble = this.state.rumbles[this.state.idx - 1];
            function findGuildInPreviousRumble(guild, current) {
                return previousRumble && previousRumble.standings.reduce(function (found, position) {
                    return found || position.guild.name === guild.name && position.place - current || null;
                }, null);
            }


            return [$(RumbleStandingsHeading, {
                    "key": "heading",
                    "onRecruitingChange": this.toggleRecruitingFilter,
                    "filter-recruiting": this.state.filterRecruiting
            })].concat($('thead', {"key": "body"}, rumble.standings.filter(this.getRowsFilter()).map(function (position) {
                return $(RumbleStandingsRow, {
                    "key": position.place,
                    "place": position.place,
                    "change": findGuildInPreviousRumble(position.guild, position.place),
                    "guild": position.guild
                });
            })));
        },

        createNavigation: function () {
            if (!this.state.rumbles || 1 >= this.state.rumbles.length) {
                return null;
            }

            var selected = this.state.idx;

            return this.state.rumbles.map(function (rumble, idx) {
                return {
                    "idx": idx,
                    "active": idx === selected
                }
            })
        },

        selectRumble: function (idx) {
            this.setState({"idx": idx});
        },

        render: function () {
            return (
                $('div', {"className": "panel panel-primary"},
                    $('div', {"className": "panel-heading"}, this.props.title, $('span', {"className": "pull-right"}, $(
                        'a', {"href": "#form", "className": "btn btn-default btn-xs"}, "(add/update your guild)"
                    ))),
                    $(RumbleDescription, {
                        "rumble": this.getSelectedRumble(),
                        "navigation": this.createNavigation(),
                        "changeRumble": this.selectRumble
                    }),
                    $('table', {"className":"table table-striped"}, this.standingsTable())
                )
            )
        }
    });

    return function (props) {
        return $(RumbleStandings, props);
    }
});
