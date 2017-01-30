/* global define */ define(function () {

    function Setting(storage, name, label) {
        this.storage = storage;
        this.name = name;
        this.label = label;
    }



    Setting.prototype.getName = function setting__getName() {
        return this.name;
    };

    Setting.prototype.getLabel = function setting__getLabel() {
        return this.label;
    };

    Setting.prototype.getValue = function setting__getValue() {
        return this.storage[this.getName()];
    };

    Setting.prototype.setValue = function setting__setValue(value) {
        this.storage[this.getName()] = value || "";
    };

    function SettingList(settings) {
        this.settings = Object.keys(settings).map(function (name) {
            return new Setting(localStorage, name, settings[name]);
        });
    }

    SettingList.prototype.all = function settinglist__all() {
        return this.settings;
    };

    SettingList.prototype.getValue = function settingList__getValue(name, def) {
        var setting = this.settings.filter(function (setting) {
            return name === setting.getName();
        })[0];

        return setting ? setting.getValue() : def;
    };

    return new SettingList({
        "high_resolution_images": "Enable high resolution images"
    });

});
