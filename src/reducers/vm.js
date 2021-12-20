import VM from 'scratch-vm';
import storage from '../lib/storage';
import {setStageSizeMode} from './stage-size';

const SET_VM = 'scratch-gui/vm/SET_VM';
const defaultVM = new VM();
defaultVM.attachStorage(storage);
const initialState = defaultVM;
window.vm = defaultVM;
const orgDeserializeProject = defaultVM.deserializeProject;
defaultVM.deserializeProject = function (projectJSON, zip) {
    if (projectJSON.stageMode && window.store){
        window.store.dispatch(setStageSizeMode(projectJSON.stageMode));
    }
    return orgDeserializeProject.apply(this, arguments);
};


const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_VM:
        return action.vm;
    default:
        return state;
    }
};
const setVM = function (vm) {
    return {
        type: SET_VM,
        vm: vm
    };
};

export {
    reducer as default,
    initialState as vmInitialState,
    setVM
};
