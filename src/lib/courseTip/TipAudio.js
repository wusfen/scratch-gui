/* eslint-disable prefer-spread */
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
        // console.warn('TipAudio:', src);
        TipAudio.audio.pause();

        var audio = new Audio(src);
        audio.muted = TipAudio.audio.muted;

        this.audio = audio;
        TipAudio.audio = this.audio;

        // fix: pause error
        audio._play = audio.play;
        audio.play = function () {
            var promise = audio._play().catch(console.warn);

            audio._pause = audio.pause;
            audio.pause = function () {
                if (promise && promise.finally) {
                    promise.finally(e => {
                        audio._pause();
                    });
                }
            };

            return promise;
        };

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
