define(['cartoon-battle', 'cartoon-battle/util', 'cartoon-battle/Analysis'], function (getCards, util, Analysis) {

    var form = document.forms[0];
    var button = form.querySelector('button');
    var result = document.getElementById('result');
    var share = result.querySelector('input');
    var deck = document.getElementById('deck');
    var problems = document.getElementById('problems');
    var cardSelector = form.card;
    var level = form.level;
    var availableCombos = document.getElementById('available-combos');
    var overview = document.getElementById('overview');

    document.getElementById('save-your-deck').onclick = function () {
        localStorage.deck = share.value;
        showMessage('Your deck have been saved', 'success');
    };

    var groupByButtons = [].slice.apply(document.querySelectorAll('[data-group-by]'));

    groupByButtons.forEach(function (button) {
        button.onclick = function () {
            groupByButtons.forEach(function (e) {
                e.classList.remove('active');
            });

            this.classList.add('active');

            update();
        }
    });

    if (localStorage.deck) {
        (function (yourDeck, deck) {
            yourDeck.appendChild(document.createTextNode('Load your saved deck'));
            yourDeck.href = deck;
            yourDeck.classList.add('pull-right');
            yourDeck.onclick = function () {
                if ("history" in window) {
                    history.pushState({}, '', this.href);
                }
            }

        })(document.querySelector('.panel-heading').appendChild(document.createElement('a')), localStorage.deck);
    }

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

    function update() {
        var cards = [].slice.apply(deck.querySelectorAll('cb-card')).map(function (item) {
            return item.card;
        });

        result.style.display =  cards.length ? "" : "none";

        var data = cards.map(function (card) {
            return card.getSlug() + "=" + card.getLevelString();
        }).join("&");

        var analysis = new Analysis(cardList, cards);

        // clear avail combos:
        util.cleanElement(availableCombos);

        overview.style.display = analysis.isDeck() ? 'block' : 'none';
        overview.querySelectorAll('[data-card-role]').forEach(function (counter) {
            counter.textContent = analysis.types[counter.dataset.cardRole] || "n/a";
        });

        if (analysis.getPotentialCombos()) {
            overview.querySelector('[data-card-role="combos"]')
                .appendChild(document.createElement('small'))
                .appendChild(document.createTextNode('/' + analysis.getPotentialCombos()));
        }

        problems.style.display = "none";
        (function (table) { table && table.parentNode.removeChild(table); })(problems.querySelector('table'));

        if (analysis.isDeck() && analysis.getProblems()) {
            problems.style.display = 'block';

            problems.appendChild(util.createTable(analysis.getProblems(), ["Card name", "Combo chance"]));
        }

        var groupBy = document.querySelector('[data-group-by].active').dataset.groupBy;

        analysis.getCombos(groupBy).forEach(function (comboGroup) {
            comboGroup.forEach(function (card) {
                availableCombos.appendChild(cardList.forLevel(card.result).node)
                    .title = card.character.name + ' + ' + card.item.name;
            });

            availableCombos.appendChild(document.createElement('hr'));
        });

        availableCombos.previousSibling.style.display = availableCombos.style.display = availableCombos.firstChild ? '' : 'none';
        availableCombos.lastChild && availableCombos.removeChild(availableCombos.lastChild);

        share.value = window.location.href.replace(/\?.*|$/, data ? ("?" + data) : '');
        if ('history' in window && location.href !== share.value) {
            window.history.pushState({}, '', share.value);
        }
    }

    function enter_edit_mode() {
        cancel_edit_mode();
        button.lastChild.nodeValue = ' Save';
        button.querySelector('span').className = 'glyphicon glyphicon-edit';
    }

    function cancel_edit_mode() {
        [].slice.apply(deck.querySelectorAll('.edit')).forEach(function (e) {
            e.classList.remove('edit');
        });

        button.lastChild.nodeValue = ' Add';
        button.querySelector('span').className = 'glyphicon glyphicon-plus';
    }

    function edit(node) {
        if (node.parentNode.classList.contains('edit')) {
            return cancel_edit_mode();
        }

        enter_edit_mode();

        node.parentNode.classList.add('edit');

        cardSelector.value = node.card.name;
        level.value = node.card.getLevelString();
    }

    function remove(e) {
        cancel_edit_mode();
        e && e.parentNode && e.parentNode.removeChild(e);

        update();
    }

    function add(card, level, needsUpdate) {
        [].slice.apply(deck.querySelectorAll('.edit')).forEach(function (e) {
            deck.removeChild(e);
        });
        cancel_edit_mode();

        try {
            card = cardList.forLevel(card, level || 1);
        } catch (E) {
            E.message && showMessage(E.message, 'danger');
            throw E;
        }

        var item = document.createElement('div');
        item.className = 'item col-xs-3';

        [].slice.apply(deck.querySelectorAll('cb-card')).reduce(function (success, e) {
            if (success) {
                return success;
            }

            if ((e.card.name === card.name && e.card.level > card.level) || e.card.name > card.name) {
                deck.insertBefore(item, e.parentNode);

                return true;
            }

            return false;

        }, false) || deck.appendChild(item);
        item.appendChild(card.node);

        item.appendChild((function (btn) {
            btn.className = 'btn btn-danger btn-xs';
            btn.onclick = function () { remove(this.parentNode); };
            btn.textContent = ' Remove';

            btn.insertBefore(document.createElement('span'), btn.firstChild).className = 'glyphicon glyphicon-trash';

            return btn;
        })(document.createElement('button')));

        item.appendChild((function (btn) {
            btn.className = 'btn btn-primary btn-xs pull-right';
            btn.onclick = function () { edit(this.parentNode.querySelector('cb-card')); };
            btn.textContent = ' Edit ';

            btn.insertBefore(document.createElement('span'), btn.firstChild).className = 'glyphicon glyphicon-edit';

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

                item = item.split(/=/);
                var name = item[0], level = item[1] || "1";

                var card = cards.find(name);

                if (!card) {
                    return showMessage("Can’t find card named: " + name);
                }

                add(card, decodeURIComponent(level));
            });

            update();
        };
        window.onpopstate();
    });
});
