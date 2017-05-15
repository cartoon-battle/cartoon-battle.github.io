---
layout: null
---
define({
    "images_cdn": '{{ site.images_cdn }}',
    "files": ['cards.xml', 'cards_finalform.xml', 'cards_mythic.xml', 'combos.xml', 'missions.xml', '/assets/cb_cards.xml'],
    "rarities": {{ site.data.values.rarities|jsonify }},
    "data_url": '{{ site.cards_url }}',
    "api_endpoint": "https://animation-throwdown.narzekasz.pl/api"
});
