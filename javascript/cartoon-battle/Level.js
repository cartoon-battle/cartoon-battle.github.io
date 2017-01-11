define(function () {
    function Level(level, rarity) {
        level = (""+(level || "1")).match(/^\s*(\d+|\^)\s*([*]{0,2})$/);

        var fuseLevel = rarity.getFusionLevel(),
            value = parseInt(level[1]) || fuseLevel, // allow a "max-level" shortcut
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
    };

    Level.prototype.getFuse = function level__getFuse() {
        return this.fuse;
    };

    Level.prototype.getAbsoluteValue = function level__getAbsoluteValue() {
        return this.absoluteValue;
    };

    return Level;
});
