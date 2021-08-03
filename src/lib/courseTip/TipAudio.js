import * as bridge from '../../playground/bridge.js';

/**
 * audio = new TipAudio
 * audio.src = 'src'
 * audio.play()
 * audio.pause()
 */
class TipAudio {
    static audio = new Audio()
    constructor (src) {
        console.info('TipAudio:', (src));
        TipAudio.audio.pause();

        this.audio = new Audio(src);
        this.audio.src = src;
        TipAudio.audio = this.audio;

        return this.audio;
    }
}

bridge.on('pause', e => {
    TipAudio.audio.muted = true;
});
bridge.on('resume', e => {
    TipAudio.audio.muted = false;
});
addEventListener('pagehide', e => {
    TipAudio.audio.muted = true;
});
addEventListener('pageshow', e => {
    TipAudio.audio.muted = false;
});

/**
 * playTipAudio(src)
 *
 * @param {url} src audio.src
 * @returns {Audio} audio
 */
function playTipAudio (src) {
    var audio = new TipAudio(src);
    audio.play();
    return audio;
}

export {
    TipAudio as default,
    playTipAudio,
};

window.playTipAudio = playTipAudio;
