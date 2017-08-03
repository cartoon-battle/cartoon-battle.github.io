/* global define */ define(['react'], function (React) {

    var e = React.createElement, PropTypes = React.PropTypes;

    var localStorage = window.localStorage || {};

    var KongregateCredentialsForm = React.createClass({
        displayName: "KongregateCredentialsForm",

        propTypes: {
            onSubmit: PropTypes.func.isRequired
        },

        getInitialState: function () {
            return {
                username: null,
                password: null
            }
        },

        setUsername: function (e) {
            this.setState({username: e.target.value})
        },

        setPassword: function (e) {
            this.setState({password: e.target.value})
        },

        onSubmit: function (e) {
            if (this.state.username && this.state.password) {
                this.props.onSubmit({
                    "username": this.state.username,
                    "password": this.state.password
                });
            }

            return e.preventDefault() && false;
        },

        render: function () {
            return e("form", {onSubmit: this.onSubmit},
                e('div', {"className": "form-group"},
                    e("label", {"htmlFor": "kong-username"}, "Kongregate username"),
                    e("input", {"id": "kong-username", "className": "form-control", "required":"required", "onChange": this.setUsername})
                ),
                e('div', {"className": "form-group"},
                    e("label", {"htmlFor": "kong-password"}, "Password"),
                    e("input", {"id": "kong-password", "className": "form-control", "required":"required", "type": "password", "onChange": this.setPassword})
                ),
                e('button', {"type": "submit", "className": "btn btn-primary"}, "Get my password")
            )
        }
    });


    var Authorization = React.createClass({
        propTypes: {
            onComplete: PropTypes.func
        },

        fetchPassword: function (user) {
            var xhr = new XMLHttpRequest(), setState = this.setState.bind(this), cb = this.props.onComplete;

            setState({'state': "loading"});
            xhr.open('POST', 'https://animation-throwdown.narzekasz.pl/api/kongregate/login');
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            xhr.onload = function () {
                var data = JSON.parse(xhr.responseText);

                if (data.error) {
                    return setState({'state': "error"})
                }

                setState({
                    state:"ready",
                    user: data
                });

                localStorage['name'] = data.name;
                localStorage['user_id'] = data.user_id;
                localStorage['password'] = data.password;

                cb && cb(data);
            };

            xhr.send("username="+encodeURIComponent(user.username) + "&password="+encodeURIComponent(user.password))
        },

        getInitialState: function () {
            return {
                "user": {
                    name: localStorage['name'],
                    user_id: localStorage['user_id'],
                    password: localStorage['password']
                },
                "state": localStorage['user_id'] ? "ready" : "waiting"
            };
        },

        renderResult: function () {
            switch (this.state.state) {
                case "waiting":
                    return e('div', {},
                        e('p', {className: "alert alert-info"}, "Provide your kongregate username and password to get your in-game user_id and password (for scripting, etc)"),
                        e('p', {className: "alert alert-warning"},
                            "Hey wait, how can you be sure I won’t store your credentials and use them for malicious purposes? You can’t! And I will! Never give share your login details to unknown websites!")
                    );
                case "error":
                    return e('p', {className: "alert alert-danger"}, "Unable to login using given credentials");
                case "loading":
                    return e('p', {className: "alert alert-info"}, "Loading data");
                case "ready":
                    return e('div', {},
                        e('p', {className: "alert alert-warning"}, "Never share your password with anyone! It grants total control over your account"),
                        e('dl', {className: "dl-horizontal"},
                            e('dt', {}, "Player Name"),
                            e('dd', {}, this.state.user.name),
                            e('dt', {}, "User Id"),
                            e('dd', {}, this.state.user.user_id),
                            e('dt', {}, "Password"),
                            e('dd', {}, e('code', {}, this.state.user.password))
                        )
                    );
            }
        },

        render: function () {
            return e('div', {},
                e(KongregateCredentialsForm, {onSubmit: this.fetchPassword}),
                this.renderResult()
            );
        }
    });

    return function (props) {
        return e(Authorization, props);
    }

});
