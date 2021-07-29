/**
 * audio = new TipAudio
 * audio.src = 'src'
 * audio.play()
 * audio.pause()
 */
class TipAudio {
    static audio = new Audio()
    constructor (src) {
        this.audio = TipAudio.audio;
        this.audio.src = src;
        return this.audio;
    }
}

/**
 * playTipAudio(src)
 *
 * @param {url} src audio.src
 * @returns {Audio} audio
 */
function playTipAudio (src) {
    var audio = new TipAudio();
    audio.src = src;
    audio.play();
    return audio;
}

export {
    TipAudio as default,
    playTipAudio,
};
