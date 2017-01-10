/* global define */ define(function () {
    var MIN_DECK_SIZE = 25;

    function get_card_types_count(cardList, deck) {
        return deck.reduce(function (items, card) {
            var type = cardList.getComboRole(card);

            items[type] = (items[type]||0) + 1;

            return items;
        }, {});
    }

    function object_to_array(object) {
        return Object.keys(object).map(function (key) {
            return object[key];
        });
    }

    function get_combos(cardList, cards, types) {
        types = (function (types) {
            var result = {};
            result[cardList.COMBO_ROLE_CHARACTER] = types[cardList.COMBO_ROLE_ITEM];
            result[cardList.COMBO_ROLE_ITEM] = types[cardList.COMBO_ROLE_CHARACTER];

            return result;
        })(types);

        return object_to_array(cards.reduce(function (combos, card) {
            if (cardList.isPrecombo(card)) {
                return combos;
            }

            var cardCombos = cards.map(function (comboCandidate) {
                return card.getId() !== comboCandidate.getId() && cardList.getCombo(card, comboCandidate);
            }).filter(function (combo) {
                return !!combo;
            });

            combos[card.getName()] = {
                "name": card.getName(),
                "percentage": cardCombos.length / types[cardList.getComboRole(card)],
                "combos": cardCombos
            };

            return combos;
        }, {}));
    }


    function Analysis(cards, deck) {
        this.deck = deck;
        this.cardList = cards;
        this.types = get_card_types_count(cards, deck);
        this.combos = get_combos(cards, deck, this.types);

        this.types['combos'] = Object.keys(this.combos.reduce(function (seen, item) {
            return item.combos.reduce(function (seen, combo) {
                seen[combo.result.id] = true;
                return seen;
            }, seen);
        }.bind(this), {})).length;
    }

    Analysis.prototype.getPotentialCombos = function analysis__getPotentialCombos() {
        return this.types[this.cardList.COMBO_ROLE_CHARACTER] * this.types[this.cardList.COMBO_ROLE_ITEM];
    };

    Analysis.prototype.getProblems = function analysis__getProblems(threshold) {
        if (this._problems) {
            return this._problems;
        }

        return this._problems = this.combos.sort(function (alpha, bravo) {
            return alpha.percentage - bravo.percentage;
        }).filter(function (item) {
            return item.percentage < (threshold || 0.75);
        }).map(function (item) {
            return {
                "name": item.name,
                "percentage": Math.round(item.percentage * 100) + "%"
            }
        });
    };

    Analysis.prototype.getCombos = function analysis__getCombos(groupBy) {
        this._combos = this._combos || {};

        if (this._combos[groupBy]) {
            return this._combos[groupBy];
        }

        var object_to_array = function (o) {
            return Object.keys(o).sort().map(function (key) { return o[key]; });
        };

        var uniqueCombos = this.combos.reduce(function (combos, item) {
            return item.combos.reduce(function (result, combo) {
                var key = groupBy ? (combo.character.name + '~' + combo.item.name) : combo.result.name;
                var existing = result[key];
                if (existing && (existing.result.attack * 3 + existing.result.health > combo.result.attack * 3 + combo.result.health)) {
                    combo = existing;
                }

                result[key] = combo;

                return result;
            }, combos);
        }, {});

        return this._combos[groupBy] = object_to_array(object_to_array(uniqueCombos).reduce(function (result, combo) {
            var key = groupBy ? combo[groupBy].name : '';

            result[key] = result[key] || [];
            result[key].push(combo);

            return result;
        }, {}));
    };

    Analysis.prototype.isDeck = function analysis__isDeck() {
        return this.deck.length >= MIN_DECK_SIZE;
    };

    return Analysis;
});