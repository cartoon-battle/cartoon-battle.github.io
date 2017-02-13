---
title: Deck building (and research)
weight: 1
---

## How many cards should my deck have?

Keep it as small as possible. Adding more different cards will just fragment the deck and make it less usable.  A good rule of thumb is to have 13 „characters” and 13 „action” cards.

## How many precombo cards should I have in my deck

Not too much. Combos add a lot of options to your play, so don’t limit them artificially. Having **not more than 5** is a good number.

## What are the best skills?

 * **Crazed** — builds up until you have an unstoppable 50+ attack monster. Look at this [70 attack Wingnut Leela](https://www.reddit.com/r/AnimationThrowdown/comments/5f07gx/how_about_that_70_attack/) by [/u/Stitchisme](https://www.reddit.com/user/Stitchisme)
 * **Punch** — additional attack
 * **Cripple** — best way to mitigate attack and even disable opponents abilities (Leech, Crazed)

Source: [discussion started by /u/milkshaakes on reddit](https://www.reddit.com/r/AnimationThrowdown/comments/577yre/what_do_you_think_are_the_best_skills_so_far/)

There are specific usages for each skill, so keep various options in your deck. For example Cheer will enable the attack of a card crippled to zero, so it can activate it’s abilities (like Leech, Crazed, Gas, Bomb, etc)

## I discovered [Paddlin’ Peggy](/recipes?paddlin-peggy). Should I even bother with other cards in my deck?

Yes. More cards add more variety to your deck and allow you to respond better to the AI’s moves. Those are some examples of other cards with similiar firepower:

 * [Rodeo Peter](/recipes?rodeo-peter) (not farmable of course) — Crazed, Boost, Motivate
 * [Bob](/recipes?bob) has a lot of strong combos — Burgerboss Bob, Anally Defaced, $300 Knife
 * [Wingnut Leela](/recipes?wingnut-leela) — Sturdy, Punch, Crazed
 * [Dodgeball Louise](/recipes?dodgeball-louise) — Crazed, Payback, Cripple
 * [Crack Addict Stan](/recipes?crack-addict-stan) — Crazed, Gas, Sturdy

Crazed isn’t really required for a great card, here are some examples:

 * [Record Holder Stan](/recipes?record-holder-stan) — Punch & Sturdy
 * [Devil Hank](/recipes?devil-hank) - Punch, Gas, Leech
 * [Drunk Leela](/recipes?drunk-leela) — high Sturdy
 * [Susan Boil](/recipes?susan-boil) — high Leech
 * [Slurm Queen](/recipes?slurm-queen) — high Gas
 
After all, the game is about collecting cards. It would be boring with only two types of cards in a deck ;)

## Should I remove *some rare card* from my deck? What are their epic alternatives?

As your deck evolves it will have more and more epics replacing rare cards. Eventually you will only want blue and purple cards. There are however some green cards without a better alternative:

 * *Cars*: [Stan’s SUV](/recipes?stans-suv)
 * *Drugs*: [Crack](/recipes?crack) and [Toad Licking](/recipes?toad-licking)
 * [Slurm](/recipes?slurm)
 * *Gamer*: [Burgerboss](/recipes?burgerboss)

There also some great Rare character cards (try to quad-fuse them):

 * [Bill](/recipes?bill)
 * [Teddy](/recipes?teddy)
 * [Quagmire](/recipes?quagmire)
 * [Gene](/recipes?gene)

## What are the best farmable epics?

Check out the [Nickplosion’s Analysis](https://www.reddit.com/r/AnimationThrowdown/comments/5t7wcb/nickplosions_tierlist_analysis_for_farmable_cards/) on that topic published by /u/ballpitpredator

## Should I fuse these cards?

This depends on the state of your deck. When you still have a lot of rares in in, and the deck is far from it’s final form — **don’t fuse, unless you have a good enough card to replace it**.

On the other hand, when you feel your deck is strong enough and you’re satisfied with it, do the oposite. Don’t add the card unless it’s fused or double fused, since it would lover the overall power of the deck.

A lot of the time a lvl 5• epic will perform better than lvl 6 legendary.

## How are the combo values (attack, defence, skills) calculated?

The health and attack values are the sum of individual cards’ values with a coefficient (usually around 0.7). More about the exact values can be extracted from the XML files (look up: data mining). This means that leveling a card that doesn’t rise health or attack **wont influence the cards combo value**. This means that maybe it isn’t worth spending those Giggitywats for that last update, and keep a card one level away from maxing out.

As for the skill values, the exact method is not known. There is some [ongoing research](https://www.reddit.com/r/AnimationThrowdown/comments/5l69n2/do_you_have_any_ideas_how_the_combo_stats_are/) into this topic and the current findings are:

 * There is a notion of „combo power”, calculated using formula `1.1 ×  (3 × cards attack + cards health)`
 * This power is reduced by the value of combo skill’s base power `p`
 * The remainder used to calculate the skill value. A good **approximation** would be `skill value = power remainder / modifier * v`, where 
    `modifier` is a constant with value `77`;  and the `v` value can be obtained from the XML files

## Is my *foo bar card* good enough for my deck?

Try to test it yourself. Put it in and go to Arena Practice. This way you can’t lose anything if the tested cards turn out to be a flop; you can do this unlimited times; and you test the card in real conditions. 

## Where can I get the Giggity I need?

By [farming in the adventure](/adventure) and recycling unused cards. I know you hold on tight to those maxed out rares, but it’s time to forget them and move on. They will give you plenty of GW to start building your deck on epics.

## How much Giggity will I need to…?

 * Maxing a Common card will require **188GW**
 * Maxing a Rare card will require **473GW**
 * Epic cards from zero to 5* takes **244GW**, while maxing out two 5* epic is **470**
 * You can single fuse a Legendary if you have **419GW**. Taking it all all the way after having two 6* is another whooping **1025GW**

## What are the best combos for my *eglebegle card*?

It’s a matter of an opinion, so you can [check the recipes yourself](/recipes).

## What should I research next?

Obviously, combos for cards that are both in your deck. Then for cards that arent, but that you’d like to add soon. And in the end, just research everything else. Also, the time needed to research is dependent upon the rarity of the resulting card. Any two cards of identical rarities will produce a combo card with that rarity; using adjacent rarities will produce a combo card of the higher rarity; using cards with rarity two steps apart will produce a card of the rarity in between them, and combining a legendary card with a common will always produce an epic card. Since most combo cards require a specific character, but can use any of several related items, your research time will be spent most effectively if, when choosing between two similar item cards of different rarities and requiring the same research time, you choose the higher rarity item card. For example, Roger (legendary) can be researched with Weapon (common) or with Paintball With Guns (rare) to produce Legman (epic), and either will take the same amount of time, but the Roger+Paintball combo has better stats, so it would benefit you more. Roger could also be researched with Rifle (epic), but as this produces a legendary Legman, it will take longer to research than the other combos. On the other hand, Peggy (epic) requires equal research time for both Paintball and Rifle, since each of those combos will produce an epic Paddlin' Peggy, whereas using the common Weapon card will only produce a Rare combo, and thus take less time to research. IMMV if you have a lot of copies of the more common card, and only one of the card with the higher rarity.

## Is it worth spending Gems to finish the research faster?

No. 

## How many Giggity will I lose if I recycle a lvl X card?

Look it up in the [/u/milkshaakes spreadsheet](https://docs.google.com/spreadsheets/d/1HSguYSuQeQQjMoJiodyjKbHSzwujvkv3P3DzKxTFTyI/pubhtml#)
