import getTipParam from '@/lib/courseTip/getTipParam';

let playIndex = 0;

let isNaivePlaying = false;

export function setIsNatvePlaying (_isNaivePlaying) {
    isNaivePlaying = _isNaivePlaying;
}

export function getIsNatvePlaying () {
    return isNaivePlaying;
}

// 任务视频，在最前面
const introVideoSrc = getTipParam('introVideo');

// 是否存在介绍视频
const isExplain = getTipParam('tipVideo')?.includes('_explain');

function getTipVideos () {
    let tipVideos = getTipParam('tipVideo');
    if (!tipVideos) return [];
    tipVideos = tipVideos.split('|');
    if (introVideoSrc){
        tipVideos.unshift(introVideoSrc);
        playIndex++;
    }

    return tipVideos.map((url, index) => {
        // 首个视频为任务视频
        const label = introVideoSrc && index === 0 ? '任务' : `${isExplain ? '讲解' : '提示'}${introVideoSrc ? index : index + 1}`;
        return {
            url,
            lock: false,
            label,
            title: label
        };
    });
}

const tipVideos = getTipVideos();


export function unlockNextVideo (data = {type: 1}){ // 解锁下一个视频
    if (data.type == 2 && playIndex < tipVideos.length - 1){
        playIndex++;
    }
}

export function playVideoOnNative (data = {type: 1}) { // 发送视频播放事件，通过原生播放视频
    data.autoPlay = true;
    if (data.type === 1){
        const label = data.videoSrc?.includes('_task') ? '介绍视频' : '讲解视频';
        data.videos = [
            {
                url: data.videoSrc,
                lock: false,
                label,
                title: label
            }
        ];
        delete data.videoSrc;
        delete data.promptTitle;
        data.playIndex = 0;
    } else {
        data.videos = tipVideos.map((video, index) => {
            video.lock = index > playIndex;
            return video;
        });
        data.playIndex = playIndex;
        if (data.rect){
            data.rect.height = data.rect.width * 0.72;
        }
    }
    window.bridge.emit('showVideoModal', data);
    setIsNatvePlaying(true);
}

export function removeTimer () {
    if (window.operateTimer) window.operateTimer.removeListener();
    if (window.codeTimer) window.codeTimer.removeListener();
    if (window.rightAnswerTimer) window.rightAnswerTimer.removeListener();
}

export function openTimer () {
    if (window.operateTimer) window.operateTimer.iniTimertListener();
    if (window.codeTimer) window.codeTimer.iniTimertListener();
    if (window.rightAnswerTimer) window.rightAnswerTimer.iniTimertListener();
}
