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

    return getCards(function recipes__getCards(items) {
        cards = items;

        function deferred_recipes() {
            var search = window.location.search.substr(1);

            if (input.find) { // wait for other scripts to attach to the input
                if (search) {
                    recipes(input.find(search));
                }

                return;
            }

            setTimeout(deferred_recipes, 250);
        }

        window.onpopstate = deferred_recipes;

        deferred_recipes();
    });

});