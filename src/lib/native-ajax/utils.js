/**
 * 获取链接参数值
 * @param {string} variable 需要查询的参数
 * @returns {string} 参数值
 */
export function getQueryVariable (variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] === variable){
            return pair[1];
        }
    }
    return (false);
}

/**
 * 是否在iOS环境
 * @returns {boolean} 是否在iOS环境
 */
export function isIOS () {
    return (/(iPhone|iPad|iPod|iOS)/i).test(navigator.userAgent) &&
    window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.webCall;
}

/**
 * 是否在Android环境
 * @returns {boolean} 是否在Android环境
 */
export function isAndroid () {
    return (/(Android)/i).test(navigator.userAgent) &&
    window.native && window.native.call;
}

/**
 * 是否运行在iframe
 * @returns {boolean} 是否运行在iframe
 */
export function inIframe (){
    return window.self !== window.top;
}

/**
 * 是否在Electron环境
 * @returns {boolean} 是否在Electron环境
 */
export function isElectron () {
    return (/(Electron)/i).test(navigator.userAgent) && inIframe();
}

/**
 * 是否符合httpdns条件
 * @returns {boolean} 是否符合httpdns条件
 */
export function useHttpDns (){
    let use = true;
    const nativeVersion = getQueryVariable('nativeVersion');
    if (nativeVersion){
        const vArr = nativeVersion.split('.');
        if (+vArr[0] < 1){
            use = false;
        } else if (+vArr[1] < 6){
            use = false;
        }
        const httpDns = getQueryVariable('httpDns');
        return use || (httpDns && +httpDns === 1);
    }
    return false;


}


/**
 * 是否为豌豆编程的客户端
 * @returns {boolean}  是否为豌豆编程的客户端
 */
export function isVipthink (){
    return (/(vipThinkStudent-ios|vipThinkStudent-android|vipthink)/i).test(navigator.userAgent);
}


/**
 * 是否在原生环境下
 * @returns {boolean} 是否在原生环境下
 */
export function onNative () {
    if ((isIOS() || isAndroid() || isElectron()) && isVipthink() && useHttpDns()) return true;
    // if ((isIOS() || isAndroid() || isElectron()) && useHttpDns()) return true;
    // if (useHttpDns()) return true;
}


/**
 * 对象转成key value 的数组
 * @param {object} obj 需要转换的对象
 * @returns {{key:string,value:string}[]} key value Array
 */
export function objToKeyValueArray (obj) {
    const arr = [];
    if (obj && typeof obj === 'object'){
        for (const key in obj) {
            const value = obj[key];
            arr.push({
                key,
                value: value.toString()
            });
        }
    }
    return arr;
}
