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
        // token: '141e3837-c68f-4ccc-a7a9-61571e0cf46aRqBrSfVCiGjaYgObikaiLXJuyqiN',
        token,
    },
    base,
    onloadstart () {
        Loading.show();
    },
    onload (res) {
        if (!/^(0|200)$/.test(res.code)) {
            Dialog.alert(`${res.code} ${res.detail}`).then(e => {
                window.bridge.emit('exitEditor');
            });

            return Promise.reject(res.detail || res.code);
        }
    },
    async onerror (res) {
        await alert('接口异常');
        window.bridge.emit('exitEditor');
    },
    onloadend () {
        Loading.hide();
    }
});
// for console
window.ajax = ajax;
