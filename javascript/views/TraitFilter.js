/* global define */ define(['views/ButtonGroupFilter', 'cartoon-battle/config'], function (Filter, config) {

    return function (props) {
        return Filter(Object.assign({}, props, {
            "items": config.traits,
            "imagePath": "deck/traits/icon_large_%s.png",
            "width": 32,
            "height": 32,
            "label": "Show results for cards with selected trait:"
        }));
    };
});
