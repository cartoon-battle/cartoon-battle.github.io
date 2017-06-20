---
title: Custom events
weight: 5
---

## How is my Rumble score calculated?

Thanks to [FatAndy](http://www.kongregate.com/forums/727066-general/topics/823701-formula-for-a-players-score-in-the-rumble-solved)
we have cracked the exact formula for Rumble point loss (or at least a fair approximation):

```
 (total damage to your cards + damage to your hero)
 / (total full health of your cards + full hero health)
 × 0.7 × 100
```

The values is rounded down. The `0.7` modifier may depend on additional factors, but it has proven to be accurate enough).

This means, that:

 * taking damage to both cards and hero causes point loss
 * destroyed cards do not count for target score
 * healing / leeching reduces the point loss
 * adding more total health on the board reduces the point loss
 * there are no additional factors (as number of rounds or cards on the table)

## Is there a way of tracking my guildmates scores during the rumble?

Not out of the box, but you can use this great [Rumble Breakdown Spreadsheet by sikTh78](https://docs.google.com/spreadsheets/d/1ITYLGKTWYVaN4OBRnyp-n0C65DzLzWCOiboTmRkUXe4/edit?usp=sharing) to record and analyse them later.

## Should I buy the *special challenge card* or box packs?

*Unfortunately, this aspect of the game changed and the tip is no longer applies*

> Final form cards, in general, are pretty good if you can fuse them to the same level as the majority of cards in your deck. Final form cards are equivalent to playing 2 cards at once. Box packs have higher potential, but are a roll of the dice.

Source: [/u/milkshaakes in a reddit thread](https://www.reddit.com/r/AnimationThrowdown/comments/58rcth/faq_answers_miilkshakes_stash_of_resources/)
