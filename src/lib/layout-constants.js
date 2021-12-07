import keyMirror from 'keymirror';

/**
 * Names for each state of the stage size toggle
 * @enum {string}
 */
const STAGE_SIZE_MODES = keyMirror({
    /**
     * The "large stage" button is pressed; the user would like a large stage.
     */
    large: null,

    /**
     * The "small stage" button is pressed; the user would like a small stage.
     */
    small: null
});

/**
 * Names for each stage render size
 * @enum {string}
 */
const STAGE_DISPLAY_SIZES = keyMirror({
    /**
     * Large stage with wide browser
     */
    large: null,

    /**
     * Large stage with narrow browser
     */
    largeConstrained: null,

    /**
     * Small stage (ignores browser width)
     */
    small: null
});

// zoom level to start with
const BLOCKS_DEFAULT_SCALE = 0.75;

const STAGE_DISPLAY_SCALES = {};
STAGE_DISPLAY_SCALES[STAGE_DISPLAY_SIZES.large] = 1; // large mode, wide browser (standard)
STAGE_DISPLAY_SCALES[STAGE_DISPLAY_SIZES.largeConstrained] = 1; // large mode but narrow browser
STAGE_DISPLAY_SCALES[STAGE_DISPLAY_SIZES.small] = 0.5; // small mode, regardless of browser size

window.STAGE_WIDTH = 375;
window.STAGE_HEIGHT = 667;// 舞台真实大小
window.UI_WIDTH = 1024;
window.UI_HEIGHT = 768;
window.STAGE_UI_WIDTH = 357;// 舞台显示大小
window.STAGE_CSS_WIDTH = window.STAGE_UI_WIDTH;

const searchParams = (new URL(location)).searchParams;
if (searchParams.get('STAGE_WIDTH')) {
    window.STAGE_WIDTH = +searchParams.get('STAGE_WIDTH');
    window.STAGE_HEIGHT = +searchParams.get('STAGE_HEIGHT');
    if (!window.STAGE_HEIGHT) {
        window.STAGE_HEIGHT = window.STAGE_WIDTH * (16 / 9);
    }
}

const htmlEl = document.documentElement;
htmlEl.style.setProperty('--STAGE_WIDTH', window.STAGE_WIDTH);
htmlEl.style.setProperty('--STAGE_HEIGHT', window.STAGE_HEIGHT);


// eslint-disable-next-line require-jsdoc, func-style
function resize () {
    // fix: android input focus
    if (/input/i.test(document.activeElement.tagName)) {
        return;
    }

    if (/\b(player\.html|mode=player)\b/.test(location)){
        window.STAGE_CSS_WIDTH = window.innerWidth;
        if (window.STAGE_CSS_WIDTH * (16 / 9) > window.innerHeight){
            window.STAGE_CSS_WIDTH = window.innerHeight * 9 / 16;
        }
    } else {
        window.STAGE_CSS_WIDTH = Math.min(
            // window.STAGE_WIDTH,
            window.STAGE_UI_WIDTH / (window.UI_WIDTH / htmlEl.clientWidth),
            window.STAGE_UI_WIDTH / (window.UI_HEIGHT / htmlEl.clientHeight)
        );

    }

    htmlEl.style.setProperty('--STAGE_CSS_WIDTH', window.STAGE_CSS_WIDTH);
    htmlEl.style.setProperty('--window-width', window.innerWidth);
    htmlEl.style.setProperty('--window-height', window.innerHeight);
}
resize();
addEventListener('resize', resize);


export default {
    standardStageWidth: window.STAGE_WIDTH,
    standardStageHeight: window.STAGE_HEIGHT,
    fullSizeMinWidth: 1096,
    fullSizePaintMinWidth: 1250
};

export {
    BLOCKS_DEFAULT_SCALE,
    STAGE_DISPLAY_SCALES,
    STAGE_DISPLAY_SIZES,
    STAGE_SIZE_MODES
};
