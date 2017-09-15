/* global define */ define([
    'react',
    'cartoon-battle/util',
], function (React, util) {

    var e = React.createElement, PropTypes = React.PropTypes;

    var STATE_INIT = 'GuildSearch__init';
    var STATE_SEARCHING = 'GuildSearch__searching';
    var STATE_RESULTS = 'GuildSearch__results';

    var GuildSearch = React.createClass({
        displayName: "GuildSearch",

        props: {
            onComplete: PropTypes.func
        },

        getDefaultProps: function () {
            return {
                onComplete: function () {}
            }
        },

        getInitialState: function () {
            return {
                search: "",
                state: STATE_INIT,
                results: [],
                lastSearch: ""
            }
        },

        onInputChange: function (e) {
            this.setState({"search": e.target.value})
        },

        onSubmit: function (e) {
            e.preventDefault();

            if (!this.state.search || this.state.search === this.state.lastSearch) {
                return ;
            }

            var name = this.state.search, setState = this.setState.bind(this);

            setState({
                lastSearch: name,
                state: STATE_SEARCHING
            });

            util.make_api_call('searchGuildName', {name: name}, function (result) {
                setState({
                    state: STATE_RESULTS,
                    results: util.object_to_array(result.guilds)
                })
            })
        },

        renderWarningMessage: function () {
            if (STATE_SEARCHING === this.state.state) {
                return e('p', {className: "alert alert-info"}, "Loading…");
            }

            if (STATE_RESULTS === this.state.state && 0 === this.state.results.length) {
                return e('p', {className: "alert alert-warning"}, "Not found");
            }

            return null;
        },

        renderResults: function () {
            if (0 === this.state.results.length) {
                return null;
            }

            var onComplete = this.props.onComplete;

            return e('table', {className: 'table table-hover'},
                e('thead', {}, e('tr', {},
                    e('th', {}, 'Name'),
                    e('th', {}, 'Message'),
                    e('th', {}, 'Level'),
                    e('th', {}, '# members')
                )),
                e('tbody', {}, this.state.results.map(function (guild) {
                    return e('tr', {key: guild.faction_id, onClick: function () { onComplete(guild); }},
                        e('td', {}, guild.name),
                        e('td', {}, guild.message),
                        e('td', {}, guild.total_rating),
                        e('td', {}, guild.num_members)
                    );
                }))
            );
        },

        render: function () {
            return e('form', {className: "form form-inline", onSubmit: this.onSubmit},
                e('input', {className: "form-control", onChange: this.onInputChange, "placeholder": "Guild name…"}),
                e('button', {type: "submit", className: "btn btn-primary"}, 'Search'),
                this.renderWarningMessage(),
                this.renderResults()
            );
        }

    });


    return function (props) {
        return e(GuildSearch, props);
    }
});