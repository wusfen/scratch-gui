/**
 * 原生的请求
 * @param {object} options options
 * @returns {promise} res
 */
export function nativeRequest (options) {
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
        onprogress,
        onloadend,
        retry,
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

    // cache
    if (responseType === 'blob') {
        delete headers['Cache-Control'];
        delete headers['If-Modified-Since'];
    }

    // headers
    for (const key in headers) {
        // FormData file
        if (data instanceof FormData && /Content-Type/i.test(key)) continue;
        xhr.setRequestHeader(key, headers[key]);
    }

    // promise
    let resolve;
    let reject;
    const promise = new Promise((rs, rj) => {
        resolve = rs;
        reject = rj;
    });

    xhr.onprogress = onprogress;
    if (xhr.upload) {
        xhr.upload.onprogress = onprogress;
    }
    // start
    onloadstart.call(xhr, options);

    xhr.onload = function (e) {
        // success
        if (/^(0|2..|304)$/.test(xhr.status)) {
            let result = null;
            try {
                result = xhr.response || xhr.responseText;
                result = JSON.parse(result);
            // eslint-disable-next-line no-catch-shadow, no-empty, no-shadow
            } catch (e) {}

            // onload = res => undefined||res||promise<res>
            result = onload.call(this, result, options) || result;

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
        if (retry) {
            options.retry--;
            setTimeout(() => {
                nativeRequest(options).then(res => resolve(res))
                    .catch(error => reject(error));
            }, 1000);
            return;
        }
        onerror.call(this, e, options);
    };

    xhr.timeout = timeout;
    xhr.ontimeout = function (e) {
        ontimeout.call(this, e, options);
    };

    xhr.onloadend = onloadend;

    // send
    xhr.send(data);

    promise.xhr = xhr;
    return promise;
}
