import {param} from '../param.js';

var localCourseConfig = {};
try {
    localCourseConfig = JSON.parse(localStorage.courseConfig);
// eslint-disable-next-line no-empty
} catch {}

// eslint-disable-next-line require-jsdoc
export default function getTipParam (key) {
    return param(key) || localCourseConfig[key];
}
