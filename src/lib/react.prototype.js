import React from 'react';

const HANDLERS = '_HANDLERS_';
const _this = React.Component.prototype;

function unmountOff (self) {
    if (self._unmountReplaced) return;
    self._unmountReplaced = true;

    self[HANDLERS] = self[HANDLERS] || [];

    const _componentWillUnmount = self.componentWillUnmount;
    self.componentWillUnmount = function () {
        self.off();
        _componentWillUnmount?.apply(self, arguments);
    };
}

_this.addEventListener = function (target, ...args) {
    if (typeof target === 'string') {
        target = window;
        args = arguments;
    }

    unmountOff(this);
    target.addEventListener(...args);
    this[HANDLERS].push(['addEventListener', target, args]);
};

_this.setTimeout = function () {
    unmountOff(this);
    const timer = window.setTimeout(...arguments);
    this[HANDLERS].push(['setTimeout', timer]);
    return timer;
};

_this.setInterval = function () {
    unmountOff(this);
    const timer = window.setInterval(...arguments);
    this[HANDLERS].push(['setInterval', timer]);
    return timer;
};

_this.off = function () {
    // console.warn('off:', this[HANDLERS]);
    for (const item of this[HANDLERS]) {
        if (item[0] === 'addEventListener') {
            item[1].removeEventListener(...item[2]);
            return;
        }
        if (item[0] === 'setTimeout') {
            window.clearTimeout(item[1]);
            return;
        }
        if (item[0] === 'setInterval') {
            window.clearInterval(item[1]);
            return;
        }
    }
};
_this.on = _this.addEventListener;
