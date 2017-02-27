/* global define */ define(['cartoon-battle', 'cartoon-battle/util'], function (getCards, util) {
    var table = document.querySelector('table');
    var tbody = table.querySelector('tbody');
    var input = document.forms.recipes.querySelector('input');
    var level = document.querySelector('select');

    /** @var CardCollection cards */
    var cards, selectedCard;

    function clear() {
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }

        table.style.display = 'none';
    }

    level.onchange = function () {
        if (selectedCard) {
            recipes(selectedCard);
        }
    };

    function add(recipe) {

        tbody.appendChild([recipe.character, recipe.item, recipe.result].reduce(function (tr, card) {
            return tr.appendChild(document.createElement('td').appendChild((function (node) {
                node.onclick = function () {
                    return (input.value = card.name) && recipes(card);
                };

                return node;
            })(cards.forLevel(card, tr.childNodes.length < 2 ? level.value : "1").node)).parentNode).parentNode;
        }, document.createElement('tr')));

        table.style.display = '';
    }

    function recipes(card) {
        if (!card) {
            return;
        }

        selectedCard = card;
        setTitle(card.name);
        "function" === typeof ga && ga("send", "event", "recipe", "search", card.name);

        clear();
        cards.getRecipesIncluding(card, level.value).forEach(add);

        filter_recipes();

        if ('history' in window && location.search.substr(1) !== card.slug) {
            window.history.pushState({}, '', '?' + card.slug);
        }

    }

    function filter_recipes() {
        function get_filter_values(name) {
            return [].slice.apply(document.querySelectorAll('[data-filter="'+name+'"].active')).map(function (e) {
                return e.dataset.value;
            });
        }

        var skills = get_filter_values('skill');
        var rarities = get_filter_values('rarity');

        [].slice.apply(table.querySelectorAll('tbody tr')).forEach(function (row) {
            var cards = [].slice.call(row.querySelectorAll('cb-card'));

            var character = cards.shift().card;
            var item = cards.shift().card;
            /** @var Card combo */
            var combo = cards.shift().card;

            row.style.display = (function () {
                var skillTypes = combo.getSkills().map(function (skill) { return skill.type; });
                var hasSkill = 0 === skills.length || skills.reduce(function (hasSkill, skill) {
                    return hasSkill || !!~skillTypes.indexOf(skill);
                }, false);

                var hasRarity = 0 === rarities.length || [character, item].filter(function (card) {
                    return card.name !== selectedCard.name;
                }).reduce(function (hasRarity, card) {
                    return hasRarity && !!~rarities.indexOf(card.getRarity().name);
                }, true);

                return hasSkill && hasRarity;
            })() ? "" : "none";
        });
    }

    clear();

    document.forms.recipes.addEventListener('card', function (event) {
        event.preventDefault();

        recipes(event.detail);
    });

    document.querySelector('fieldset[data-filters]').addEventListener('click', function (e) {
        var target = e.target;
        while (target && 'button' !== target.nodeName.toLowerCase()) {
            target = target.parentNode;
        }

        if (!target) {
            return;
        }

        target.classList.toggle('btn-default');
        target.classList.toggle('btn-info');
        target.classList.toggle('active');

        filter_recipes();

    });

    return getCards(function recipes__getCards(items) {
        cards = items;

        function deferred_recipes() {
            var search = decodeURIComponent(window.location.search.substr(1)).replace(/[+]/g, ' '), card;

            if (input.find) { // wait for other scripts to attach to the input
                if (search && (card = input.find(util.slugify(search)))) {
                    recipes(card);
                    input.value = input.value || card.name;
                }

                return;
            }

            setTimeout(deferred_recipes, 250);
        }

        window.onpopstate = deferred_recipes;

        deferred_recipes();
    });

});
