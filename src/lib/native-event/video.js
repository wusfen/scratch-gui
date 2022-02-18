import getTipParam from '@/lib/courseTip/getTipParam';

let playIndex = 0;

function getTipVideos () {
    let tipVideos = getTipParam('tipVideo');
    if (!tipVideos) return [];
    tipVideos = tipVideos.split('|');
    return tipVideos.map((url, index) => {
        return {
            url,
            lock: false,
            label: `提示${index + 1}`,
            title: `提示${index + 1}`
        };
    });
}

const videos = getTipVideos();

export function unlockNextVideo (data = {type: 1}){ // 解锁下一个视频
    if (data.type == 2 && playIndex < videos.length - 1){
        playIndex++;
    }
}

export function playVideoOnNative (data = {type: 1}) { // 发送视频播放事件，通过原生播放视频
    data.autoPlay = true;
    if (data.type === 1){
        data.videos = [
            {
                url: data.videoSrc,
                lock: false,
                label: `${data.promptTitle}视频`,
                title: `${data.promptTitle}视频`
            }
        ];
        delete data.videoSrc;
        delete data.promptTitle;
        data.playIndex = 0;
    } else {
        data.videos = videos.map((video, index) => {
            video.lock = index > playIndex;
            return video;
        });
        data.playIndex = playIndex;
    }
    window.bridge.emit('showVideoModal', data);
}
