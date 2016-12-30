define(['./util', './Rarity', './Level', './Card'], function define__cardcollection(util, Rarity, Level, Card) {

    function categorize_card(card) {
        var standard = card.set < 5000;
        var deck = standard && !card.commander && !card.is_combo && !card.is_defense && !card.hidden;
        var combo = 1 === card.levels.length && !!card.attack_multiplier;

        return {
            "standard": standard,
            "deck": deck,
            "combo": combo,
            "precombo": !!card.combo_card_id,
            "hidden": card.hidden,
            "card": card
        }
    }

    function flatten_card_category(cardCategory) {
        return cardCategory.card;
    }

    function hydrate_combo(combo) {
        var character = this.get(combo.character);
        var item = this.get(combo.item);
        var result = util.clone(this.get(combo.card_id));

        result.rarity = Math.ceil(character.rarity /2 + item.rarity /2);
        result.health = Math.round(1.1 * (item.health + character.health) * result.health_multiplier);
        result.attack = Math.round(1.1 * (item.attack + character.attack) * result.attack_multiplier);

        return {
            "character": character,
            "item": item,
            "result": addLevels(result, []) // recalculate first level
        }
    }


    var COMBO_ROLE_CHARACTER = 'character';
    var COMBO_ROLE_ITEM = 'item';

    var COMBO_ROLE_PRECOMBO = 'precombo';

    function __comboId(alpha, bravo) {
        return [alpha, bravo].sort().join("~");
    }

    function parseCombo(combo) {
        var character = parseInt(combo.querySelector('cards').getAttribute('card1'));
        var item = parseInt(combo.querySelector('cards').getAttribute('card2'));

        return {
            "id": __comboId(character, item),
            "card_id": parseInt(combo.querySelector('card_id').textContent),
            "character": character,
            "item": item
        }
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
            unit.skills[e.getAttribute('id')] = parseInt(e.getAttribute('x') || e.getAttribute('v')) * (e.hasAttribute('y') ? -1 : 1);
        });

        return unit;
    }

    function normalizePicture(picture, type) {
        return ['FG', 'AD', 'BB', 'KH', 'FT', 'generic'][parseInt(type)-1]
            + "_" + picture.replace(/^(fg|koth|ad|bb|ft|kh|fr|generic)_/i, '');
    }

    function parseUnit(unit) {
        function v(name) {
            return (unit.querySelector(name) || {}).textContent;
        }

        return addLevels(addSkills({
            id: parseInt(v('id')),
            name: v('name'),
            slug: util.slugify(v('name')),
            desc: v('desc'),
            picture: normalizePicture(v('picture'), v('type')),
            commander: !!v('commander'),
            is_combo: !!parseFloat(v("attack_multiplier")),
            is_defense: !!v('defense_card_id'),
            rarity: parseInt(v('rarity')),
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
    }

    function CardCollection(listResponseXML) {
        listResponseXML = listResponseXML.map(function (responseXML) {
            return (new DOMParser).parseFromString(responseXML, 'application/xml');
        });

        this.items = listResponseXML.reduce(function (collection, xml) {
            return collection.concat([].slice.apply(xml.querySelectorAll('unit')).map(parseUnit));
        }, []);

        this.combos = listResponseXML.reduce(function (collection, xml) {
            return collection.concat([].slice.apply(xml.querySelectorAll('combo')).map(parseCombo));
        }, []);

        this.types = {
            "characters": this.combos.map(function (combo) { return combo.character; }),
            "items": this.combos.map(function (combo) { return combo.item; })
        }
    }

    CardCollection.prototype.getCards = function cardcollection__getCards(include) {
        return this.items.map(categorize_card)
            .filter(function (item) {
                return (include || ['deck']).reduce(function (result, key) {
                    var exclude = "-" === key[0];
                    key = key.replace(/^[+-]/, '');

                    return exclude ? (result && ! item[key]) : (result || item[key]);
                }, false);
            }).map(flatten_card_category);
    };

    CardCollection.prototype.getComboRole = function cardcollection__getComboRole(card) {
        return -1 !== this.types.characters.indexOf(card.id) ? COMBO_ROLE_CHARACTER
            : -1 !== this.types.items.indexOf(card.id) ? COMBO_ROLE_ITEM
            : COMBO_ROLE_PRECOMBO;
    };

    CardCollection.prototype.isPrecombo = function cardcollection__isPrecombo(card) {
        return COMBO_ROLE_PRECOMBO === this.getComboRole(card);
    };

    CardCollection.prototype.find = function cardcollection__find(options) {
        if ("string" === typeof options) {
            options = { "name": options }
        }

        var name = util.slugify(options.name);
        var include = options.include || ['deck'];

        return this.items.filter(function (card) {
            return name === card.slug;
        }).map(categorize_card).sort(function (alpha, bravo) {
            return include.reduce(function (result, key) {
                var dir = "-" === key[0] ? -1 : 1;
                key = key.replace(/^[+-]/, '');

                return result || (bravo[key] - alpha[key]) * dir;
            }, 0);
        }).map(flatten_card_category)[0];
    };

    CardCollection.prototype.get = function cardcollection_(id) {
        for (var i = 0, card; card = this.items[i]; i++) {
            if (id === card.id) {
                return card;
            }
        }
    };

    CardCollection.forLevel = CardCollection.prototype.forLevel = function cardcollection__forLevel(card, level) {
        card = util.clone(card);

        level = new Level(level, new Rarity(card.rarity));

        var upgrade = card.levels[level.getAbsoluteValue() - 1];
        if (!upgrade) {
            throw new Error('„' + card.name + '” doesn’t have this level: ' + level.getAbsoluteValue());
        }

        card.attack = upgrade.attack;
        card.health = upgrade.health;
        card.skills = upgrade.skills;

        return new Card({
            id: card.id,
            name: card.name,
            image: card.picture,
            rarity: card.rarity,
            attack: card.attack,
            health: card.health,
            level: level.getValue(),
            trait: card.trait,
            fuse: level.getFuse(),
            skills: Object.keys(card.skills).map(function (skill) {
                return {
                    type: skill,
                    value: Math.abs(card.skills[skill]),
                    target: card.skills[skill] < 0
                };
            })
        });
    };

    CardCollection.prototype.getCombo = function cardcollection__getCombo(alpha, bravo) {
        var search = __comboId(alpha.id, bravo.id);

        for (var i = 0, combo; combo = this.combos[i]; i++) {
            if (combo.id === search) {
                return hydrate_combo.call(this, combo);
            }
        }

        return null;
    };

    CardCollection.prototype.getRecipesIncluding = function(card) {
        return this.combos.filter(function (combo) {
            return !!~[combo.card_id, combo.character, combo.item].indexOf(card.id);
        }).map(hydrate_combo.bind(this));
    };

    return CardCollection;

});