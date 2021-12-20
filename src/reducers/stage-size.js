import {STAGE_DISPLAY_SIZES} from '../lib/layout-constants.js';
import {doneConstants} from '../lib/screen-utils.js';

const SET_STAGE_SIZE = 'scratch-gui/StageSize/SET_STAGE_SIZE';
const SET_STAGE_SIZE_MODE = 'scratch-gui/StageSize/SET_STAGE_SIZE_MODE';
const SET_STAGE_CSS_WIDTH = 'scratch-gui/StageSize/SET_STAGE_CSS_WIDTH';
const ADD_STAGE_CSS_WIDTH = 'scratch-gui/StageSize/ADD_STAGE_CSS_WIDTH';

const initialState = {
    stageSize: STAGE_DISPLAY_SIZES.large,
    stageMode: 'portrait_9_16',
    stageCssWidth: window.STAGE_CSS_WIDTH
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_STAGE_SIZE:
        return {
            ...state,
            stageSize: action.stageSize
        };
    case SET_STAGE_SIZE_MODE:
        doneConstants(action.stageMode);
        return {
            ...state,
            stageMode: action.stageMode,
            stageCssWidth: window.STAGE_CSS_WIDTH
        };
    case ADD_STAGE_CSS_WIDTH:
        return {
            ...state,
            stageCssWidth: Math.max(action.offsetX + state.stageCssWidth, window.STAGE_CSS_WIDTH)
        };
    case SET_STAGE_CSS_WIDTH:
        return {
            ...state,
            stageCssWidth: action.stageCssWidth
        };
    default:
        return state;
    }
};

const setStageSize = function (stageSize) {
    return {
        type: SET_STAGE_SIZE,
        stageSize: stageSize
    };
};

const setStageSizeMode = function (mode) {
    return {
        type: SET_STAGE_SIZE_MODE,
        stageMode: mode
    };
};

const addStageCSSWidth = function (offsetX) {
    return {
        type: ADD_STAGE_CSS_WIDTH,
        offsetX: offsetX
    };
};

const setStageCSSWidth = function (width) {
    return {
        type: SET_STAGE_CSS_WIDTH,
        stageCssWidth: width
    };
};

export {
    reducer as default,
    initialState as stageSizeInitialState,
    setStageSize,
    setStageSizeMode,
    setStageCSSWidth,
    addStageCSSWidth
};
