import * as spine from '@esotericsoftware/spine-webgl';
import {Drawable, Rectangle} from 'scratch-render';

class SkeletonDrawable extends Drawable {
    
    updatePosition (position) {
        if (this._position[0] !== position[0] ||
            this._position[1] !== position[1]) {
            this._position[0] = Math.round(position[0]);
            this._position[1] = Math.round(position[1]);
            if (this._skeleton){
                this._skeleton.x = this._position[0];
                this._skeleton.y = this._position[1];
            }
           
        }
    }

    /**
     * Update the direction if it is different. Marks the transform as dirty.
     * @param {number} direction A new direction.
     */
    updateDirection (direction) {
        if (this._direction !== direction) {
            this._direction = direction;
            if (this._skeleton){
                this._skeleton.getRootBone().rotation = -(direction - 90);
            }
        }
    }

    /**
     * Update the scale if it is different. Marks the transform as dirty.
     * @param {Array.<number>} scale A new scale.
     */
    updateScale (scale) {
        if (this._scale[0] !== scale[0] ||
            this._scale[1] !== scale[1]) {
            this._scale[0] = scale[0];
            this._scale[1] = scale[1];
            if (this._skeleton){
                this._skeleton.scaleX = scale[0] / 100;
                this._skeleton.scaleY = scale[1] / 100;
            }
        }
    }

    /**
     * Update visibility if it is different. Marks the convex hull as dirty.
     * @param {boolean} visible A new visibility state.
     */
    updateVisible (visible) {
        if (this._visible !== visible) {
            this._visible = visible;
            this.setConvexHullDirty();
        }
    }

    updateEffect (effectName, rawValue) {
        
    }

    getBounds (result) {
        // if (this.needsConvexHullPoints()) {
        //     throw new Error('Needs updated convex hull points before bounds calculation.');
        // }
        // if (this._transformDirty) {
        //     this._calculateTransform();
        // }
        // const transformedHullPoints = this._getTransformedHullPoints();
        // // Search through transformed points to generate box on axes.
        // result = result || new Rectangle();
        // result.initFromPointsAABB(transformedHullPoints);
        // return result;
        if (!this._skeleton){
            return result;
        }
        const offset = new spine.Vector2(); const size = new spine.Vector2();
        this._skeleton.getBounds(offset, size);
        result = result || new Rectangle();
        result.initFromBounds(offset.x, offset.x + size.x, offset.y, offset.y + size.y);
        return result;
    }

    /**
     * Get the precise bounds for the upper 8px slice of the Drawable.
     * Used for calculating where to position a text bubble.
     * Before calling this, ensure the renderer has updated convex hull points.
     * @param {?Rectangle} result optional destination for bounds calculation
     * @return {!Rectangle} Bounds for a tight box around a slice of the Drawable.
     */
    getBoundsForBubble (result) {
        if (this.needsConvexHullPoints()) {
            throw new Error('Needs updated convex hull points before bubble bounds calculation.');
        }
        if (this._transformDirty) {
            this._calculateTransform();
        }
        const slice = 8; // px, how tall the top slice to measure should be.
        const transformedHullPoints = this._getTransformedHullPoints();
        const maxY = Math.max.apply(null, transformedHullPoints.map(p => p[1]));
        const filteredHullPoints = transformedHullPoints.filter(p => p[1] > maxY - slice);
        // Search through filtered points to generate box on axes.
        result = result || new Rectangle();
        result.initFromPointsAABB(filteredHullPoints);
        return result;
    }

    /**
     * Get the rough axis-aligned bounding box for the Drawable.
     * Calculated by transforming the skin's bounds.
     * Note that this is less precise than the box returned by `getBounds`,
     * which is tightly snapped to account for a Drawable's transparent regions.
     * `getAABB` returns a much less accurate bounding box, but will be much
     * faster to calculate so may be desired for quick checks/optimizations.
     * @param {?Rectangle} result optional destination for bounds calculation
     * @return {!Rectangle} Rough axis-aligned bounding box for Drawable.
     */
    getAABB (result) {
        return this.getBounds(result);
    }

    /**
     * Return the best Drawable bounds possible without performing graphics queries.
     * I.e., returns the tight bounding box when the convex hull points are already
     * known, but otherwise return the rough AABB of the Drawable.
     * @param {?Rectangle} result optional destination for bounds calculation
     * @return {!Rectangle} Bounds for the Drawable.
     */
    getFastBounds (result) {
        return this.getBounds(result);
    }

    update (){
        if (this._skeleton){
            let delta = 0;
            if (this._lastFrameTime == undefined){
                this._lastFrameTime = Date.now() / 1000;
            } else {
                const now = Date.now() / 1000;
                delta = now - this._lastFrameTime;
                this._lastFrameTime = now;
            }
            this._animationState.update(delta);
            this._animationState.apply(this._skeleton);
            this._skeleton.updateWorldTransform();
        }
       
        
    }

    get skeleton (){
        return this._skeleton;
    }

    set skin (newSkin) {
        super.skin = newSkin;
        if (this._skin) {
            if (!this._skeleton){
                this._skeleton = new spine.Skeleton(this._skin.skeletonData);
                // if(this._skeleton.data.skins.length > 0){
                //     this._skeleton.setSkinByName(this._skeleton.data.skins[0].name);
                // }
                const animationStateData = new spine.AnimationStateData(this._skeleton.data);
                this._animationState = new spine.AnimationState(animationStateData);
                if (this._skeleton.data.animations.length > 0){
                    this._animationState.setAnimation(0, this._skeleton.data.animations[0].name, true);
                }
                
            }
            
        }
    }
    
    get skin (){
        return this._skin;
    }
    
    setSkinByName (name){
        if (this._skeleton){
            this._skeleton.setSkinByName(name);
            this._skeleton.setSlotsToSetupPose();
        }
        
    }
    setAnimation (animationName){
        if (this._skeleton){
            this._skeleton.setSlotsToSetupPose();
            this._animationState.setAnimation(0, animationName, true);
        }
        
    }

    _isTouchingNearest (vec) {
        const bounds = this.getBounds();
        const x = vec[0];
        const y = vec[1];
        if (x < bounds.left || x > bounds.right || y < bounds.bottom || y > bounds.top){
            return false;
        }
        return true;
    }

    getSkinSize () {
        if (this._skeleton){
            const offset = new spine.Vector2(); const size = new spine.Vector2();
            this._skeleton.getBounds(offset, size);
            return [Math.round(size.x / this._skeleton.scaleX), Math.round(size.y / this._skeleton.scaleY)];
        }
        return [0, 0];
    }

    get rotationCenter () {
        if (this._skeleton){
            const offset = new spine.Vector2(); const size = new spine.Vector2();
            this._skeleton.getBounds(offset, size);
            return [Math.round(size.x / this._skeleton.scaleX / 2), Math.round(size.y / this._skeleton.scaleY)];
        }
        return [0, 0, 0];
    }
    
}


module.exports = SkeletonDrawable;
