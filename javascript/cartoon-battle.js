/* global define */ /* global FuzzySet */ define(['cartoon-battle/config', 'cartoon-battle/CardCollection'], function (config, CardCollection) {

    var cards;

    function cartoonbattle__createDatalist(cards, include) {
        var id = "cardlist_" + (include||["_default"]).join("_");

        if (document.getElementById(id)) {
            return id;
        }

        var datalist = document.body.appendChild(document.createElement('datalist'));
        datalist.id = id;

        cards.forEach(function (card) {
            var option = document.createElement('option');
            option.textContent = card.name;
            datalist.appendChild(option);
        });

        return id;
    }

    function cartoonbattle__initCustomElements() {
        var inputs = document.querySelectorAll('input[data-cards]');
        if (!inputs.length) {
            return;
        }

        cartoonbattle__getCards(function (cards) {
            [].slice.apply(inputs).forEach(function (input) {
                if (!input.form) {
                    return;
                }

                var include = input.dataset['cards'] && input.dataset['cards'].split(/,\s*/);
                var filteredCards = cards.getCards(include);

                input.setAttribute('list', cartoonbattle__createDatalist(filteredCards, include));
                input.placeholder  = "choose a card";

                input.find = Function.prototype.bind.call(cards, Object.assign(
                    Object.create(cards.constructor.prototype),
                    cards,
                    {"items": filteredCards, defaultInclude: include}
                ));

                var button = input.form.querySelector(input.dataset.targetButton || 'button');
                if (button) {
                    button.removeAttribute('disabled');

                    function cardFoundCallback(card) {
                        var event = new CustomEvent('card');

                        event.initCustomEvent(event.type, true, true, card);
                        input.dispatchEvent(event);

                        return false;
                    }

                    button.form.onsubmit = button.onclick = function () {
                        var card = input.find(input.value);

                        if (card) {
                            return cardFoundCallback(card);
                        }

                        require(['fuzzyset'], function (/* FuzzySet */) {
                            var result = FuzzySet(filteredCards.map(function (card) {
                                return card.name;
                            })).get(input.value).shift();

                            return cardFoundCallback((result[0] > 0.5) ? input.find(input.value = result[1]) : null);
                        });

                        return false;
                    };
                }

            });
        });
    }

    function getFile(file, cb) {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", /\//.test(file) ? file : config.data_url + file);
        xhr.onload = function () {
            cb(sessionStorage[file] = xhr.responseText);
        };

        xhr.send();
    }

    function cartoonbattle__getCards(cb) {
        var data = [], dispatched = false;

        if (cards) {
            return cb(cards);
        }

        function data__callback(content) {
            data.push(content);

            if (data.length === config.files.length && false === dispatched) {
                cb(cards = new CardCollection(data));
            }
        }

        config.files.forEach(function (file) {
            if (sessionStorage[file]) {
                return data__callback(sessionStorage[file]);
            }

            getFile(file, data__callback);
        });
    }

    if (!!~["complete", "loaded", "interactive"].indexOf(document.readyState)) {
        cartoonbattle__initCustomElements();
    }

    document.addEventListener('DOMContentLoaded', cartoonbattle__initCustomElements);

    return cartoonbattle__getCards;
});
