---
title: Farming
weight: 5
---
<style type="text/css">
    pre { background-color: black; color: white; padding: 1em; }
    pre .error { background-color: #A00; color: white; }
    pre .info { color: #0A0; }
    pre .comment { color: #AC0 }
</style>

<div class="row">
    <p class="alert alert-success">
        <a class="btn btn-primary btn-sm" href="https://discord.gg/QGvNTrE">Join me on discord</a>
        if you have any questions or troubles. 
    </p>
</div>

<div id="root"></div>

<script type="text/javascript">

    /* global require */ require(['react-dom', 'views/Game/Farming'], function (ReactDOM, Farming) {
        ReactDOM.render(Farming(), document.getElementById('root'));
    });

</script>

## What is farming?

Farming is a bot that plays automatically for you. It does any of the following things:

 * **Adventure**: Auto play adventure battles (any island, or selected by you). It waits until you have 6-12 adventure energy left and drains it all in a few seconds.
 * **Use Refills**: After your adventure farming is done, all adventure refills are used as well. This is for paying members only. 
 * **Arena**: Auto play arena battles. It waits until you have 9 or more energy and drains it all in a few seconds. 
 * **Challenges**: Play all your challenges for you. It completes within an hour or two before the challenge energy ends.
 * **Daily quests**: It can complete your daily quests by buying three basic packs each day, and making one upgrade on all of them. 
 * **Basic packs**: If you wish, it will spend all your nixon coins above 100k on basic packs, and recycle all common and rare cards.
   **Warning**, this will recycle all existing common and rare cards you might already have in your inventory. For paying members only.
 * It watches ads and opens ad crates automatically.
 * The farming bot counts towards daily activity, so you’ll never miss your login rewards again!

## Ok, sign me in, how can I start?

Fill your credentials above (if you haven’t already) and use the button to enable it. Then select the chores (described above) you’d like it to do for you. Make sure to select your favourite adventure islands for the best results.

The bot will run within one hour from saving your settings — be patient!

## Can it do Sieges and Rumbles

No. No guild events. 

It will also skip the Swole Challenge, as you’re better off deciding on your own how to play it.

## Can it automatically use my refills? 

Only for adventure, only for paying users. It will not refill arena, it would create an unfair advantage in the brawl.

## Is it free?

No, it’s a paid tool, with some exceptions. And there is a free trial.

## I don’t want it any more, how can I stop it?

Disable the farming using the button above and save your settings. This will not cancel your payments. To do so go to Paypal and stop the subscription.

## How can I know if it works? 

You will see a history of everything the bot does on this page.

## Will I be banned for using this?

Dunno, I’m not the one that gives the bans. Ask Kong.
