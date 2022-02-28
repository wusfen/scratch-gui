import keyMirror from 'keymirror';

/**
 * Names for each state of the stage size toggle
 * @enum {string}
 */
const STAGE_SIZE_MODES = {
    /**
    *竖屏9:16
    */
    portrait_9_16: '竖屏9:16',
    /**
    *竖屏3:4
    */
    portrait_3_4: '竖屏3:4',
    /**
    *横屏16:9
    */
    landscape_16_9: '横屏16:9',
    /**
    *横屏4:3
    */
    landscape_4_3: '横屏4:3',
};

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


window.MAX_STAGE_WIDTH = 1186;
window.MAX_STAGE_HEIGHT = 667;// 舞台最大大小

window.STAGE_WIDTH = 375;
window.STAGE_HEIGHT = 667;// 舞台真实大小
window.UI_WIDTH = 1024;
window.UI_HEIGHT = 768;
window.STAGE_UI_WIDTH = 357;// 舞台显示大小
window.STAGE_CSS_WIDTH = window.STAGE_UI_WIDTH;
// const searchParams = (new URL(location)).searchParams;
// if (searchParams.get('STAGE_WIDTH')) {
//     window.STAGE_WIDTH = +searchParams.get('STAGE_WIDTH');
//     window.STAGE_HEIGHT = +searchParams.get('STAGE_HEIGHT');
//     if (!window.STAGE_HEIGHT) {
//         window.STAGE_HEIGHT = window.STAGE_WIDTH * (16 / 9);
//     }
// }

// const htmlEl = document.documentElement;
// htmlEl.style.setProperty('--STAGE_WIDTH', window.STAGE_WIDTH);
// htmlEl.style.setProperty('--STAGE_HEIGHT', window.STAGE_HEIGHT);


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
    STAGE_SIZE_MODES,
};
