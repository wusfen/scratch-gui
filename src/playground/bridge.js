/* eslint-disable no-empty */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable func-style */

import getParam from '@/lib/param';

/**
 * 编辑器调其它端
 * @param {string} action 调用行为
 * @param {*} data 可选行为参数
 */
function emit (action, data) {
    console.info('[bridge.emit]', action, data);
    const options = {
        action,
        data
    };
    // 首次保存退出分享
    if (action === 'exitEditor') { // 调用了分享，就不调退出
        if (window._shareId) {
            const userId = getParam('userId');
            const shareId = window._shareId;
            const base = getParam('base');
            options.action = action = 'share';
            options.data = data = {
                title: '分享作品',
                content: '让爸爸妈妈扫描二维码\n试玩你的作品吧～',
                mobileContent: '让爸爸妈妈试玩你的作品吧～',
                shareTitle: '快来试玩我家宝贝在豌豆编程的创意作品吧，超赞~',
                shareDetail: '点击查看宝贝的精彩作品',
                url: `https://${base === 'uat' ? 'uat' : 'www'}.vipthink.cn/activity/market/crm-mobile-page/index.html#/workShare?channel=0&channelS=0&setRead=1&id=${shareId}&userId=${userId}`
            };
            window.bridge.emit('share', data);
            delete window._shareId;
        }
    }
    const event = new Event('bridge.emit');
    event.data = {
        action,
        data,
    };
    dispatchEvent(event);

    // var options = {action, data};

    // setTimeout处理：软键盘不收起，点击退出button，编辑器会闪退
    setTimeout(() => {
        // ios
        try {
            window.webkit.messageHandlers.webCall.postMessage(
                JSON.stringify(options),
                '*'
            );
        } catch (e) {}

        // android
        try {
            window.native.call(JSON.stringify(options));
        } catch (e) {}

        // pc(iframe)
        try {
            if (window !== parent) {
                parent.postMessage(options, '*');
            }
        } catch (e) {}
    }, 1);

}

function on (action, cb) {
    // TODO add once

    var eventName = `bridge:${action}`;
    var handler = e => {
        cb(e.data);
    };

    addEventListener(eventName, handler);

    return function off () {
        removeEventListener(eventName, handler);
    };
}


function trigger (action, data) {
    console.info('[bridge.trigger]', action, data);

    var bridgeEvent = new Event(`bridge:${action}`);
    bridgeEvent.data = data;
    dispatchEvent(bridgeEvent);
}

// postMessage('options', '*')
addEventListener('message', e => {
    var options = e.data;
    if (/^\{/.test(options)) {
        options = JSON.parse(options);
    }

    var action = options.action;
    if (action) {
        trigger(action, options.data);
    }
});


const bridge = {
    emit,
    on,
    trigger,
};

export {
    bridge as default,
    bridge,
    emit,
    on,
    trigger,
};

window.bridge = bridge;
