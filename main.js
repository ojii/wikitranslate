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
        result = document.getElementById('result'),
        form = document.getElementById('form'),
        wikify = (s) => {
            return s.split(' ').map((e, i) => {
                if (i){
                    return e.toLowerCase();
                } else {
                    return e[0].toUpperCase() + e.substr(1).toLowerCase();
                }
            }).join('_');
        },
        translate = () => {
            const slang = encodeURIComponent(source.value),
                tlang = encodeURIComponent(target.value),
                term = encodeURIComponent(wikify(search.value));
            result.textContent = '...';
            load(`https://${slang}.wikipedia.org/w/api.php?action=query&titles=${term}&prop=langlinks&lllang=${tlang}&format=json&callback=processResult`).then((data) => {
                const page = data.query.pages[Object.keys(data.query.pages)[0]];
                history.pushState(data, document.title, `/?q=${term}&s=${slang}&t=${tlang}`);
                if (page.langlinks && page.langlinks.length) {
                    result.textContent = page.langlinks[0]['*'];
                } else {
                    result.textContent = '';
                }
            }).catch((reason) => {
                result.textContent = `Error: ${reason}`;
            });
        };

    let params = {};
    let bits = location.search.substr(1).split('&');
    for (var i = 0, l = bits.length; i < l; i++){
        let arg = decodeURIComponent(bits[i]);
        if (arg.indexOf('=') === -1){
            params[arg.trim()] = true;
        } else {
            arg = arg.split('=');
            params[arg[0].trim()] = arg[1].trim().split('_').join(' ');
        }
    }

    search.value = params.q || '';
    source.value = params.s || 'en';
    target.value = params.t || 'ja';

    form.addEventListener('submit', (e) => {
        translate();
        e.preventDefault();
        return false;
    });

    if (search.value.length){
        translate();
    }
})();
