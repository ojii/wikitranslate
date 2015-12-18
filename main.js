const load = (() => {
    let index = 0;
    const timeout = 5000;

    return (url) => new Promise((resolve, reject) => {
        const callback = '__callback' + index++;
        const timeoutID = window.setTimeout(() => {
            reject(new Error('Request timeout.'));
        }, timeout);

        window[callback] = (response) => {
            window.clearTimeout(timeoutID);
            resolve(response);
        };
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = `${url}${(url.indexOf('?') === -1 ? '?' : '&')}callback=${callback}`;
        document.getElementsByTagName('head')[0].appendChild(script);
    });
})();


(() => {
    const search = document.getElementById('search'),
        source = document.getElementById('source'),
        target = document.getElementById('target'),
        result = document.getElementById('result');

    document.getElementById('form').addEventListener('submit', (e) => {
        const slang = encodeURIComponent(source.value),
            tlang = encodeURIComponent(target.value),
            term = encodeURIComponent(search.value);
        load(`https://${slang}.wikipedia.org/w/api.php?action=query&titles=${term}&prop=langlinks&lllang=${tlang}&format=json&callback=processResult`).then((data) => {
            const page = data.query.pages[Object.keys(data.query.pages)[0]];
            if (page.langlinks.length) {
                result.textContent = page.langlinks[0]['*'];
            } else {
                result.textContent = '';
            }
        }).catch((reason) => {
            result.textContent = 'Error';
        });
        e.preventDefault();
        return false;
    });
})();
