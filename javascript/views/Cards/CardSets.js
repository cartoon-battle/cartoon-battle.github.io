/* global define */ define([
    'react',
    'cartoon-battle',
    'cartoon-battle/util',
    'cartoon-battle/config',
    'views/TraitFilter',
    'views/RaritiesFilter',
    'views/Card'
], function (React, getCards, util, config, TraitFilter, RaritiesFilter, Card) {

    var e = React.createElement, PropTypes = React.PropTypes, i = function () { return true };

    var sets = {
        "Farmable": "1",
        "Premium": "2",
        "Rewards": "3",
        "Reward Power Cards": "3002",
        "Premium Power Cards": "3001",
        "(all of the above)": "1,2,3,3001,3002"
    };

    function find_set_slug_value(token) {
        return Object.keys(sets).reduce(function (acc, setName) {
            return acc || (util.slugify(setName) === token) && sets[setName].split(',');
        }, null);
    }

    var CardList = React.createClass({
        propTypes: {
            "cards": PropTypes.arrayOf(PropTypes.object).isRequired
        },

        render: function () {
            return e('div', {"id": "results"}, this.props.cards.map(function (card) {
                return e('a', {href: "/recipes?" + util.slugify(card.name), key: card.id},
                    Card([{ "id": card.id, "level": "^**" }])
                );
            }))
        }
    });

    var DefinedSets = React.createClass({
        displayName: "DefinedSets",

        propTypes: {
            "onChange": PropTypes.func.isRequired,
            "selected": PropTypes.string
        },

        onChange: function (event) {
             this.props.onChange(event.target.value);
        },

        render: function () {
            return e('div', {},
                e('select', {
                    onChange: this.onChange,
                    defaultValue: this.props.selected,
                    className: "form-control"
                }, Object.keys(sets).map(function (option) {
                    return e('option', {
                        key: option,
                        value: sets[option]
                    }, option);
                }))
            )
        }
    });

    var CardSets = React.createClass({
        displayName: "CardSets",

        setTraits: function (traits) {
            this.setState({"traits": traits});
        },

        setSets: function (sets) {
            this.setState({"sets": sets.split(",") });
        },

        setRarities: function (rarities) {
            this.setState({"rarities": rarities});
        },

        getInitialState: function () {
            var tokens = window.location.search.substr(1).split(',');

            var sets = tokens.reduce(function (acc, token) {
                return acc || find_set_slug_value(token);
            }, null);

            var traits = tokens.filter(function (token) {
                return !!~config.traits.indexOf(token);
            });

            var rarities = tokens.filter(function (token) {
                return !!~config.rarities.indexOf(token);
            });

            return {
                "traits": traits,
                "rarities": rarities.length && rarities || ["epic", "legendary"],
                "sets": sets || [1],
                "cards": null
            }
        },

        componentDidUpdate: function () {
            if (false === 'history' in window) {
                return;
            }

            var current = window.location.search.substr(1);
            var state = this.state;

            var slugs = [
                Object.keys(sets).reduce(function (acc, key) {
                    if (state.sets.join(',') === sets[key]) {
                        return util.slugify(key);
                    }

                    return acc;
                }, null)
            ]
                .concat(state.rarities)
                .concat(state.traits)
                .filter(i)
                .join(',');

            if (current !== slugs) {
                window.history.pushState({}, "", "?" + slugs);
            }
        },

        componentDidMount: function () {
            var setState = this.setState.bind(this);
            getCards(function (cards) {
                setState({
                    "cards": cards.getCards().concat().sort(function (alpha, bravo) {
                        return alpha.name.localeCompare(bravo.name);
                    })
                });
            })
        },

        getCards: function () {
            var sets = this.state.sets.map(function (i) { return parseInt(i); });
            var traits = this.state.traits;

            return this.state.cards
                .filter(util.rarities_filter(this.state.rarities))
                .filter(function (card) {
                    return 0 === traits.length || !!~traits.indexOf(card.trait);
                }).filter(function (card) {
                    return !!~sets.indexOf(card.set)
                });
        },

        render: function () {
            if (null === this.state.cards) {
                return e('p', {"className": "alert alert-warning"}, "Please wait while loading cards…");
            }

            return e('div', {},
                e(DefinedSets, {"onChange": this.setSets, "selected": this.state.sets.join(",") }),
                TraitFilter({ "onChange": this.setTraits, "selected": this.state.traits }),
                RaritiesFilter({ "onChange": this.setRarities, "selected": this.state.rarities }),
                e(CardList, {"cards": this.getCards() })
            );
        }
    });

    return function (props) {
        return e(CardSets, props);
    }

});
