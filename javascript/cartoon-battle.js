---
layout: null
---
(function () {

function _slugify(name) {
    return name.replace(/[^\d\w -]/g, '').replace(/ /g, '-').toLowerCase();
}

function _clone(obj) {
    if (null == obj || "object" !== typeof obj) return obj;
    var copy = {};
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = _clone(obj[attr]);
    }
    return copy;
}

function _createFragment(name, children) {
    var element = document.createElement(name);
    for (var i = 0, cn; cn = children[i]; i++) {
        element.appendChild(
            2 === cn.length ? _createFragment(cn[0], cn[1]) : document.createElement(cn)
        )
    }

    return element;
}

function Rarity(value) {
    this._ = ['common', 'rare', 'epic', 'legendary'];

    this.name = (parseInt(value) == value) ? this._[value - 1] : value || this._[0];
}

Rarity.prototype.getName = function rarity__getName() {
    return this.name;
}

Rarity.prototype.getLevel = function rarity__getLevel() {
    return this._.indexOf(this.name) + 1;
}

Rarity.prototype.getFusionLevel = function rarity__getFusionLevel() {
    return this.getLevel() + 2;
}

function Level(level, rarity) {
    level = (""+(level || "1")).match(/^(\d+)\s*([*]{0,2})$/);

    var fuseLevel = rarity.getFusionLevel(),
        value = parseInt(level[1]),
        fuse = level[2].length;

    if (fuse) {
        if (value > fuseLevel) {
            throw new Error('Level ' + value + ' is too large for „'+ rarity.name +'” rarity');
        }

        value += fuseLevel * fuse;
    }

    this.absoluteValue = value || 1;
    this.fuse = Math.ceil(value / fuseLevel) - 1;
    this.value = value % fuseLevel || fuseLevel || 1;
}

Level.prototype.getValue = function level__getValue() {
    return this.value;
}

Level.prototype.getFuse = function level__getFuse() {
    return this.fuse;
}

Level.prototype.getAbsoluteValue = function level__getAbsoluteValue() {
    return this.absoluteValue;
}

function Card(value) {
    value = value || {};
    this.node = _createFragment('cb-card', [
        'img',
        'cb-name',
        ['cb-frame', [
            'cb-level',
            'cb-trait'
        ]],
        ['cb-stats', [
            'cb-value',
            'cb-value'
        ]],
        ['cb-skills', [
            'cb-value',
            'cb-value',
            'cb-value'
        ]]
    ]);

    this.setName(value.name);
    this.setImage(value.image);
    this.setAttack(value.attack);
    this.setHealth(value.health);

    this.setRarity(value.rarity);
    this.setLevel(value.level);
    this.setFuse(value.fuse);
    this.setTrait(value.trait);

    this.setSkills(value.skills);

}

Card.prototype.setName = function card__setName(name) {
    this.name = name || "";

    this.node.querySelector('cb-name').textContent = this.name;
    this.node.setAttribute('slug', this.getSlug());
}

Card.prototype.getSlug = function card__getSlug() {
    return _slugify(this.name);
}

Card.prototype.getLevelString = function card__getLevelString() {
    return "" + this.level + Array(this.fuse + 1).join('*');
}

Card.prototype.setRarity = function card__setRarity(rarity) {
    this.rarity = new Rarity(rarity); 

    this.node.setAttribute('rarity', this.rarity.name);
}

Card.prototype.setLevel = function card__setLevel(level) {
    this.level = parseInt(level) || 1;

    this.node.setAttribute('level', this.node.querySelector('cb-level').textContent = this.level);
}
Card.prototype.setFuse = function card__setFuse(fuse) {
    this.fuse = parseInt(fuse) || 0;

    this.node.setAttribute('fused', this.fuse + 1);
}


Card.prototype.setImage = function card__setImage(image) {
    if (this.image === image) {
        return ;
    }

    this.image = image;

    this.node.querySelector("img").src = "{{ site.images_cdn }}deck/cards/" + this.image + ".png";
}

Card.prototype.setAttack = function card__setAttack(attack) {
    this.attack = parseInt(attack) || 0;
    this.updateStats();
}

Card.prototype.setHealth = function card__setHealth(health) {
    this.health = parseInt(health) || 0;
    this.updateStats();
}

Card.prototype.updateStats = function _card__udateStats() {
    var stats = [this.attack, this.health];

    [].slice.apply(this.node.querySelectorAll('cb-stats cb-value')).forEach(function (e, i) {
        e.textContent = stats[i];
    });
}

Card.prototype.setTrait = function card__setTrait(trait) {
    this.trait = trait || "";

    if (this.trait) {
        this.node.setAttribute("trait", this.trait);
    } else if (this.node.hasAttribute('trait')) {
        this.node.removeAttribute('trait');
    }
}

Card.prototype.setSkills = function card__setSkills(skills) {
    var skills = [].slice.call(skills || [], 0, 3);

    this.skills = skills;

    this.node.setAttribute('skills', skills.length);

    [].slice.apply(this.node.querySelectorAll('cb-skills cb-value')).forEach(function(e, i) {
        var skill = skills[skills.length - 3 + i];

        e.setAttribute('type', skill && skill.type || "");
        e.textContent = skill && skill.value || "";

        if (skill && skill.target) {
            e.setAttribute('target', skill.target);
        } else if (e.hasAttribute('target')) {
            e.removeAttribute('target');
        }
    });
}

function addLevels(unit, upgrades) {
    var that = this;
    unit.levels = [{
        "health": unit.health,
        "attack": unit.attack,
        "skills": unit.skills
    }];

    upgrades.reduce(function(values, upgrade) {
        values = addSkills.call(that, _clone(values), [].slice.apply(upgrade.querySelectorAll('skill')));

        values.attack = parseInt((upgrade.querySelector('attack') || { 'textContent': values.attack }).textContent);
        values.health = parseInt((upgrade.querySelector('health') || { 'textContent': values.health }).textContent);

        unit.levels.push(values);

        return values;
    }, unit.levels[0]);

    return unit;
}

function addSkills(unit, skills) {
    unit.skills = unit.skills || {};

    var skillTypes = this.skillTypes;

    skills.forEach(function (e) {
        unit.skills[e.getAttribute('id')] = parseInt(e.getAttribute('x')) * (e.hasAttribute('y') ? -1 : 1);
    });

    return unit;
}

function parseUnit(unit) {
    function v(name) {
        return (unit.querySelector(name) || {}).textContent;
    }

    return addLevels.call(this, addSkills.call(this, {
        id: parseInt(v('id')),
        name: v('name'),
        slug: _slugify(v('name')),
        desc: v('desc'),
        picture: ['FG', 'AD', 'BB', 'KH', 'FT', 'generic'][parseInt(v('type'))-1] + "_" + v('picture').replace(/^(fg|koth|ad|bb|ft|kh|fr|generic)_/i, ''),
        commander: !!v('commander'),
        rarity: parseInt(v('rarity')),
        trait: v('trait'),
        set: parseInt(v('set')),
        type: parseInt(v('type')),
        hidden: !!v('hidden'),
        health: parseInt(v('health')) || 0,
        attack: parseInt(v('attack')) || 0,
        health_multiplier: parseFloat(v('health_multiplier')) || 0,
        attack_multiplier: parseFloat(v('attack_multiplier')) || 0,
    }, [].slice.apply(unit.querySelectorAll('unit > skill'))), [].slice.apply(unit.querySelectorAll('upgrade')));
}

function parseSkillType(e) {
    return {
        "id": e.querySelector('id').textContent,
        "icon": e.querySelector('icon').textContent.replace('skill_', ''),
        "name": e.querySelector('name').textContent
    }
}

function CardCollection(listResponseXML) {
    listResponseXML = listResponseXML.map(function (responseXML) {
        return (new DOMParser).parseFromString(responseXML, 'application/xml');
    });  

    this.skillTypes = listResponseXML.reduce(function (collection, xml) {
        return collection.concat([].slice.apply(xml.querySelectorAll('skillType')).map(parseSkillType));
    }, []);

    var that = this;
    this.items = listResponseXML.reduce(function (collection, xml) {
        return collection.concat([].slice.apply(xml.querySelectorAll('unit')).map(function (unit) {
            return parseUnit.call(that, unit);
        }));
    }, []);
}

CardCollection.prototype.getDeck = function cardcollection__getDeck() {
    return this.items.filter(function (card) { return card.set < 5000 && !card.attack_multiplier; });
}

CardCollection.prototype.find = function cardcollection__find(name) {
    name = _slugify(name);
    for (var i = 0, card; card = this.items[i]; i++) {
        if (name === card.slug && card.set < 5000 && !card.attack_multiplier) {
            return card;
        }
    }

    for (var i = 0, card; card = this.items[i]; i++) {
        if (name === card.slug) {
            return card;
        }
    }
}

CardCollection.forLevel = CardCollection.prototype.forLevel = function cardcollection__forLevel(card, level) {
    card = _clone(card);

    level = new Level(level, new Rarity(card.rarity));

    var upgrade = card.levels[level.getAbsoluteValue() - 1]; 
    if (!upgrade) {
        throw new Error('„' + card.name + '” doesn’t have this level: ' + level.getAbsoluteValue());
    }

    card.attack = upgrade.attack;
    card.health = upgrade.health;
    card.skills = upgrade.skills;

    return new Card({
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
                target: Math.sign(card.skills[skill]) < 0
            };
        }),
    });
}

function getFile(url, cb) {
    var xhr = new XMLHttpRequest;
    xhr.open("GET", url);
    xhr.onload = function () {
        cb(sessionStorage[url] = xhr.responseText);
    }

    xhr.send();
}

window.Card = Card;
window.CardCollection = CardCollection;
window.getCards = function (url, cb) {
    var files = [url + "cards.xml", url + "cards_finalform.xml"];
    var data = [];

    function data__callback(content) {
        data.push(content);

        if (data.length === files.length) {
            cb(new CardCollection(data));
        }
    }

    files.forEach(function (file) {
        if (sessionStorage[file]) {
            return data__callback(sessionStorage[file]);
        }

        getFile(file, data__callback);
    });
};

})();
