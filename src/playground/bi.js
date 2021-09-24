import {bridge} from './bridge';
import {param} from '../lib/param';

var mode = param('mode');
var workId = param('id');

function bi (eventId, eventData) {
    var info = {
        eventId: eventId,
        eventData: {
            mode,
            work_id: workId,
            ...eventData,
        },
    };
    bridge.emit('bi', info);
}

// 加载编辑器时长
var timeOrigin = window?.performance?.timeOrigin || +new Date();
var fetchProjectTime = 0;
addEventListener('fetchProject', e => {
    fetchProjectTime = +new Date();
    bi('programming_editor_loadingtime', {
        pageProperties: 'readyDuration',
        timelong: (+new Date() - timeOrigin) / 1000,
    });
});

// 加载 sb3 时长
var projectLoadSucceedTime = 0;
addEventListener('projectLoadSucceed', e => {
    projectLoadSucceedTime = +new Date();
    bi('programming_editor_loadingtime', {
        pageProperties: 'fetchProjectDuration',
        timelong: (+new Date() - fetchProjectTime) / 1000,
    });
});

// 渲染 sb3 时长
var loaderUnmountTime = 0;
addEventListener('loaderUnmount', e => {
    loaderUnmountTime = +new Date();
    bi('programming_editor_loadingtime', {
        pageProperties: 'renderProjectDuration',
        timelong: (+new Date() - projectLoadSucceedTime) / 1000,
    });
});

// 点击【提交】【保存】时刻
var clickSubmitTime = 0;
var submitCount = 0;
addEventListener('clickSubmit', e => {
    clickSubmitTime = +new Date();
    submitCount++;
});
addEventListener('clickSave', e => {
    clickSubmitTime = +new Date();
});

// 保存时长
var submitEndTime = 0;
addEventListener('submitEnd', e => {
    if (!clickSubmitTime) return;
    submitEndTime = +new Date();
    bi('programming_editor_loadingtime', {
        pageProperties: 'saveDuration',
        timelong: (+new Date() - clickSubmitTime) / 1000,
    });
});
addEventListener('saveEnd', e => {
    if (!clickSubmitTime) return;
    submitEndTime = +new Date();
    bi('programming_editor_loadingtime', {
        pageProperties: 'saveDuration',
        timelong: (+new Date() - clickSubmitTime) / 1000,
    });
});

// 批改时长
addEventListener('checkWorkEnd', e => {
    bi('programming_editor_loadingtime', {
        pageProperties: 'checkWorkDuration',
        timelong: (+new Date() - submitEndTime) / 1000,
    });
});

// 提交作业正确
addEventListener('submit:已提交正确', e => {
    bi('programming_app_interaction_link', {
        attempts_times: submitCount,
        subject_timeLong: (+new Date() - clickSubmitTime) / 1000,
        subject_passOrNot: 1
    });
});

// 提交作业失败
addEventListener('submit:已提交错误', e => {
    bi('programming_app_interaction_link', {
        attempts_times: submitCount,
        subject_timeLong: (+new Date() - clickSubmitTime) / 1000,
        subject_passOrNot: 0
    });
});
