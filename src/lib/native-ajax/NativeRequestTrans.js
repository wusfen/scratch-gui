import bridge from '../../playground/bridge';
import BridgeAction from './bridge_action';
import {objToKeyValueArray} from './utils';

let httpid = 0;
export default class NativeRequestTrans{

    id

    successHandler

    errorHandler

    constructor (){
        this.id = httpid++;
        this.off = bridge.on(BridgeAction.receivedData, this.onNativeReceived.bind(this));
    }

    onNativeReceived (result){
        if (result.httpID === this.id){
            this.successHandler(result.data);
            this.destroy();
        }
    }

    promise (options){
        return new Promise((resolve, reject) => {
            let {method, data, url, base, headers, timeout, retry} = options;
            let search = '';

            if (/GET/i.test(method)) {
                for (var key in data) {
                    if (typeof data[key] === 'undefined') {
                        delete data[key];
                    }
                }

                search = new URLSearchParams(data).toString();
                data = null;
            } // data


            if (/ (Object|Array)/.test(toString.call(data))) {
                // !File => '{json}'
                data = JSON.stringify(data, null, '');
            } // url


            url = ''.concat(url).concat(search ? /[?]/.test(url) ? '&' : '?' : '')
                .concat(search); // url + search

            url = base && !/^(https?|\/\/)/.test(url) ? ''.concat(base, '/').concat(url) : url; // base + url

            url = /^\/\//.test(url) ? ''.concat(location.protocol).concat(url) : url; // '//' => 'http://'

            url = url.replace(/([^:/])[/]{2,}/g, '$1/'); // '///' => '/'
            const requestData = {
                httpID: this.id,
                path: url,
                requestType: method.toLocaleUpperCase(),
                param: data,
                header: objToKeyValueArray(headers),
                httpDNS: true,
                webSocket: false,
                addTaskPool: false,
                timeout: timeout,
                tryCount: retry,
                cache: false,
            };
            bridge.emit(BridgeAction.requestData, requestData);
            this.successHandler = resolve;
            this.errorHandler = reject;
        });
    }

    destroy (){
        // 销毁事务
        this.off();
    }
}
