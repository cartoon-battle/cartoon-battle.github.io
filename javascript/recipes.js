define(['cartoon-battle'], function (getCards) {
    var table = document.querySelector('table');
    var tbody = table.querySelector('tbody');
    var input = document.forms[0].querySelector('input');

    /** @var CardCollection cards */
    var cards;

    function clear() {
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }

        table.style.display = 'none';
    }

    function add(recipe) {

        tbody.appendChild([recipe.character, recipe.item, recipe.result].reduce(function (tr, card) {
            return tr.appendChild(document.createElement('td').appendChild((function (node) {
                node.onclick = function () {
                    return recipes(card);
                };

                return node;
            })(cards.forLevel(card, tr.childNodes.length < 2 ? '^*' : "1").node)).parentNode).parentNode;
        }, document.createElement('tr')));

        table.style.display = '';
    }

    function recipes(card) {
        if (!card) {
            return;
        }

        clear();
        cards.getRecipesIncluding(card, '^*').forEach(add);

        if ('history' in window && location.search.substr(1) !== card.slug) {
            window.history.pushState({}, '', '?' + card.slug);
        }

    }

    clear();

    document.querySelector('form').addEventListener('card', function (event) {
        event.preventDefault();

        recipes(event.detail);
    });

    return getCards(function (items) {
        cards = items;

        if (window.location.search) {
            setTimeout(function () {
                recipes(input.find(window.location.search.substr(1)));
            }, 0);
        }
    });

});