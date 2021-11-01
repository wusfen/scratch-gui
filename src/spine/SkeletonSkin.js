import { Skin } from 'scratch-render';

export default class SkeletonSkin extends Skin {

    constructor(id, skeletonData) {
        super(id);
        this._skeletonData = skeletonData;
    }

    get skeletonData(){
        return this._skeletonData;
    }

    get size () {
        return [0, 0];
    }

}