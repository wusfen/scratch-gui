const SET_UPLOADING_PROGRESS = 'uploading/SET_UPLOADING_PROGRESS';

const initialState = {
    progress: 0,
    text: '',
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_UPLOADING_PROGRESS:
        return {
            ...state,
            progress: action.progress,
            text: action.text,
        };
    default:
        return state;
    }
};

const setUploadingProgress = (progress, text = '') => ({
    type: SET_UPLOADING_PROGRESS,
    progress,
    text,
});

export {
    reducer as default,
    initialState,
    setUploadingProgress,
};
