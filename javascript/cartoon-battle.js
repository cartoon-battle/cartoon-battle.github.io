define(['cartoon-battle/config', 'cartoon-battle/CardCollection'], function (config, CardCollection) {

    function getFile(file, cb) {
        var xhr = new XMLHttpRequest;

        xhr.open("GET", config.data_url + file);
        xhr.onload = function () {
            cb(sessionStorage[file] = xhr.responseText);
        };

        xhr.send();
    }

    return function cartoonbattle__getCards(cb) {
        var data = [];

        function data__callback(content) {
            data.push(content);

            if (data.length === config.files.length) {
                cb(new CardCollection(data));
            }
        }

        config.files.forEach(function (file) {
            if (sessionStorage[file]) {
                return data__callback(sessionStorage[file]);
            }

            getFile(file, data__callback);
        });
    };

});
