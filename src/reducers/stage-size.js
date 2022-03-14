import {STAGE_DISPLAY_SIZES} from '../lib/layout-constants.js';
import {doneConstants} from '../lib/screen-utils.js';

const SET_STAGE_SIZE = 'scratch-gui/StageSize/SET_STAGE_SIZE';
const SET_STAGE_SIZE_MODE = 'scratch-gui/StageSize/SET_STAGE_SIZE_MODE';
const SET_STAGE_CSS_WIDTH = 'scratch-gui/StageSize/SET_STAGE_CSS_WIDTH';
const ADD_STAGE_CSS_WIDTH = 'scratch-gui/StageSize/ADD_STAGE_CSS_WIDTH';
const SET_FULL_SCREEN = 'scratch-gui/StageSize/SET_FULL_SCREEN';

const initialState = {
    stageSize: STAGE_DISPLAY_SIZES.large,
    stageMode: 'portrait_9_16',
    stageCssWidth: window.STAGE_CSS_WIDTH, // stageCssWidth 舞台真正显示的大小
    stageCssHeight: window.STAGE_CSS_WIDTH * 16 / 9,
    stageScale: window.STAGE_CSS_WIDTH / window.STAGE_WIDTH,
    stageRotate: 0,
    isFullScreen: false
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
            stageCssWidth: window.STAGE_CSS_WIDTH,
            stageCssHeight: window.STAGE_CSS_WIDTH / window.STAGE_WIDTH * window.STAGE_HEIGHT,
            stageScale: window.STAGE_CSS_WIDTH / window.STAGE_WIDTH
        };
    case ADD_STAGE_CSS_WIDTH:{
        let reqWidth = action.offsetX + state.stageCssWidth;
        let scale = reqWidth / window.STAGE_WIDTH;
        let height = scale * window.STAGE_HEIGHT;
        const ele = document.getElementById('stageCanvasWrapper');
        if (ele){
            const rect = ele.getBoundingClientRect();
            if (height > rect.height){
                scale = rect.height / window.STAGE_HEIGHT;
                reqWidth = scale * window.STAGE_WIDTH;
                height = rect.height;
            }
        }
        return {
            ...state,
            stageCssWidth: reqWidth,
            stageCssHeight: height,
            stageScale: scale
        };
    }

    case SET_STAGE_CSS_WIDTH:
        return {
            ...state,
            stageCssWidth: action.stageCssWidth,
            stageCssHeight: action.stageCssWidth / window.STAGE_WIDTH * window.STAGE_HEIGHT,
            stageScale: action.stageCssWidth / window.STAGE_WIDTH
        };
    case SET_FULL_SCREEN:{
        if (!action.isFullScreen){
            return {
                ...state,
                isFullScreen: false,
                stageCssWidth: window.STAGE_CSS_WIDTH,
                stageCssHeight: window.STAGE_CSS_WIDTH / window.STAGE_WIDTH * window.STAGE_HEIGHT,
                stageScale: window.STAGE_CSS_WIDTH / window.STAGE_WIDTH,
                stageRotate: 0
            };
        }
        let cssWidth; let maxHeight;
        if ('ontouchstart' in window){
            if (state.stageMode === 'portrait_9_16' || state.stageMode === 'portrait_3_4'){
                cssWidth = Math.min(window.innerHeight, window.innerWidth);
                maxHeight = Math.max(window.innerHeight, window.innerWidth);

            } else {
                cssWidth = Math.max(window.innerHeight, window.innerWidth);
                maxHeight = Math.min(window.innerHeight, window.innerWidth);
            }
        } else {
            cssWidth = window.innerWidth;
            maxHeight = window.innerHeight;
        }
        const rotate = cssWidth === window.innerHeight ? 270 : 0;
        let scale = cssWidth / window.STAGE_WIDTH;
        let ccsHeight = scale * window.STAGE_HEIGHT;
        if (ccsHeight > maxHeight){
            ccsHeight = maxHeight;
            scale = ccsHeight / window.STAGE_HEIGHT;
            cssWidth = scale * window.STAGE_WIDTH;
        }
        return {
            ...state,
            isFullScreen: true,
            stageCssWidth: cssWidth,
            stageCssHeight: ccsHeight,
            stageScale: scale,
            stageRotate: rotate
        };

    }
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

const setFullScreen = function (isFullScreen) {
    return {
        type: SET_FULL_SCREEN,
        isFullScreen: isFullScreen
    };
};

export {
    reducer as default,
    initialState as stageSizeInitialState,
    setStageSize,
    setStageSizeMode,
    setStageCSSWidth,
    addStageCSSWidth,
    setFullScreen
};
