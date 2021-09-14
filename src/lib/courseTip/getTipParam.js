import {param} from '../param.js';

var localCourseConfig = {};
try {
    // 未联调，先屏蔽
    // localCourseConfig = JSON.parse(localStorage.courseConfig);
// eslint-disable-next-line no-empty
} catch {}

// eslint-disable-next-line require-jsdoc
export default function getTipParam (key) {
    let localValue = localCourseConfig[key];
    if (localValue !== undefined) {
        localValue = decodeURIComponent(localValue);
    }

    return param(key) || localValue;
}
