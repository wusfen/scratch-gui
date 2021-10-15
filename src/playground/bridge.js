/* eslint-disable no-empty */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable func-style */

/**
 * 编辑器调其它端
 * @param {string} action 调用行为
 * @param {*} data 可选行为参数
 */
function emit (action, data) {
    console.info('[bridge.emit]', action, data);

    const event = new Event('bridge.emit');
    event.data = {
        action,
        data,
    };
    dispatchEvent(event);

    var options = {action, data};

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
