define(['cartoon-battle', 'cartoon-battle/util', 'https://rubaxa.github.io/Sortable/Sortable.js'], function (getCards, util, Sortable) {

    var form = document.forms[0];
    var result = document.getElementById('result');
    var share = result.querySelector('input');
    var deck = document.getElementById('deck');
    var problems = document.getElementById('problems');
    var cardSelector = form.card;
    var level = form.level;

    form.onsubmit = function () {
        try {
            add();
        } catch (E) { }

        return false;
    };

    var cardList;

    Sortable.create(deck, {
        animation: 150,
        draggable: ".item",
        onUpdate: update
    });


    function getCurrentCard() {
        var card = cardSelector.value;
        if (!card || !level.validity.valid) {
            return;
        }

        return {
            'card': cardList.find(card),
            'level': level.value
        }
    }

    function update() {
        if (!deck.querySelector('cb-card')) {
            result.style.display =  "none";
            return ;
        }

        var cards = [].slice.apply(deck.querySelectorAll('.item')).map(function (item) {
            return item.card;
        });


        result.style.display =  "";

        var data = cards.reduce(function (data, card) {
            return data + (data ? "&" : "") + card.getSlug() + "=" + card.getLevelString();
        }, "");

        var byType = cards.reduce(function (items, card) {
            if (cardList.isPrecombo(card)) {
                return items;
            }

            var type = cardList.getComboRole(card);

            items[type] = (items[type]||0) + 1;

            return items;
        }, {});

        var combos = cards.reduce(function (combos, card) {
            if (card.getName() in combos || cardList.isPrecombo(card)) {
                return combos;
            }

            combos[card.getName()] = cards.filter(function (comboCandidate) {
                return card.getId() !== comboCandidate.getId() && cardList.getCombo(card, comboCandidate);
            }).length / (cards.length - byType[cardList.getComboRole(card)]);

            return combos;
        }, {});

        combos = Object.keys(combos).map(function (key) {
            return {
                "name": key,
                "count": combos[key]
            }
        }).sort(function (alpha, bravo) {
            return alpha.count - bravo.count;
        }).filter(function (item) {
            return item.count < 0.75;
        }).map(function (item) {
            return {
                "name": item.name,
                "count": Math.round(item.count * 100) + "%"
            }
        });

        problems.style.display = "none";
        (function (table) { table && table.parentNode.removeChild(table); })(problems.querySelector('table'));

        if (combos.length) {
            problems.style.display = 'block';
            problems.appendChild(util.createTable(combos, ["Card name", "Combo chance"]));
        }


        share.value = window.location.href.replace(/\?.*|$/, "?" + data);
        if ('history' in window && location.href !== share.value) {
            window.history.pushState({}, '', share.value);
        }
    }

    function remove(e) {
        e && e.parentNode && e.parentNode.removeChild(e);

        update();
    }

    function add(card){
        var needsUpdate = !card;
        card = card || getCurrentCard();

        if (!card || !card.card) {
            cardSelector.parentNode.classList.add('has-error');
            cardSelector.focus();
            return;
        }

        cardSelector.parentNode.classList.remove('has-error');

        try {
            card = cardList.forLevel(card.card, card.level);
        } catch (E) {
            E.message && showMessage(E.message, 'danger');
            throw E;
        }

        var item = document.createElement('div');
        item.className = 'item col-xs-3';
        item.card = card;

        deck.appendChild(item);
        item.appendChild(card.node);

        item.appendChild((function (btn) {
            btn.className = 'btn btn-danger btn-xs';
            btn.onclick = function () { remove(this.parentNode); };
            btn.textContent = 'Remove';

            btn.insertBefore(document.createElement('span'), btn.firstChild).className = 'glyphicon glyphicon-trash';

            return btn;
        })(document.createElement('button')));

        needsUpdate && update();
    }

    getCards(function (cards) {

        var datalist = document.getElementById(cardSelector.getAttribute('list'));

        cardList = cards;

        form.querySelector('button').removeAttribute('disabled');
        cardSelector.placeholder = "choose a card";

        cards.getDeck().forEach(function (card) {
            var option = document.createElement('option');
            option.textContent = card.name;
            datalist.appendChild(option);
        });

        window.onpopstate = function () {
            deck.innerHTML = '';
            window.location.search.substr(1).split(/&/).forEach(function (item) {
                if (!item) {
                    return;
                }

                add({
                    "card": cards.find(item.split(/=/)[0]),
                    "level": decodeURIComponent(item.split(/=/)[1] || "1")
                });
            });

            update();
        };
        window.onpopstate();
    });
});