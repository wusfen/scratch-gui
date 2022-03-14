const SET_PLAYER = 'scratch-gui/mode/SET_PLAYER';
const SET_STATE_HIDDEN = 'scratch-gui/mode/SET_STATE_HIDDEN';

const initialState = {
    showBranding: false,
    isPlayerOnly: false,
    hasEverEnteredEditor: true,
    isStageHidden: false, // 舞台/编码模式切换
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_PLAYER:
        return Object.assign({}, state, {
            isPlayerOnly: action.isPlayerOnly,
            hasEverEnteredEditor: state.hasEverEnteredEditor || !action.isPlayerOnly
        });
    case SET_STATE_HIDDEN:
        return Object.assign({}, state, {
            isStageHidden: action.isStageHidden === undefined ? !state.isStageHidden : action.isStageHidden
        });
    default:
        return state;
    }
};


const setPlayer = function (isPlayerOnly) {
    return {
        type: SET_PLAYER,
        isPlayerOnly: isPlayerOnly
    };
};
const toggleStageHidden = function (isStageHidden) {
    return {
        type: SET_STATE_HIDDEN,
        isStageHidden: isStageHidden
    };
};

export {
    reducer as default,
    initialState as modeInitialState,
    setPlayer,
    toggleStageHidden,
};
