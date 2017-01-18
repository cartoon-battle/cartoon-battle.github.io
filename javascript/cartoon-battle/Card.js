define(['./config', './util', './Rarity'], function (config, util, Rarity) {
    function Card(value) {
        value = value || {};
        this.node = util.createFragment('cb-card', [
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

        this.node.card = this;

        this.setId(value.id);
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

    Card.prototype.setId = function card__setId(id) {
        this.id = parseInt(id) || null;
    };

    Card.prototype.getId = function card__getId() {
        return this.id;
    };

    Card.prototype.getName = function card__getName() {
        return this.name;
    };

    Card.prototype.setName = function card__setName(name) {
        this.name = name || "";

        this.node.querySelector('cb-name').textContent = this.name;
        this.node.setAttribute('slug', this.getSlug());
    };

    Card.prototype.getSlug = function card__getSlug() {
        return util.slugify(this.name);
    };

    Card.prototype.getLevelString = function card__getLevelString() {
        return "" + this.level + "*"['repeat'](this.fuse);
    };

    Card.prototype.getLevelValue = function card__getLevelValue() {
        return this.level + this.rarity.getFusionLevel() * this.fuse;
    };

    Card.prototype.getFullDescription = function card__getGetFullDescription() {
        return this.name + " " + this.getLevelString();
    };

    Card.prototype.setRarity = function card__setRarity(rarity) {
        this.rarity = new Rarity(rarity);

        this.node.setAttribute('rarity', this.rarity.name);
    };

    Card.prototype.getRarity = function card__getRarity() {
        return this.rarity;
    };

    Card.prototype.setLevel = function card__setLevel(level) {
        this.level = parseInt(level) || 1;

        this.node.setAttribute('level', this.node.querySelector('cb-level').textContent = this.level);
    };

    Card.prototype.setFuse = function card__setFuse(fuse) {
        this.fuse = parseInt(fuse) || 0;

        this.node.setAttribute('fused', this.fuse + 1);
    };


    Card.prototype.setImage = function card__setImage(image) {
        if (this.image === image) {
            return ;
        }

        this.image = image;

        this.node.querySelector("img").src = config.images_cdn + "deck/cards/" + this.image + ".png";
    };

    Card.prototype.setAttack = function card__setAttack(attack) {
        this.attack = parseInt(attack) || 0;
        this.updateStats();
    };

    Card.prototype.setHealth = function card__setHealth(health) {
        this.health = parseInt(health) || 0;
        this.updateStats();
    };

    Card.prototype.updateStats = function _card__udateStats() {
        var stats = [this.attack, this.health];

        [].slice.apply(this.node.querySelectorAll('cb-stats cb-value')).forEach(function (e, i) {
            e.textContent = stats[i];
        });
    };

    Card.prototype.setTrait = function card__setTrait(trait) {
        this.trait = trait || "";

        if (this.trait) {
            this.node.setAttribute("trait", this.trait);
        } else if (this.node.hasAttribute('trait')) {
            this.node.removeAttribute('trait');
        }
    };

    Card.prototype.setSkills = function card__setSkills(skills) {
        skills = [].slice.call(skills || [], 0, 3);

        this.skills = skills;

        this.node.setAttribute('skills', "" + skills.length);

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
    };

    Card.prototype.getSkills = function card__getSkills() {
        return this.skills;
    };

    Card.prototype.getSkillValue = function card__getSkillValue(name) {
        return this.skills.reduce(function (value, skill) {
            return value || ((skill.type === name) ? skill.value : 0)
        }, 0);
    };

    return Card;
});
