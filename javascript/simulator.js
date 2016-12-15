(function (form, result) {
    var income = parseInt(form.dataset['income']);
    var arenaTime = parseInt(form.dataset['arenaTime']);
    var adventureTime = parseInt(form.dataset['adventureTime']);
    var refreshCost = parseInt(form.dataset['refreshCost']);
    var tokenRate = parseFloat(form.dataset['tokenRate']);
    var adventureDropRate = parseFloat(form.dataset['adventureDropRate']);
    var adventureGoldPerEnergy = parseInt(form.dataset['adventureGoldPerEnergy']);
    var adventureEnergyPerIsland = parseInt(form.dataset['adventureEnergyPerIsland']);

    var crates = [].slice.apply(form.getElementsByTagName('cb-crate')).map(function (crate) {
        return {
            p: parseFloat(crate.attributes['p'].value),
            gold: parseInt(crate.attributes['gold'].value),
            adventure: parseInt(crate.attributes['adventure'].value),
            arena: parseInt(crate.attributes['arena'].value),
        }
    });

    function displayCoins(v) {
        return v.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1&nbsp;");
    }

    function chance(rate) {
        return rate >= Math.random();
    }

    form.onsubmit = function (e) {
        // the multiplier from watching the ads.
        // Applies to coin rewards from both the arena and adventure, token drops and adventure card drops
        var adsBonus = parseFloat(form.video_bonus.value);
        // applies to arena coin rewards only
        var guildBonus = parseFloat(form.guild_level.value);
        // this value is shown on your arena screen
        var arenaGold = parseInt(form.arena_level.value) * (adsBonus + guildBonus);
        var arenaLevel = form.arena_level.selectedOptions[0].innerText;
        // this is a reward for farming one island in adventure levels 1-5 (3 energy level)
        var islandGold = adventureGoldPerEnergy * adventureEnergyPerIsland * adsBonus;
        // let’s assume we don’t have to win all of the arena battles
        var winRate = parseFloat(form.win_rate.value);

        var heroesAll = [].slice.apply(form.querySelectorAll('[name="heroes[]"]'));
        // heroes selected to farm
        var heroes = heroesAll
            .map(function (c) { return c.checked && c.value; })
            .filter(function (s) { return !!s; });

        // calculating for a week
        var days = 7;
        var minutes = days * 24 * 60;

        // let’s see what is the maximum amount of energy you can get in that time
        var battles = Math.floor(minutes / arenaTime);
        var adventureEnergy = Math.floor(minutes / adventureTime);

        // there is some static income for each player from the daily quests
        // there are 5 of them, 500 gold each. Then you have to purchase 3 packs
        // that gives you -500 gold net „income” per day
        var balance = income * days;
        var arenaWon = 0;
        var refreshesStats = {};

        // each day you may receive three crates
        for (var i = 1; i <= days * 3; i++) {
            // this is the „incremental” probability
            // we’re starting from the most rare crate
            // if it doesn’t match, we move to the next one until we get to the 500 gold crate
            var random = Math.random();
            for (var c, j = 0; c = crates[j]; j++) {
                if (c.p >= random) {
                    battles += c.arena;
                    adventureEnergy += c.adventure;
                    balance += c.gold;

                    break;
                }
            }
        }

        // those are arena battles. I count the number of refreshes needed for each of them
        for (var nbRefreshes, i = 1; i <= battles; i++) {
            nbRefreshes = 0;
            // this is the same mechanism as in the arena:
            // i request a random hero token and „spend” the refresh cost if it doesn’t match
            // one of my heroes. this probability equals to the: number of chosen heroes / number of all heroes
            while (heroes.length && false === chance(heroes.length / heroesAll.length)) {
                // count the refresh
                balance -= refreshCost;
                nbRefreshes++;
            }

            // record that this battle had a certain number of refreshes.
            // used for statistics later
            refreshesStats[nbRefreshes] = 1 + (refreshesStats[nbRefreshes] || 0);

            // gain the arena gold with some probability. if you fail to win, only 1/10 of the gold is awarded
            balance += arenaGold * (chance(winRate) ? Math.sign(++arenaWon) : 0.1);
        }

        // adventure
        var dustDrops = 0;
        var epicDrops = 0;

        // we can farm 3x less islands than we have arena energy (since a battle costs 3 energy, not one)
        for (var i = 0; i <= Math.floor(adventureEnergy / adventureEnergyPerIsland); i++) {
            // we just assume an autowin
            balance += islandGold;

            // if there is a drop it has an equal chance of being one of 9 cards
            if (chance(adventureDropRate * adsBonus)) {
                switch (Math.floor(Math.random()*9) + 1) {
                    // commons
                    case 1: case 2:
                        dustDrops += 1;
                        break;
                    // common Giggity and Rares
                    case 3: case 4: case 5:
                        dustDrops += 5;
                        break;
                    // Rare Giggity
                    case 6:
                        dustDrops += 25;
                        break;

                    // Epics
                    case 7: case 8:
                        epicDrops += 1;
                        break;

                    // Epic dust!
                    case 9:
                        dustDrops += 50;
                        break;
                }
            }
        }


        // those are just some stats to show that sometimes you *need* to refresh 50 times or more :P
        var medianRefCount = 0;
        var medianRefValue = 0;
        var maxRefValue = 0;
        var percentiles = [];

        for (var value in refreshesStats) {
            if (refreshesStats.hasOwnProperty(value)) {
                percentiles.push({
                    "count": refreshesStats[value],
                    "value": value
                });

                if (refreshesStats[value] > medianRefCount) {
                    medianRefCount = refreshesStats[value];
                    medianRefValue = value;
                }
            }
        }

        percentiles = percentiles.sort(function (a, b) {
            return a.value - b.value;
        });

        for (var sum = 0, p, i = 0; p = percentiles[i]; i++) {
            sum += p.count;

            if (sum <= battles * 0.95) {
                maxRefValue = p.value;
            }
        }

        var wonPercent = Math.round(arenaWon / battles * 100);
        // this is a 0.75 token drop rate with a 10% percent uncertainty:
        var tokens = Math.floor(arenaWon * tokenRate * adsBonus * (Math.random() * 0.2 + 0.9));
        // this is how many of those tokens would end up for each of the heroes
        var tokenTargets = Math.round(tokens / (heroes.length || heroesAll.length));



        result.innerHTML = [

            // summary text:
            '<p class="alert alert-info">',
            "Playing Arena level <code>" + arenaLevel + "</code> for <code>" + days + "</code> days ",
            "(<code>" + battles + "</code> battles including refills) <br>",
            "Battle reward is <code>" + arenaGold + "</code> gold<br>",


            heroes.length && "Refreshing for <code>" + refreshCost + "</code> coins until " || "",
            (1 < heroes.length) && "one of " || "",

            heroes.length && "<code>" + heroes.join(", ") + "</code> is picked<br>" || "",


            "Farming islands 1-5 for <code>" + islandGold + "</code> gold each</p>",

            // the results:
            '<div class="jumbotron">',
            "<h1>" + arenaWon + "</h1> <p> battles won (<code>" + wonPercent + "%</code>)</p>",
            "<h1>" + tokens + "</h1> <p>tokens collected",


            (1 !== heroes.length) && " (average <code>" + tokenTargets + "</code> per hero)" || "",


            heroes.length && "<h1>" + medianRefValue + "</h1>"
                + "<p>most common numer of refreshes needed (<code>" + medianRefCount + "</code> times)"
                + (maxReefValue && ", and 95th percentile not more than <code>" + maxRefValue + "</code></p>"§ || "") || "",


            "<h1>" + epicDrops + "</h1>",
            "<p>epic cards collected in the adventure, along with <code>" + dustDrops + "</code> Giggity. ",
            "You need <code>244</code> to max out a once-fused epic. This gives you ",
            (dustDrops / 244 >= 3) && "<strong>a shit-ton of great new cards</strong> in your deck" || "",
            (Math.floor(dustDrops / 244) === 2) && "<strong>two new fused epics</strong>" || "",
            (Math.floor(dustDrops / 244) === 1) && "<strong>one new addition</strong> to your deck" || "",
            (dustDrops / 244 < 1) && "a lot of useless epics you can recycle (for another <code>" + (epicDrops * 25) + "</code> Giggity)" || "",


            "<h1>" + displayCoins(balance) + "</h1>",
            "<p>expected coin balance ",

            (heroes.length && balance < 5000) && " — you need to play some arena battles without the refreshes to avoid going bankrupt" || ""
        ].join("\n");

        return false;
    }

})(document.forms[0], document.getElementById('result'));
