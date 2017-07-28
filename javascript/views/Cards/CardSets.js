/* global define */ define([
    'react',
    'cartoon-battle',
    'cartoon-battle/util',
    'views/TraitFilter',
    'views/RaritiesFilter',
    'views/Card'
], function (React, getCards, util, TraitFilter, RaritiesFilter, Card) {

    var e = React.createElement, PropTypes = React.PropTypes, i = function () { return true };



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
                }, [
                    { value: "1", label: "Farmable" },
                    { value: "2", label: "Premium" },
                    { value: "3", label: "Rewards" },
                    { value: "3002", label: "Reward Power Cards" },
                    { value: "3001", label: "Premium Power Cards" },
                    { value: "1,2,3,3001,3002", label: "(all of the above)" }
                ].map(function (option) {
                    return e('option', {
                        key: option.label,
                        value: option.value
                    }, option.label);
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
            return {
                "traits": [],
                "rarities": ["epic", "legendary"],
                "sets": [1],
                "cards": null
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
            var sets = this.state.sets.map(parseInt);
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
                TraitFilter({ "onChange": this.setTraits }),
                RaritiesFilter({ "onChange": this.setRarities, "selected": this.state.rarities }),
                e(CardList, {"cards": this.getCards() })
            );
        }
    });

    return function (props) {
        return e(CardSets, props);
    }

});
