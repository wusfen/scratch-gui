const SET_TIPAUDIO = 'tipAudio/SET_TIPAUDIO';

const initialState = {
    tipAudioSrc: '123123'
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_TIPAUDIO:
        return Object.assign(initialState, {tipAudioSrc: action.src});
    default:
        return state;
    }
};
const setTipAudioSrc = src => ({
    type: SET_TIPAUDIO,
    src
});

export {
    reducer as default,
    initialState as tipAudioInitialState,
    setTipAudioSrc
};