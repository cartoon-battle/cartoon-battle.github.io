/* global define */ define(['cartoon-battle/config'], function (config) {

    function Rarity(value) {
        this.name = (parseInt(value) == value) ? Rarity.RARITY_LEVELS[value - 1] : value || Rarity.RARITY_LEVELS[0];
    }

    Rarity.RARITY_LEVELS = config.rarities;

    Rarity.prototype.getName = function rarity__getName() {
        return this.name;
    };

    Rarity.prototype.getLevel = function rarity__getLevel() {
        return Rarity.RARITY_LEVELS.indexOf(this.name) + 1;
    };

    Rarity.prototype.getFusionLevel = function rarity__getFusionLevel() {
        return this.getLevel() + 2;
    };

    return Rarity;
});
