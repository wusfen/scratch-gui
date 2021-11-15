import {Sprite} from 'scratch-vm';
import SkeletonRenderedTarget from './SkelRenderedTarget';

export default class SkeletonSprite extends Sprite {

    setSkeletonData (data){
        this._skeletonData = data;
    }

    getAnimations (){
        if (!this._skeletonData){
            return [];
        }
        return this._skeletonData.animations || [];
    }
    

    createClone (optLayerGroup) {
        const newClone = new SkeletonRenderedTarget(this, this.runtime);
        newClone.isOriginal = this.clones.length === 0;
        this.clones.push(newClone);
        newClone.initAudio();
        if (newClone.isOriginal) {
            // Default to the sprite layer group if optLayerGroup is not provided
            const layerGroup = typeof optLayerGroup === 'string' ? optLayerGroup : 'sprite';
            newClone.initDrawable(layerGroup);
            this.runtime.fireTargetWasCreated(newClone);
        } else {
            this.runtime.fireTargetWasCreated(newClone, this.clones[0]);
        }
        return newClone;
    }


}
