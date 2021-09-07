const SET_AUTO_CLOSE = 'uploading/SET_AUTO_CLOSE';
const SET_VISIBLE = 'uploading/SET_VISIBLE';

const initialState = {
    autoClose: true,
    isVisible: true,
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_AUTO_CLOSE:
        return {
            ...state,
            autoClose: action.autoClose,
        };
    case SET_VISIBLE:
        return {
            ...state,
            isVisible: action.isVisible,
        };
    default:
        return state;
    }
};

const setAutoClose = autoClose => {
    return {
        type: SET_AUTO_CLOSE,
        autoClose,
    };
};

const setVisible = isVisible => {
    return {
        type: SET_VISIBLE,
        isVisible,
    };
};

export {
    reducer as default,
    initialState,
    setAutoClose,
    setVisible,
};
