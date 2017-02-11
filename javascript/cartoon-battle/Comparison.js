/* global define */ define(['cartoon-battle/Rarity'], function (Rarity) {

    function find_recipe(cards, comboId, itemId) {
        return cards.combos.filter(function (combo) {
            return combo.card_id === comboId && combo.item === itemId;
        })[0];
    }

    function createRaritiesFilter(rarities) {
        if (!rarities || !rarities.length) {
            return function () {
                return true;
            }
        }

        var filter = rarities.map(function (rarity) {
            return (new Rarity(rarity)).getLevel();
        });

        return function (card) {
            return !!~filter.indexOf(card.rarity);
        }
    }

    function createFarmableFilter(farmable) {
        if (!farmable) {
            return function () {
                return true;
            }
        }

        return function (card) {
            return 1 === card.set;
        }
    }

    function createFilter(rarities, farmable) {
        var filters = [
            createRaritiesFilter(rarities),
            createFarmableFilter(farmable)
        ];
        return function (card) {
            return filters.reduce(function (match, filter) {
                return match && filter(card);
            }, true);
        };
    }

    /**
     * @param {CardCollection} cards
     * @param {{card, level, rarities}}options
     */
    function getComparison(cards, options) {
        if (!options.card) {
            return [];
        }

        var combos = cards.combos.filter(function (combo) {
            return  combo.item === options.card.id
        }).map(function (combo) {
            return combo.card_id;
        });

        var otherItems = cards.combos.reduce(function (otherItems, combo) {
            if (!!~combos.indexOf(combo.card_id)) {
                otherItems[combo.item] = (otherItems[combo.item] || 0) + 1;
            }

            return otherItems;
        }, {});

        // remove items that only have one or two combos in common:
        otherItems = Object.keys(otherItems).filter(function (key) {
            return otherItems[key] > 1;
        }).map(function (cardId) {
            // parseInt, because keys are strings
            return cards.get(parseInt(cardId), true);
        }).filter(function (card) {
            return !!card;
        }).filter(createFilter(options.rarities, options.farmable));

        var matrix = combos.map(function (comboId) {
            return otherItems.map(function (item) {
                var recipe = find_recipe(cards, comboId, item.id);
                if (!recipe) {
                    return "";
                }

                var character = cards.get(recipe.character, true);

                if (!character) {
                    return "";
                }

                return function () {
                    return cards.forLevel(cards.getCombo(
                        cards.forLevel(character, options.level),
                        cards.forLevel(item, options.level)
                    ).result).node;
                }
            });
        }).filter(function (row) {
            // remove empty rows
            return row.filter(function (item) { return !!item; }).length > 1;
        });

        return {
            items: otherItems.map(function (card) {
                return function () {
                    return cards.forLevel(card, options.level).node;
                }
            }),
            matrix: matrix
        };
    }


    return getComparison;
});