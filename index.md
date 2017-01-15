---
title: Welcome
---

This is an opinionated strategy guide for Animation Throwdown. 

## Topics

<ul>
{% assign pages = site.pages | sort: "weight" %}
{% for item in pages %}{% if item.url != "/" and item.title %}
 <li><a href="{{ item.url }}">{{ item.title }}</a></li>
{% endif %}{% endfor %}
</ul>

## Other resources

There are some excelent sites out there covering different aspects of the game:

 * [#1 Unofficial Fan Site](https://animationthrowdown.net/) — the best resource about cards and combos
 * [spAnser’s Cards Data (aka The Data Mining)](https://spanser.net/AnimationThrowdown/cards.xml) — raw info about cards. More files linked in [the reddit thread](https://www.reddit.com/r/AnimationThrowdown/comments/52zx3p/data_mining/)
 * [Reddit](https://www.reddit.com/r/AnimationThrowdown/) — great place for discussions
 * [Upgrading, Recycling, Challenges, Drop rates & Hero tokens](https://docs.google.com/spreadsheets/d/1HSguYSuQeQQjMoJiodyjKbHSzwujvkv3P3DzKxTFTyI/pubhtml#) — great spreadsheet by [/u/milkshaakes](https://www.reddit.com/user/milkshaakes)
 * [A great list of useful information](https://www.reddit.com/r/AnimationThrowdown/comments/5o16g6/useful_information/?utm_content=comments&utm_medium=new&utm_source=reddit&utm_name=AnimationThrowdown) curated by [/u/Serpent330 on reddit](https://www.reddit.com/user/Serpent330)

## Contributing 

All contributions and points of view are welcome. For example, it is commonly agreed upon that the best strategy for beating 24th and 25th adventure islands is to knock out the first card. If you however feel that farming 20 Francines and boring AI to death is a valid strategy, I will publish your opinion signed your nickname.

Send your feedback any way you like:

 * via email: <a href="mailto:m.lebkowski@gmail.com">m.lebkowski@gmail.com</a>
 * on reddit: <a href="https://www.reddit.com/u/mlebkowski">/u/mlebkowski</a>
 * on twitter: <a href="https://twitter.com/mlebkowski">@mlebkowski</a>
 * or modify the source of this website directly <a href="https://github.com/cartoon-battle/cartoon-battle.github.io">using GitHub’s pull requests</a>
