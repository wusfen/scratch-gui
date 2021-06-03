/* eslint-disable prefer-const */
/* eslint-disable comma-dangle */
import {ajax} from '../lib/ajax.js';

const params = new URL(location).searchParams;

// ?base=dev
const baseMap = {
    dev: '//dev-homework.app.vipthink.net',
    uat: '//uat-homework.app.vipthink.net',
    prod: '//homework.app.vipthink.net',
    mock: 'http://yapi.vipthink.net/mock/1788/',
};

let base = baseMap.prod;
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
    // base: 'http://yapi.vipthink.net/mock/1788/',
    onload (res) {
        if (!/^(0|200)$/.test(res.code)) {
            alert(res.detail || res.code);
            return Promise.reject(res.detail || res.code);
        }
    },
    onerror (res) {
        alert('error');
    }
});
// for console
window.ajax = ajax;
