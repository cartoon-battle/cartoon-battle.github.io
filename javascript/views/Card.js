/* global define */ define(['cartoon-battle', 'react'], function (getCards, React) {
    var $ = React.createElement, PropTypes = React.PropTypes;
    var Card = React.createClass({
        "propTypes": {
            "cards": PropTypes.arrayOf(PropTypes.shape({
                "id": PropTypes.number.isRequired,
                "level": PropTypes.oneOfType([PropTypes.number, PropTypes.string])
            })).isRequired
        },
        "getInitialState": function () {
            return {
                card: null,
                error: false
            }
        },
        "componentDidMount": function () {
            var search = this.props.cards, callback = Function.prototype.bind.call(this.setState, this);

            getCards(function (cards) {
                try {
                    var items = search.map(function (item) {
                        return cards.forLevel(cards.get(item.id), item.level);
                    });

                    callback({
                        "card": 1 === items.length ? items.pop() : cards.forLevel(cards.getCombo.apply(cards, items).result),
                        "items": items
                    });

                } catch (E) {
                    callback({
                        "error": true
                    })
                }

            });
        },
        render: function () {
            if (!this.state.card) {
                return $('span', {}, this.state.error ? "Error loading card" : "Loading card");
            }

            return $('span', {
                dangerouslySetInnerHTML: {__html: this.state.card.node.outerHTML},
                'title': this.state.card.combo ? this.state.items.map(function (card) {
                    return card.name + " " + card.getLevelString();
                }).join(" + ") : ""
            });
        }
    });

    return function (cards, props) {
        return $(Card, Object.assign({}, props || {}, {
            "cards": cards.map(function (card) {
                return "getLevelString" in card ? {
                    "id": card.getId(),
                    "level": card.getLevelString()
                } : card;
            })
        }));
    }
});
