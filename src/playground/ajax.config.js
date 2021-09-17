/* eslint-disable prefer-const */
/* eslint-disable comma-dangle */
import {ajax} from '../lib/ajax.js';
import Loading from '../components/loading/index.jsx';
import Dialog from '../components/dialog/index.jsx';

const params = new URL(location).searchParams;

// ?base=prod
const baseMap = {
    dev: 'https://dev-icode.vipthink.cn/v1/homework/',
    uat: 'https://uat-icode.vipthink.cn/v1/homework',
    stress: 'https://stress-icode.vipthink.cn/v1/homework',
    prod: 'https://icode.vipthink.cn/v1/homework',
    mock: 'https://yapi.vipthink.net/mock/1788/',
};

// default
let base = baseMap.prod;

// auto
if (/\/uat-|\/uat\/|\/\/1/.test(location)) {
    base = baseMap.uat;
}

// ?base=prod
if (params.get('base')) {
    base = baseMap[params.get('base')] || params.get('base');
}

// ?token
let token = params.get('token');

// ajax
ajax.setSettings({
    headers: {
        token,
    },
    base,
    onloadstart (options) {
        if (!options.silence) {
            Loading.show();
        }
    },
    onload (res, options) {
        if (options.responseType === 'blob') {
            return res;
        }

        if (!/^(0|200)$/.test(res.code)) {
            if (!options.silence) {
                Dialog.alert(`${res.code} ${res.detail}`).then(e => {
                    window.bridge.emit('exitEditor');
                });
            }

            return Promise.reject(res.detail || res.code);
        }
    },
    async onerror (e, options) {
        if (options.silence) return;
        console.f12 = 2;
        await alert('哎呀，网络出点问题哦，请稍候重试');
        window.bridge.emit('exitEditor');
    },
    onloadend () {
        Loading.hide();
    }
});
// for console
window.ajax = ajax;
