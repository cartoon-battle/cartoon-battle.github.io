define(function () {
    var RARITY_LEVELS = ['common', 'rare', 'epic', 'legendary', 'mythic'];

    function Rarity(value) {
        this.name = (parseInt(value) == value) ? RARITY_LEVELS[value - 1] : value || RARITY_LEVELS[0];
    }

    Rarity.prototype.getName = function rarity__getName() {
        return this.name;
    };

    Rarity.prototype.getLevel = function rarity__getLevel() {
        return RARITY_LEVELS.indexOf(this.name) + 1;
    };

    Rarity.prototype.getFusionLevel = function rarity__getFusionLevel() {
        return this.getLevel() + 2;
    };

    return Rarity;
});
