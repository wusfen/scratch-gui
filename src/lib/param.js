const getParam = function (name) {
    if (RegExp(`[?&]${name}=([^?=&#]*)`).test(location)) {
        let value = RegExp.$1;
        value = decodeURIComponent(value);
        try {
            // Number.MAX_SAFE_INTEGER
            if (value.length < 10) {
                // eslint-disable-next-line no-eval
                value = eval(value);
            }
            return value;
        } catch (e) {
            return value;
        }
    }
};

const setParam = function (name, value) {
    let url = location.href;
    // --
    url = url.replace(RegExp(`([?&])(${name})=([^?=&#]*)`, 'g'), `$1`);
    // ++
    url = url.replace(/$|#/, `?${name}=${value}$&`);
    // -- ?& && ? ?
    url = url.replace(/[?&]+/g, '&');
    url = url.replace(/((^|#)([^&]*))&/g, '$1?');

    history.replaceState('', document.title, url);
};

/**
 * get or set url param
 * @param {string} name param name
 * @param {*} value param value
 * @returns {*} value
 */
const param = function (name, value) {
    if (arguments.length === 2) {
        return setParam(name, value);
    }
    return getParam(name);

};

window.param = param;

export {
    param,
    getParam,
    setParam,
    param as default,
};
