import NativeRequestTrans from './NativeRequestTrans';
import {nativeRequest} from './native_request';

/**
 * 使用原生代理http 请求的ajax
 * 暂时只代理 http的get、post，responseType为json的请求
 */
export default class NativeAjax{
    constructor (settings) {
        this.list = [];
        this.setSettings(settings);
    }
    setSettings (settings) {
        this.settings = this.mergeOptions(NativeAjax.settings, settings);
    }
    mergeOptions (a = {}, b = {}) {
        const c = Object.assign({}, a, b);
        c.headers = Object.assign({}, a.headers, b.headers);
        return c;
    }
    request (options) {
        options = this.mergeOptions(this.settings, options);

        if (this.uesProxy(options)){
            return new NativeRequestTrans().promise(options);
        }
        var promise = nativeRequest(options);
        var xhr = promise.xhr;
        this.list.push(xhr);
        xhr.addEventListener('loadend', e => {
            // wait ajax.abort
            setTimeout(() => {
                var index = this.list.indexOf(xhr);
                if (index !== -1) {
                    this.list.splice(index, 1);
                }
            }, 1);
        });
        return promise;
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
    abort () {
        this.list.forEach(xhr => {
            xhr.abort();
        });
    }
    uesProxy (options){
        // 代理responseType为json的GET、POST请求
        const method = options.method.toLocaleUpperCase();
        const headers = options.headers;
        const responseType = options.responseType;
        const ContentType = headers['Content-Type'];
        return (method === 'GET' || method === 'POST') && (ContentType === 'application/json') && (responseType === 'json' || responseType === 'text');
    }
}

NativeAjax.settings = {
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
    retry: 3,
    onload (res, options) {},
    onerror (e, options) {},
    ontimeout (e, options) {},
    onloadstart (options) {},
    onprogress (options) {},
    onloadend (res, options) {},
};
