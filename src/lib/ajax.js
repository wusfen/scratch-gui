/* eslint-disable comma-dangle, require-jsdoc, func-style */

function request (options) {
    let {
        method,
        base,
        url,
        headers,
        data,
        responseType,
        timeout,
        onload,
        onerror,
        ontimeout,
        onloadstart,
        onloadend
    } = options;

    // search
    let search = '';
    if (/GET/i.test(method)) {
        for (const key in data) {
            if (typeof data[key] === 'undefined') {
                delete data[key];
            }
        }
        search = new URLSearchParams(data).toString();
        data = null;
    }

    // data
    if (/ (Object|Array)/.test(toString.call(data))) {
        // !File => '{json}'
        data = JSON.stringify(data, null, '');
    }

    // url
    url = `${url}${search ? (/[?]/.test(url) ? '&' : '?') : ''}${search}`; // url + search
    url = base && !/^(https?|\/\/)/.test(url) ? `${base}/${url}` : url; // base + url
    url = /^\/\//.test(url) ? `${location.protocol}${url}` : url; // '//' => 'http://'
    url = url.replace(/([^:/])[/]{2,}/g, '$1/'); // '///' => '/'

    // xhr
    const xhr = new XMLHttpRequest();
    xhr.responseType = responseType;
    xhr.open(method.toUpperCase(), url, true);

    // headers
    for (const key in headers) {
        xhr.setRequestHeader(key, headers[key]);
    }

    // promise
    let resolve;
    const promise = new Promise(rs => (resolve = rs));

    // start
    onloadstart.call(xhr);

    xhr.onload = function (e) {
        // success
        if (/^(2..|304)$/.test(xhr.status)) {
            let result = xhr.responseText;
            try {
                result = xhr.response || result;
                result = JSON.parse(result);
            // eslint-disable-next-line no-catch-shadow, no-empty, no-shadow
            } catch (e) {}

            // onload = res => undefined||res||promise<res>
            result = onload.call(this, result) || result;

            // onload = res => new Promise(rs=>{})
            // onload = res => Promise.reject('xx')
            if (result.then) {
                result.then(resolve);
                return;
            }

            resolve(result);
            return;
        }

        xhr.onerror(e);
    };

    xhr.onerror = function (e) {
        onerror.call(this, e);
    };

    xhr.timeout = timeout;
    xhr.ontimeout = function (e) {
        ontimeout.call(this, e);
    };

    xhr.onloadend = onloadend;

    // send
    xhr.send(data);

    return promise;
}

class Ajax {
    constructor (settings) {
        this.setSettings(settings);
    }
    setSettings (settings) {
        this.settings = this.mergeOptions(Ajax.settings, settings);
    }
    mergeOptions (a = {}, b = {}) {
        const c = Object.assign({}, a, b);
        c.headers = Object.assign({}, a.headers, b.headers);
        return c;
    }
    request (options) {
        options = this.mergeOptions(this.settings, options);
        return request(options);
    }
    get (url, data, options = {}) {
        options = Object.assign(options, {url, data, method: 'get'});
        return this.request(options);
    }
    post (url, data, options = {}) {
        options = Object.assign(options, {url, data, method: 'post'});
        return this.request(options);
    }
    put (url, data, options = {}) {
        options = Object.assign(options, {url, data, method: 'put'});
        return this.request(options);
    }
    delete (url, data, options = {}) {
        options = Object.assign(options, {url, data, method: 'delete'});
        return this.request(options);
    }
    options (url, data, options = {}) {
        options = Object.assign(options, {url, data, method: 'options'});
        return this.request(options);
    }
}

Ajax.settings = {
    method: 'GET',
    base: '',
    url: '',
    data: {},
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'If-Modified-Since': 0,
    },
    responseType: 'text',
    timeout: 0,
    onload (res) {},
    onerror (e) {},
    ontimeout (e) {},
    onloadstart (options) {},
    onloadend (res) {},
};

const ajax = new Ajax();

export {
    request,
    Ajax,
    ajax,
};
