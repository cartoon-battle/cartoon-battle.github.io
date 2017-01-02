define(['cartoon-battle', 'cartoon-battle/util', 'https://rubaxa.github.io/Sortable/Sortable.js'], function (getCards, util, Sortable) {

    var form = document.forms[0];
    var result = document.getElementById('result');
    var share = result.querySelector('input');
    var deck = document.getElementById('deck');
    var problems = document.getElementById('problems');
    var cardSelector = form.card;
    var level = form.level;
    var availableCombos = document.getElementById('available-combos');

    form.addEventListener('card', function (e) {
        e.preventDefault();

        if (!e.detail || !level.validity.valid) {
            cardSelector.parentNode.classList.add('has-error');
            (card && level || cardSelector).focus();
            return ;
        }

        cardSelector.parentNode.classList.remove('has-error');

        add(e.detail, level.value, true);
    });

    var cardList;

    Sortable.create(deck, {
        animation: 150,
        draggable: ".item",
        onUpdate: update
    });

    function update() {
        if (!deck.querySelector('cb-card')) {
            result.style.display =  "none";
            return ;
        }

        var cards = [].slice.apply(deck.querySelectorAll('cb-card')).map(function (item) {
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


        // clear avail combos:
        while (availableCombos.firstChild) availableCombos.removeChild(availableCombos.firstChild);
        availableCombos.appendChild(document.createElement('h2')).textContent = 'Combos you can create using this deck';

        var combos = cards.reduce(function (combos, card) {
            if (card.getName() in combos || cardList.isPrecombo(card)) {
                return combos;
            }

            var cardCombos = cards.map(function (comboCandidate) {
                return card.getId() !== comboCandidate.getId() && cardList.getCombo(card, comboCandidate);
            }).filter(function (combo) {
                 return !!combo;
            });


            cardCombos.forEach(function (combo) {
                var title = combo.character.name + " + " + combo.item.name;

                if (!availableCombos.querySelector('[title="'+ title +'"'))
                    availableCombos.appendChild(cardList.forLevel(combo.result).node).title = title;
            });

            combos[card.getName()] = cardCombos.length / (cards.length - byType[cardList.getComboRole(card)]);

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

        if (combos.length && cards.length > 15) {
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

    function add(card, level, needsUpdate) {

        try {
            card = cardList.forLevel(card, level || 1);
        } catch (E) {
            E.message && showMessage(E.message, 'danger');
            throw E;
        }

        var item = document.createElement('div');
        item.className = 'item col-xs-3';

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

        cardList = cards;

        window.onpopstate = function () {
            deck.innerHTML = '';
            window.location.search.substr(1).split(/&/).forEach(function (item) {
                if (!item) {
                    return;
                }

                add(cards.find(item.split(/=/)[0]), decodeURIComponent(item.split(/=/)[1] || "1"));
            });

            update();
        };
        window.onpopstate();
    });
});