import layout, {STAGE_DISPLAY_SCALES, STAGE_SIZE_MODES, STAGE_DISPLAY_SIZES} from '../lib/layout-constants';
import {setStageCSSWidth} from '../reducers/stage-size';

// eslint-disable-next-line require-jsdoc, func-style
function resize (mode) {
    const htmlEl = document.documentElement;
    if (/\b(player\.html|mode=player)\b/.test(location)){
        mode = (typeof mode == 'string') ? mode : (window.store ? window.store.getState().scratchGui.stageSize.stageMode : 'portrait_9_16');
        window.STAGE_CSS_WIDTH = window.innerWidth;
        switch (mode){
        case 'portrait_3_4':
            if (window.STAGE_CSS_WIDTH * (4 / 3) > window.innerHeight){
                window.STAGE_CSS_WIDTH = window.innerHeight * 3 / 4;
            }
            break;
        case 'landscape_4_3':
            if (window.STAGE_CSS_WIDTH * (3 / 4) > window.innerHeight){
                window.STAGE_CSS_WIDTH = window.innerHeight * 4 / 3;
            }
            break;
        case 'landscape_16_9':
            if (window.STAGE_CSS_WIDTH * (9 / 16) > window.innerHeight){
                window.STAGE_CSS_WIDTH = window.innerHeight * 16 / 9;
            }
            break;
        default:
            if (window.STAGE_CSS_WIDTH * (16 / 9) > window.innerHeight){
                window.STAGE_CSS_WIDTH = window.innerHeight * 9 / 16;
            }
            break;
        }
    } else {
        window.STAGE_CSS_WIDTH = Math.min(
            // window.STAGE_WIDTH,
            window.STAGE_UI_WIDTH / (window.UI_WIDTH / htmlEl.clientWidth),
            window.STAGE_UI_WIDTH / (window.UI_HEIGHT / htmlEl.clientHeight)
        );
    }
    htmlEl.style.setProperty('--window-width', window.innerWidth);
    htmlEl.style.setProperty('--window-height', window.innerHeight);
}
function resize2 (){
    // fix: android input focus
    if (/input/i.test(document.activeElement.tagName)) {
        return;
    }
    resize();
    window.store && window.store.dispatch(setStageCSSWidth(window.STAGE_CSS_WIDTH));
}
resize();
addEventListener('resize', resize2);


const doneConstants = function (mode){
    resize(mode);
    switch (mode){
    case 'portrait_3_4':
        window.STAGE_WIDTH = 500;
        window.STAGE_HEIGHT = 667;
        break;
    case 'landscape_4_3':
        window.STAGE_WIDTH = 889;
        window.STAGE_HEIGHT = 667;
        break;
    case 'landscape_16_9':
        window.STAGE_WIDTH = 1186;
        window.STAGE_HEIGHT = 667;
        break;
    default:
        window.STAGE_WIDTH = 375;
        window.STAGE_HEIGHT = 667;
        break;
    }
};

/**
 * @typedef {object} StageDimensions
 * @property {int} height - the height to be used for the stage in the current situation.
 * @property {int} width - the width to be used for the stage in the current situation.
 * @property {number} scale - the scale factor from the stage's default size to its current size.
 * @property {int} heightDefault - the height of the stage in its default (large) size.
 * @property {int} widthDefault - the width of the stage in its default (large) size.
 */

const STAGE_DIMENSION_DEFAULTS = {
    // referencing css/units.css,
    // spacingBorderAdjustment = 2 * $full-screen-top-bottom-margin +
    //   2 * $full-screen-border-width
    fullScreenSpacingBorderAdjustment: 12,
    // referencing css/units.css,
    // menuHeightAdjustment = $stage-menu-height
    menuHeightAdjustment: 44
};

/**
 * Resolve the current GUI and browser state to an actual stage size enum value.
 * @param {STAGE_SIZE_MODES} stageSizeMode - the state of the stage size toggle button.
 * @param {boolean} isFullSize - true if the window is large enough for the large stage at its full size.
 * @return {STAGE_DISPLAY_SIZES} - the stage size enum value we should use in this situation.
 */
const resolveStageSize = (stageSizeMode, isFullSize) => {
    if (stageSizeMode === STAGE_DISPLAY_SIZES.small) {
        return STAGE_DISPLAY_SIZES.small;
    }
    if (isFullSize) {
        return STAGE_DISPLAY_SIZES.large;
    }
    return STAGE_DISPLAY_SIZES.largeConstrained;
};

/**
 * 动态改变需要调整这里
 * Retrieve info used to determine the actual stage size based on the current GUI and browser state.
 * @param {STAGE_SIZE_MODES} stageSize - the current fully-resolved stage size.
 * @param {boolean} isFullScreen - true if full-screen mode is enabled.
 * @return {StageDimensions} - an object describing the dimensions of the stage.
 */
const getStageDimensions = (stageSize, isFullScreen) => {
    const stageDimensions = {
        heightDefault: window.STAGE_HEIGHT,
        widthDefault: window.STAGE_WIDTH,
        height: 0,
        width: 0,
        scale: 0
    };
    if (isFullScreen) {
        stageDimensions.height = window.innerHeight -
            STAGE_DIMENSION_DEFAULTS.menuHeightAdjustment -
            STAGE_DIMENSION_DEFAULTS.fullScreenSpacingBorderAdjustment;

        stageDimensions.width = stageDimensions.height + (stageDimensions.height / 3);

        if (stageDimensions.width > window.innerWidth) {
            stageDimensions.width = window.innerWidth;
            stageDimensions.height = stageDimensions.width * .75;
        }

        stageDimensions.scale = stageDimensions.width / stageDimensions.widthDefault;
    } else {
        stageDimensions.scale = window.store.getState().scratchGui.stageSize.stageCssWidth / window.STAGE_WIDTH;
        stageDimensions.height = stageDimensions.scale * stageDimensions.heightDefault;
        stageDimensions.width = stageDimensions.scale * stageDimensions.widthDefault;
        const ele = document.getElementById('stageCanvasWrapper');
        if (ele){
            const rect = ele.getBoundingClientRect();
            if (stageDimensions.height > rect.height){
                stageDimensions.scale = rect.height / window.STAGE_HEIGHT;
                stageDimensions.height = rect.height;
                stageDimensions.width = stageDimensions.scale * stageDimensions.widthDefault;
            }
        }
    }

    // Round off dimensions to prevent resampling/blurriness
    stageDimensions.height = Math.round(stageDimensions.height);
    stageDimensions.width = Math.round(stageDimensions.width);

    return stageDimensions;
};

/**
 * Take a pair of sizes for the stage (a target height and width and a default height and width),
 * calculate the ratio between them, and return a CSS transform to scale to that ratio.
 * @param {object} sizeInfo An object containing dimensions of the target and default stage sizes.
 * @param {number} sizeInfo.width The target width
 * @param {number} sizeInfo.height The target height
 * @param {number} sizeInfo.widthDefault The default width
 * @param {number} sizeInfo.heightDefault The default height
 * @returns {object} the CSS transform
 */
const stageSizeToTransform = ({width, height, widthDefault, heightDefault}) => {
    const scaleX = width / widthDefault;
    const scaleY = height / heightDefault;
    if (scaleX === 1 && scaleY === 1) {
        // Do not set a transform if the scale is 1 because
        // it messes up `position: fixed` elements like the context menu.
        return;
    }
    return {transform: `scale(${scaleX},${scaleY})`};
};

export {
    getStageDimensions,
    resolveStageSize,
    stageSizeToTransform,
    doneConstants
};
