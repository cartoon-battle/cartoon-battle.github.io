---
title: Farming
weight: 5
menu: false
---
<style type="text/css">
    pre { background-color: black; color: white; padding: 1em; }
    pre .error { background-color: #A00; color: white; }
    pre .info { color: #0A0; }
    pre .comment { color: #AC0 }
</style>

<div id="root"></div>

<script type="text/javascript">

    /* global require */ require(['react-dom', 'views/Game/Farming'], function (ReactDOM, Farming) {
        ReactDOM.render(Farming(), document.getElementById('root'));
    });

</script>

## What is farming?

Farming is a bot that plays automatically for you. It does any of the following things:

 * Auto play adventure battles (any island, or selected by you). It waits until you have 6-12 adventure energy left and drains it all in a few seconds. It does not use refills.
 * Auto play arena battles. It waits until you have 9 or more energy and drains it all in a few seconds. You can also refresh for selected hero tokens, and the cost of the refreshes… Well, it’s on the house!
 * Play all your challenges for you. It completes them all on auto as soon as their energy is refreshed.
 * It can complete your daily quests by buying three basic packs each day, and making one upgrade on all of them. 
 * If you wish, it will spend all your nixon coins above 100k on basic packs, and recycle all common and rare cards. **Warning**, this will recycle all existing common and rare cards you might already have in your inventory.
 * It watches ads and opens ad crates automatically.
 * The farming bot counts towards daily activity, so you’ll never miss your login rewards again!

## Ok, sign me in, how can I start?

Fill your credentials above (if you haven’t already) and use the button to enable it. Then select the chores (described above) you’d like it to do for you. Make sure to select your favourite adventure islands for the best results.

The bot will run within one hour from saving your settings — be patient!

## I don’t want it any more, how can I stop it?

Disable the farming using the button above and save your settings.

## How can I know if it works? 

You will see a history of everything the bot does on this page.
