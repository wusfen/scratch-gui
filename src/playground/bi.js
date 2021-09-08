import {bridge} from './bridge';
import {param} from '../lib/param';

var mode = param('mode');
var workId = param('id');

function bi (data) {
    var info = {
        eventId: 'programming_editor_loadingtime',
        eventData: {
            mode,
            workId,
            ...data,
        },
    };
    bridge.emit('bi', info);
}

// 加载编辑器时长
var timeOrigin = window?.performance?.timeOrigin || +new Date();
var fetchProjectTime = 0;
addEventListener('fetchProject', e => {
    fetchProjectTime = +new Date();
    bi({
        pageProperties: 'readyDuration',
        timelong: +new Date() - timeOrigin
    });
});

// 加载 sb3 时长
var projectLoadSucceedTime = 0;
addEventListener('projectLoadSucceed', e => {
    projectLoadSucceedTime = +new Date();
    bi({
        pageProperties: 'fetchProjectDuration',
        timelong: +new Date() - fetchProjectTime
    });
});

// 渲染 sb3 时长
var loaderUnmountTime = 0;
addEventListener('loaderUnmount', e => {
    loaderUnmountTime = +new Date();
    bi({
        pageProperties: 'renderProjectDuration',
        timelong: +new Date() - projectLoadSucceedTime
    });
});

// 点击【提交】【保存】时刻
var clickSubmitTime = 0;
addEventListener('clickSubmit', e => {
    clickSubmitTime = +new Date();
});
addEventListener('clickSave', e => {
    clickSubmitTime = +new Date();
});

// 保存时长
var submitEndTime = 0;
addEventListener('submitEnd', e => {
    if (!clickSubmitTime) return;
    submitEndTime = +new Date();
    bi({
        pageProperties: 'saveDuration',
        timelong: +new Date() - clickSubmitTime
    });
});
addEventListener('saveEnd', e => {
    if (!clickSubmitTime) return;
    submitEndTime = +new Date();
    bi({
        pageProperties: 'saveDuration',
        timelong: +new Date() - clickSubmitTime
    });
});

// 批改时长
addEventListener('checkWorkEnd', e => {
    bi({
        pageProperties: 'checkWorkDuration',
        timelong: +new Date() - submitEndTime
    });
});
