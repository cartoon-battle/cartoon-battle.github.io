/* global define */ define(['react', 'cartoon-battle', 'cartoon-battle/config', 'views/Card', 'views/TraitFilter', 'views/RaritiesFilter'], function (React, getCards, config, Card, TraitFilter, RaritiesFilter) {

    var $ = React.createElement, PropTypes = React.PropTypes, i = function () { return true };



    var AvailableCombos = React.createClass({
        propTypes: {
            "combos": PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object))
        },

        render: function () {
            return $('div', {"id": "cards"}, this.props.combos.map(function (combo) {
                return Card(combo, {"key": combo.map(function (card) {
                    return card.id + '=' + card.level
                }).join('&')});
            }))
        }
    });

    var InventoryFilter = React.createClass({
        propTypes: {
            "cards": PropTypes.arrayOf(PropTypes.shape({
                "id": PropTypes.number.isRequired,
                "name": PropTypes.string.isRequired
            })).isRequired,
            "inventory": PropTypes.arrayOf(PropTypes.number).isRequired,
            "onChange": PropTypes.func.isRequired
        },

        getInitialState: function () {
            return {
                "filter": ""
            }
        },

        setFilter: function (event) {
            this.setState({"filter": event.target.value})
        },

        render: function () {
            var cards = this.props.cards,
                inventory = this.props.inventory,
                toggle = this.props.onChange,
                filter = this.state.filter.toLowerCase();

            if (!cards.length) {
                return null;
            }

            return $('div', {},
                $('p', {}, 'Select cards you have in your inventory:'),
                $('input', {
                    "type": "search",
                    "className": "form-control",
                    "placeholder": "filter",
                    "onChange": this.setFilter,
                    "value": this.state.filter
                }),
                $('ul', {"className": "list-group", "style": { "maxHeight": "15em", "overflow": "auto"}}, cards.filter(function(card) {
                    return "" === this.filter || !!~card.name.toLowerCase().indexOf(filter);
                }).map(function (card) {
                    return $("li", {
                        "key": card.id,
                        "onClick": function () {
                            toggle(!!~inventory.indexOf(card.id) ? inventory.filter(function (item) {
                                return card.id !== item;
                            }) : [].slice.apply(inventory).concat(card.id))
                        },
                        "className": ["list-group-item", !!~inventory.indexOf(card.id) && "active"].filter(i).join(" ")
                    }, card.name)
                }))
            );
        }
    });

    var TraitExplorer = React.createClass({
        setTraits: function (traits) {
            this.setState({"traits": traits});
        },

        setRarities: function (rarities) {
            this.setState({"rarities": rarities});
        },

        setInventory: function (inventory) {
            this.setState({"inventory": inventory});
        },

        getInitialState: function () {
            return {
                "traits": [],
                "inventory": [],
                "rarities": [],
                "cards": null
            }
        },

        componentDidMount: function () {
            var setState = this.setState.bind(this);
            getCards(function (cards) {
                setState({"cards": cards});
            })
        },

        getMatchingCombos: function () {
            var traits = this.state.traits;

            return this.state.cards.items.filter(function (combo) {
                return combo.is_combo;
            }).filter(function (combo) {
                return !!~traits.indexOf(combo.trait);
            });
        },

        getResult: function () {
            var cards = this.state.cards, inventory = this.state.inventory, traits = this.state.traits;
            if (!cards) {
                return [];
            }

            return cards.combos.filter(function (combo) {
                return !!~traits.indexOf(cards.get(combo.card_id).trait)
                    && !!~inventory.indexOf(combo.character)
                    && !!~inventory.indexOf(combo.item);
            }).map(function (combo) {
                return [
                    {"id": combo.character, "level": '^**'},
                    {"id": combo.item, "level": '^**'}
                ];
            });
        },

        getPotentialCards: function () {
            var combos = this.getMatchingCombos().map(function (combo) {
                return combo.id;
            }), cards = this.state.cards;

            return Object.values(this.state.cards.combos.filter(function (comboDefinition) {
                return !!~combos.indexOf(comboDefinition.card_id);
            }).reduce(function (items, combo) {
                return [cards.get(combo.character), cards.get(combo.item)].reduce(function (items, card) {
                    items[card.id] = card;
                    return items;
                }, items);
            }, {})).sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
        },

        getMatchingCards: function () {
            var cards = this.state.cards, rarities = this.state.rarities;

            if (!cards) {
                return [];
            }

            return this.getPotentialCards().filter(function (card) {
                return 0 === rarities.length || !!~rarities.indexOf(config.rarities[card.rarity-1]);
            });
        },

        render: function () {
            return $('div', {},
                TraitFilter({ "onChange": this.setTraits }),
                RaritiesFilter({ "onChange": this.setRarities }),
                $(InventoryFilter, {
                    "onChange": this.setInventory,
                    "inventory": this.state.inventory,
                    "cards": this.getMatchingCards()
                }),
                $(AvailableCombos, {
                    "combos": this.getResult()
                })
            );
        }
    });

    return function (props) {
        return $(TraitExplorer, props);
    }
});
