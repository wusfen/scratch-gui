import {STAGE_DISPLAY_SIZES, STAGE_SIZE_MODES, doneConstants} from '../lib/layout-constants.js';

const SET_STAGE_SIZE = 'scratch-gui/StageSize/SET_STAGE_SIZE';
const SET_STAGE_SIZE_MODE = 'scratch-gui/StageSize/SET_STAGE_SIZE_MODE';

const initialState = {
    stageSize: STAGE_DISPLAY_SIZES.large,
    stageMode: 'portrait_9_16'
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_STAGE_SIZE:
        return {
            stageSize: action.stageSize,
            stageMode: state.stageMode
        };
    case SET_STAGE_SIZE_MODE:
        doneConstants(action.stageMode);
        return {
            stageSize: state.stageSize,
            stageMode: action.stageMode
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

export {
    reducer as default,
    initialState as stageSizeInitialState,
    setStageSize,
    setStageSizeMode
};
