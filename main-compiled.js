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
        result = document.getElementById('result'),
        params = (function () {
        var args = {};
        var bits = location.search.split('&');
        for (var i = 0, l = bits.length; i < l; i++) {
            var arg = decodeURIComponent(args[i]);
            if (arg.indexOf('=') === -1) {
                args[arg.trim()] = true;
            } else {
                arg = arg.split('=');
                args[arg[0].trim()] = arg[1].trim();
            }
        }
        return args;
    })();

    search.value = params.q || '';
    source.value = params.s || 'en';
    target.value = params.t || 'ja';

    document.getElementById('form').addEventListener('submit', function (e) {
        var slang = encodeURIComponent(source.value),
            tlang = encodeURIComponent(target.value),
            term = encodeURIComponent(search.value);
        load('https://' + slang + '.wikipedia.org/w/api.php?action=query&titles=' + term + '&prop=langlinks&lllang=' + tlang + '&format=json&callback=processResult').then(function (data) {
            var page = data.query.pages[Object.keys(data.query.pages)[0]];
            history.pushState(data, document.title, '/?q=' + term + '&s=' + slang + '&t=' + tlang);
            if (page.langlinks && page.langlinks.length) {
                result.textContent = page.langlinks[0]['*'];
            } else {
                result.textContent = '';
            }
        })['catch'](function (reason) {
            result.textContent = 'Error: ' + reason;
        });
        e.preventDefault();
        return false;
    });
})();

//# sourceMappingURL=main-compiled.js.map