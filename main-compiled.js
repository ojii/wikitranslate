'use strict';

var load = (function () {
    var index = 0;
    var timeout = 5000;

    return function (url) {
        return new Promise(function (resolve, reject) {
            var callback = '__callback' + index++;
            var timeoutID = window.setTimeout(function () {
                reject(new Error('Request timeout.'));
            }, timeout);

            window[callback] = function (response) {
                window.clearTimeout(timeoutID);
                resolve(response);
            };
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = '' + url + (url.indexOf('?') === -1 ? '?' : '&') + 'callback=' + callback;
            document.getElementsByTagName('head')[0].appendChild(script);
        });
    };
})();

(function () {
    var search = document.getElementById('search'),
        source = document.getElementById('source'),
        target = document.getElementById('target'),
        result = document.getElementById('result');

    document.getElementById('form').addEventListener('submit', function (e) {
        var slang = encodeURIComponent(source.value),
            tlang = encodeURIComponent(target.value),
            term = encodeURIComponent(search.value);
        load('https://' + slang + '.wikipedia.org/w/api.php?action=query&titles=' + term + '&prop=langlinks&lllang=' + tlang + '&format=json&callback=processResult').then(function (data) {
            var page = data.query.pages[Object.keys(data.query.pages)[0]];
            if (page.langlinks.length) {
                result.textContent = page.langlinks[0]['*'];
            } else {
                result.textContent = '';
            }
        })['catch'](function (reason) {
            result.textContent = 'Error';
        });
        e.preventDefault();
        return false;
    });
})();

//# sourceMappingURL=main-compiled.js.map