/* global define */ define(['react', 'cartoon-battle/config'], function (React, config) {
    var $ = React.createElement;

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
        propTypes: {
            "rumble": React.PropTypes.object
        },

        render: function () {
            return $('div', {"className": "panel-body"}, this.props.rumble
                ? ['Rumble from', formatDate(this.props.rumble.start), "to", formatDate(this.props.rumble.end)].join(" ")
                : 'Please white while the data is loading…'
            );
        }
    });



    var RumbleStandingsRow = React.createClass({
        "propTypes": {
            "place": React.PropTypes.number.isRequired,
            "guild": React.PropTypes.shape({
                "name": React.PropTypes.string.isRequired,
                "message": React.PropTypes.string,
                "recruiting": React.PropTypes.bool.isRequired,
                "url": React.PropTypes.string
            }).isRequired
        },

        render: function () {
            return $('tr', {},
                $('td', {"className": "name"}, this.props.place),
                $('td', {"className": "name"}, this.props.guild.url ? $('a', {href: this.props.guild.url}, this.props.guild.name) : this.props.guild.name),
                $('td', {}, this.props.guild.recruiting && $('span', {"className": "label label-primary"}, 'Yes')),
                $('td', {dangerouslySetInnerHTML: {__html: this.props.guild.message}})
            )
        }
    });

    var RumbleStandingsHeading = React.createClass({
        render: function () {
            return $("thead", {},
                $('tr', {},
                    $('th', {}, '#'),
                    $('th', {}, 'Guild Name'),
                    $('th', {}, 'Recruiting?'),
                    $('th', {}, 'Message')
                )
            )
        }
    });

    var RumbleStandings = React.createClass({
        propTypes: {
            "title": React.PropTypes.string
        },

        getDefaultProps: function () {
            return {
                "title": "Unofficial Rumble Standings",
            }
        },

        getInitialState: function () {
            return {"rumble": null}
        },

        componentDidMount: function() {
            var xhr = new XMLHttpRequest(), callback = this.setState.bind(this);
            xhr.open('GET', config.api_endpoint + '/rumble-standings.json');

            xhr.onload = function () {
                callback({"rumble": JSON.parse(xhr.responseText)[0] });
            };

            xhr.send();
        },

        render: function () {
            return (
                $('div', {"className": "panel panel-primary"},
                    $('div', {"className": "panel-heading"}, this.props.title, $('span', {"className": "pull-right"}, $(
                        'a', {"href": "#form", "className": "btn btn-default btn-xs"}, "(add/update your guild)"
                    ))),
                    $(RumbleDescription, {"rumble": this.state.rumble}),
                    $('table', {"className":"table table-striped"}, this.state.rumble && [$(RumbleStandingsHeading, {key: "heading"})]
                            .concat($('thead', {"key": "body"}, this.state.rumble.standings.map(function (position) {
                            return $(RumbleStandingsRow, {
                                "key": position.place,
                                "place": position.place,
                                "guild": position.guild
                            });
                        }))))
                )
            )
        }
    });

    return function (props) {
        return $(RumbleStandings, props);
    }
});
