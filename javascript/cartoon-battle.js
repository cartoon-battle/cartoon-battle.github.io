define(['cartoon-battle/config', 'cartoon-battle/CardCollection'], function (config, CardCollection) {

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

                input.find = cards.find.bind({"items": filteredCards});

                var button = input.form.querySelector(input.dataset['target-button'] || 'button');
                if (button) {
                    button.removeAttribute('disabled');

                    button.form.onsubmit = button.onclick = function () {
                        var event = new CustomEvent('card'), card = input.find(input.value);

                        event.initCustomEvent(event.type, true, true, card);
                        button.form.dispatchEvent(event);

                        return !event.defaultPrevented && false;
                    };
                }

            });
        });
    }

    function getFile(file, cb) {
        var xhr = new XMLHttpRequest;

        xhr.open("GET", config.data_url + file);
        xhr.onload = function () {
            cb(sessionStorage[file] = xhr.responseText);
        };

        xhr.send();
    }

    function cartoonbattle__getCards(cb) {
        var data = [];

        if (cards) {
            cb(cards);
        }

        function data__callback(content) {
            data.push(content);

            if (data.length === config.files.length) {
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

    window.addEventListener('load', cartoonbattle__initCustomElements);

    return cartoonbattle__getCards;
});
