import {RenderedTarget} from 'scratch-vm';


export default class SkeletonRenderedTarget extends RenderedTarget {
    

    constructor (sprite, runtime) {
        super(sprite, runtime);
        this.isSkelSprite = true;//是否是spine
        this.currentAnimation = 0;//当前的动画
    }

    initDrawable (layerGroup) {
        if (this.renderer) {
            this.drawableID = this.renderer.createSkelDrawable(layerGroup);
        }
        // If we're a clone, start the hats.
        if (!this.isOriginal) {
            this.runtime.startHats(
                'control_start_as_clone', null, this
            );
        }
    }

    _updateDrawableSkin(drawableID, costume){
        this.renderer.updateSkelDrawableSkin(drawableID, costume);
    }

    setAnimation(index){
        this.currentAnimation = index;
        if (this.renderer) {
            const anims = this.getAnimations();
            if(anims.length > 0){
                this.renderer.updateSkelDrawableAnimation(this.drawableID, anims[index].name);
            }
            if (this.visible) {
                this.emit(RenderedTarget.EVENT_TARGET_VISUAL_CHANGE, this);
                this.runtime.requestRedraw();
            }
        }
        this.runtime.requestTargetsUpdate(this);
    }

    saveState(){//保存角色的状态
        super.saveState();
        if(this._currentAnimation === undefined){
            this._currentAnimation = this.currentAnimation;
        }
    }

    restoreState(){//恢复角色的状态 
        if(this._currentAnimation !== undefined){
            this.currentAnimation = this._currentAnimation;
            this._currentAnimation = undefined;
        }
        super.restoreState();
    }

    getAnimations(){
        return this.sprite.getAnimations();
    }

    updateAllDrawableProperties () {
        super.updateAllDrawableProperties();
        if (this.renderer) {
            const anims = this.getAnimations();
            if(anims.length > 0){
                this.renderer.updateSkelDrawableAnimation(this.drawableID, anims[this.currentAnimation].name);
            }
        }
    }

    makeClone () {
        if (!this.runtime.clonesAvailable() || this.isStage) {
            return null; // Hit max clone limit, or this is the stage.
        }
        const newClone = super.makeClone();
        newClone.currentAnimation = this.currentAnimation;
        if (this.renderer) {
            const anims = newClone.getAnimations();
            if(anims.length > 0){
                this.renderer.updateSkelDrawableAnimation(newClone.drawableID, anims[newClone.currentAnimation].name);
            }
           
        }
        return newClone;
    }

    toJSON () {
        const jsonObj = super.toJSON();
        jsonObj.isSkelSprite = this.isSkelSprite;
        return jsonObj;
    }

}