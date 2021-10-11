/**
 * 是否在iOS环境
 * @returns {boolean} 是否在iOS环境
 */
export function isIOS () {
    return (/(iPhone|iPad|iPod|iOS)/i).test(navigator.userAgent);
}

/**
 * 是否在Android环境
 * @returns {boolean} 是否在Android环境
 */
export function isAndroid () {
    return (/(Android)/i).test(navigator.userAgent);
}

/**
 * 是否在Electron环境
 * @returns {boolean} 是否在Electron环境
 */
export function isElectron () {
    return (/(Electron)/i).test(navigator.userAgent);
}

/**
 * 是否在原生环境下
 * @returns {boolean} 是否在原生环境下
 */
export function onNative () {
    return isIOS() || isAndroid() || isElectron();
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
            const value = obj[obj];
            arr.push({
                key,
                value
            });
        }
    }
    return arr;
}
