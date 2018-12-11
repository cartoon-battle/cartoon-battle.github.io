define(['./util', './Rarity', './Level', './Card'], function define__cardcollection(util, Rarity, Level, Card) {

    function CardNotFound() {}
    CardNotFound.prototype = Error;

    function identity(x) { return !!x; }

    function strip_rarity_prefix(name) {
        return Rarity.RARITY_LEVELS.reduce(function (name, rarity) {
            return name.replace(new RegExp('^' + rarity + '-'), '');
        }, util.slugify(name));
    }


    /**
     * @param {CardCollection} cardList
     * @param card
     * @returns {{standard: boolean, deck: boolean, combo: boolean, farmable: string}}
     */
    function categorize_card(cardList, card) {
        var standard = card.set < 5000 || (7000 <= card.set && card.set <= 7999);
        var deck = standard && !card.commander && !card.is_combo && !card.is_defense && !card.hidden;
        var combo = 1 === card.levels.length && !!card.attack_multiplier;

        return {
            "standard": standard,
            "deck": deck,
            "combo": combo,
            "f2p": 1 === card.set,
            "item": cardList.isItem(card),
            "precombo": !!card.combo_card_id,
            "hidden": card.hidden,
            "card": card
        }
    }

    function flatten_card_category(cardCategory) {
        return cardCategory.card;
    }

    function upgrade_card(card, level) {
        card = util.clone(card);

        level = new Level(level, new Rarity(card.rarity));

        var upgrade = card.levels[level.getAbsoluteValue() - 1];
        if (!upgrade) {
            throw new Error('„' + card.name + '” doesn’t have this level: ' + level.getAbsoluteValue());
        }

        card.attack = upgrade.attack;
        card.health = upgrade.health;
        card.skills = upgrade.skills;

        card.level = level.getValue();
        card.fuse = level.getFuse();

        return card;
    }

    function combo_value(alpha, bravo, multiplier) {
        return Math.max(alpha, bravo, Math.ceil(1.1 * (alpha + bravo) * multiplier));
    }

    function hydrate_combo(characterLevel, itemLevel, combo) {
        if (2 === arguments.length) {
            combo = arguments[1];
            itemLevel = characterLevel = arguments[0];
        } else if (1 === arguments.length) {
            combo = arguments[0];
            characterLevel = itemLevel = "1";
        }

        try {
            var character = upgrade_card(this.get(combo.character), characterLevel || "1");
            var item = upgrade_card(this.get(combo.item), itemLevel || "1");
            var result = util.clone(this.get(combo.card_id));
        } catch (E) {
            if (E.constructor.name = CardNotFound.name) {
                return null;
            }

            throw E;
        }

        result.rarity = Math.ceil(character.rarity /2 + item.rarity /2);
        result.health = combo_value(item.health, character.health, result.health_multiplier);
        result.attack = combo_value(item.attack, character.attack, result.attack_multiplier);

        result.power = 1.1 * (3 * character.attack + 3 * item.attack + character.health + item.health);

        result.is_combo = true;

        result.skills = Object.keys(result.skills).reduce(function (skills, key) {
            skills[key] = {
                x: Math.floor((result.skills[key].v-1) * (result.power - result.skills[key].p) / (100 - result.skills[key].p) +1),
                y: result.skills[key].y
            };

            return skills;
        }, {});

        return {
            "character": character,
            "item": item,
            "result": addLevels(result, []) // recalculate first level
        }
    }

    function parseCombo(combo) {
        var character = combo.character.id;
        var item = combo.item;

        return {
            "id": [character, item].sort().join("~"),
            "card_id": combo.output,
            "character": character,
            "item": item
        }
    }

    function extract_combo_data(combo) {
        return {
            "output": parseInt(combo.getAttribute('output')),
            "card": parseInt(combo.getAttribute('card'))            
        }
    }

    function flatten(acc, array) {
        return [].concat.apply(acc, array);
    }

    function group_character_combos(character) {
        var name = character.querySelector('name').textContent;
        var cards = this.getCharacters(name);

        var combos = [].slice.apply(character.querySelectorAll('combo'))
                    .map(extract_combo_data)
                    .filter(validate_combo);

        return cards.map(function (card) {
            return {
                "character": card,
                "combos": combos
            }
        });
    }

    function flatten_character_combos(combos, characterCombos) {
        return [].concat.call(combos, characterCombos.combos.map(function add_character_to_combo(combo) {
                return {
                    "character": characterCombos.character, // card
                    "item": combo.card,                     // id
                    "output": combo.output,                 // id
                }
            })
        );
    }

    function validate_combo(combo) {
        return false === isNaN(combo.output)
            && false === isNaN(combo.card);
    }

    function addLevels(unit, upgrades) {
        unit.levels = [{
            "health": unit.health,
            "attack": unit.attack,
            "skills": unit.skills
        }];

        upgrades.reduce(function(values, upgrade) {
            values = addSkills(util.clone(values), [].slice.apply(upgrade.querySelectorAll('skill')));

            values.attack = parseInt((upgrade.querySelector('attack') || { 'textContent': values.attack }).textContent);
            values.health = parseInt((upgrade.querySelector('health') || { 'textContent': values.health }).textContent);

            unit.levels.push(values);

            return values;
        }, unit.levels[0]);

        return unit;
    }

    function addSkills(unit, skills) {
        unit.skills = unit.skills || {};

        skills.forEach(function (e) {
            unit.skills[e.getAttribute('id')] = {
                "p": parseInt(e.getAttribute('p')) || null,
                "x": parseInt(e.getAttribute('x')) || null,
                "v": parseInt(e.getAttribute('v')) || null,
                "y": e.getAttribute('y') || null
            };
        });

        return unit;
    }

    function normalizePicture(picture, type) {
        return ['FG', 'AD', 'BB', 'KH', 'FT', 'generic'][parseInt(type)-1]
            + "_" + picture.replace(/^(fg|koth|ad|bb|ft|kh|fr|generic)_/i, '');
    }

    var seenCards = {};

    function parseUnit(unit) {
        function v(name) {
            return (unit.querySelector(name) || {}).textContent;
        }

        var rarity = parseInt(v('rarity'));
        var displayName = v('name')

        var name = displayName;

        if (seenCards[displayName]) {
            var prefix = (new Rarity(rarity)).getName();
            name = prefix.substr(0, 1).toUpperCase() + prefix.substr(1) + " " + displayName;
        }

        var card = addLevels(addSkills({
            id: parseInt(v('id')),
            name: name,
            displayName: displayName,
            slug: util.slugify(name),
            desc: v('desc'),
            character: v('character'),
            picture: normalizePicture(v('picture'), v('type')),
            commander: !!v('commander'),
            is_combo: !!parseFloat(v("attack_multiplier")),
            is_defense: !!v('defense_card_id'),
            rarity: rarity,
            trait: v('trait'),
            set: parseInt(v('set')),
            type: parseInt(v('type')),
            hidden: !!v('hidden'),
            combo_card_id: parseInt(v("combo_card_id")) || null,
            health: parseInt(v('health')) || 0,
            attack: parseInt(v('attack')) || 0,
            health_multiplier: parseFloat(v('health_multiplier')) || 0,
            attack_multiplier: parseFloat(v('attack_multiplier')) || 0
        }, [].slice.apply(unit.querySelectorAll('unit > skill'))), [].slice.apply(unit.querySelectorAll('upgrade')));

        var category = categorize_card({isItem: function () { return false; }}, card);

        seenCards[displayName] = category.deck || seenCards[displayName];

        return card;
    }

    function CardCollection(listResponseXML) {
        this.defaultInclude = ['deck'];

        listResponseXML = listResponseXML.map(function (responseXML) {
            return (new DOMParser).parseFromString(responseXML, 'application/xml');
        });

        listResponseXML = listResponseXML.concat().sort(function (alpha, bravo) {
            return bravo.querySelectorAll('unit').length - alpha.querySelectorAll('unit').length;
        });

        seenCards = {};

        this.items = listResponseXML.reduce(function (collection, xml) {
            return collection.concat([].slice.apply(xml.querySelectorAll('unit')).map(parseUnit));
        }, []);

        var group_characters = group_character_combos.bind(this);

        this.combos = listResponseXML.reduce(function (collection, xml) {
            return collection.concat(
                [].concat.apply([],
                    [].slice.apply(xml.querySelectorAll('root > character'))
                        .map(group_characters) // array of { character: card, combos: [] }
                        .reduce(flatten, []) // { character, combos }
                        .reduce(flatten_character_combos, []) // character, item, output
                        .map(parseCombo)
                )
            );
        }, []);

        this.farmable = listResponseXML.reduce(function (farmable, xml) {
            return [].slice.apply(xml.querySelectorAll('rewards card')).reduce(function(farmable, card) {
                if (parseInt(card.parentNode.parentNode.querySelector('id').textContent) > 1000) {
                    return farmable;
                }

                farmable[card.getAttribute('id')] = true;

                return farmable;
            }, farmable);
        }, {});

        this.types = {
            "characters": this.combos.map(function (combo) { return combo.character; }),
            "items": this.combos.map(function (combo) { return combo.item; })
        }
    }

    CardCollection.prototype.COMBO_ROLE_CHARACTER = 'character';
    CardCollection.prototype.COMBO_ROLE_ITEM = 'item';
    CardCollection.prototype.COMBO_ROLE_PRECOMBO = 'precombo';



    CardCollection.prototype.getCards = function cardcollection__getCards(include) {
        include = include || this.defaultInclude;
        return this.items.map(categorize_card.bind(null, this))
            .filter(function (item) {
                return include.reduce(function (result, key) {
                    var exclude = "-" === key[0];
                    key = key.replace(/^[+-]/, '');

                    return exclude ? (result && ! item[key]) : (result || item[key]);
                }, false);
            }).map(flatten_card_category);
    };

    CardCollection.prototype.getComboRole = function cardcollection__getComboRole(card) {
        return -1 !== this.types.characters.indexOf(card.id) ? this.COMBO_ROLE_CHARACTER
            : -1 !== this.types.items.indexOf(card.id) ? this.COMBO_ROLE_ITEM
            : this.COMBO_ROLE_PRECOMBO;
    };

    CardCollection.prototype.isPrecombo = function cardcollection__isPrecombo(card) {
        return this.COMBO_ROLE_PRECOMBO === this.getComboRole(card);
    };

    CardCollection.prototype.isItem = function cardcollection__isItem(card) {
        return this.COMBO_ROLE_ITEM === this.getComboRole(card);
    };

    CardCollection.prototype.find = function cardcollection__find(options) {
        if ("string" === typeof options) {
            options = { "name": options }
        }

        var name = util.slugify(options.name);
        var include = options.include || this.defaultInclude;

        return this.items.filter(function (card) {
            return name === card.slug;
        }).map(categorize_card.bind(null, this)).sort(function (alpha, bravo) {
            return include.reduce(function (result, key) {
                var dir = "-" === key[0] ? -1 : 1;
                key = key.replace(/^[+-]/, '');

                return result || (bravo[key] - alpha[key]) * dir;
            }, 0);
        }).map(flatten_card_category)[0];
    };

    CardCollection.prototype.findSansRarity = function cardcollection__findSansRarity(name) {
        return this.find(name) || this.find(strip_rarity_prefix(name));
    }

    CardCollection.prototype.get = function cardcollection_(id, optional) {
        for (var i = 0, card; card = this.items[i]; i++) {
            if (id === card.id) {
                return card;
            }
        }

        if (optional) {
            return null;
        }

        throw new CardNotFound;
    };

    CardCollection.prototype.getCharacters = function cardcollaction__getCharacters(name) {
        return this.items.filter(function (card) {
            return card.character === name;
        });
    }

    CardCollection.forLevel = CardCollection.prototype.forLevel = function cardcollection__forLevel(card, level) {
        card = upgrade_card(card, level);

        return new Card({
            id: card.id,
            name: card.name,
            displayName: card.displayName,
            image: card.picture,
            rarity: card.rarity,
            attack: card.attack,
            health: card.health,
            level: card.level,
            trait: card.trait,
            fuse: card.fuse,
            is_combo: card.is_combo,
            skills: Object.keys(card.skills).map(function (skill) {
                return {
                    type: skill,
                    value: Math.abs(card.skills[skill].x),
                    target: card.skills[skill].y ? (/\d/.test(card.skills[skill].y) ? "show" : "trait") : null
                };
            })
        });
    };

    CardCollection.prototype.getHydratedCombos = function cardcollection__getHydratedCombos(characterLevel, itemLevel) {
        return this.combos.map(hydrate_combo.bind(this, characterLevel, itemLevel)).filter(identity);
    };

    CardCollection.prototype.getCombo = function cardcollection__getCombo(alpha, bravo) {
        for (var i = 0, combo; combo = this.combos[i]; i++) {
            if (combo.character === alpha.id && combo.item === bravo.id) {
                return hydrate_combo.call(this, alpha.getLevelString(), bravo.getLevelString(), combo);
            } else if (combo.character === bravo.id && combo.item === alpha.id) {
                return hydrate_combo.call(this, bravo.getLevelString(), alpha.getLevelString(), combo);
            }
        }

        return null;
    };

    CardCollection.prototype.getRecipesIncluding = function cardcollection__getRecipesIncluding(card, level) {
        return this.combos.filter(function (combo) {
            return !!~[combo.card_id, combo.character, combo.item].indexOf(card.id);
        }).map(hydrate_combo.bind(this, level, level)).filter(identity);
    };

    return CardCollection;

});
