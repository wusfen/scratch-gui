const SET_UPLOADING_PROGRESS = 'uploading/SET_UPLOADING_PROGRESS';

const initialState = {
    isShow: false,
    progress: 0,
    text: '',
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_UPLOADING_PROGRESS:

        if (action.progress === true) {
            return {
                isShow: true,
                progress: 1,
                text: '',
            };
        }
        if (action.progress === false) {
            return {
                isShow: false,
                progress: 0,
                text: '',
            };
        }

        return {
            ...state,
            progress: action.progress,
            text: action.text,
        };
    default:
        return state;
    }
};

const setUploadingProgress = (progress, text = '') => {
    return {
        type: SET_UPLOADING_PROGRESS,
        progress,
        text,
    };
};

export {
    reducer as default,
    initialState,
    setUploadingProgress,
};
