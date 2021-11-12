import Renderer from 'scratch-render';
const twgl = require('twgl.js');
const SkeletonDrawable = require('./SkeletonDrawable');
import * as spine from "@esotericsoftware/spine-webgl";
import SkeletonSkin from './SkeletonSkin';
import SceneRenderer from './SceneRenderer';

class ExRenderWebGL extends Renderer {

    constructor (canvas, xLeft, xRight, yBottom, yTop) {
        super(canvas, xLeft, xRight, yBottom, yTop);
        this._skeletonRenderer = new SceneRenderer(canvas, this._gl);
    }

    _drawThese (drawables, drawMode, projection, opts = {}) {
        const gl = this._gl;
        let currentShader = null;

        const numDrawables = drawables.length;
        for (let drawableIndex = 0; drawableIndex < numDrawables; ++drawableIndex) {
            const drawableID = drawables[drawableIndex];
            // If we have a filter, check whether the ID fails
            if (opts.filter && !opts.filter(drawableID)) continue;

            const drawable = this._allDrawables[drawableID];

            if (!drawable.getVisible() && !opts.ignoreVisibility) continue;
            //spine 渲染
            if(drawable instanceof SkeletonDrawable){
                if(!drawable.skeleton){
                    return;
                }
                drawable.update();
                if(this._regionId !== "skeleton"){
                    this._regionId = "skeleton";
                    this._skeletonRenderer.begin(projection);
                }
                this._skeletonRenderer.drawSkeleton(drawable.skeleton, true);
                continue;
            }else if(this._regionId === "skeleton"){
                this._skeletonRenderer.end();
            }

            // Combine drawable scale with the native vs. backing pixel ratio
            const drawableScale = this._getDrawableScreenSpaceScale(drawable);

            // If the skin or texture isn't ready yet, skip it.
            if (!drawable.skin || !drawable.skin.getTexture(drawableScale)) continue;
            
            const uniforms = {};

            let effectBits = drawable.enabledEffects;
            effectBits &= Object.prototype.hasOwnProperty.call(opts, 'effectMask') ? opts.effectMask : effectBits;
            const newShader = this._shaderManager.getShader(drawMode, effectBits);

            // Manually perform region check. Do not create functions inside a
            // loop.
            if (this._regionId !== newShader) {
                this._doExitDrawRegion();
                this._regionId = newShader;

                currentShader = newShader;
                gl.useProgram(currentShader.program);
                twgl.setBuffersAndAttributes(gl, currentShader, this._bufferInfo);
                Object.assign(uniforms, {
                    u_projectionMatrix: projection
                });
            }

            Object.assign(uniforms,
                drawable.skin.getUniforms(drawableScale),
                drawable.getUniforms());

            // Apply extra uniforms after the Drawable's, to allow overwriting.
            if (opts.extraUniforms) {
                Object.assign(uniforms, opts.extraUniforms);
            }
            
            if (uniforms.u_skin) {
                twgl.setTextureParameters(
                    gl, uniforms.u_skin, {
                        minMag: gl.LINEAR
                    }
                );
            }

            twgl.setUniforms(currentShader, uniforms);
            twgl.drawBufferInfo(gl, this._bufferInfo, gl.TRIANGLES);
        }
        if(this._regionId === "skeleton"){
            this._skeletonRenderer.end();
        }
        this._regionId = null; 
    }

    createSkelDrawable (group) {
        if (!group || !Object.prototype.hasOwnProperty.call(this._layerGroups, group)) {
            log.warn('Cannot create a drawable without a known layer group');
            return;
        }
        const drawableID = this._nextDrawableId++;
        const drawable = new SkeletonDrawable(drawableID);
        this._allDrawables[drawableID] = drawable;
        this._addToDrawList(drawableID, group);

        drawable.skin = null;

        return drawableID;
    }

    createSkelSkin (skeleton) {
        const skinId = this._nextSkinId++;
        const newSkin = new SkeletonSkin(skinId, skeleton);
        this._allSkins[skinId] = newSkin;
        return skinId;
    }

    updateSkelDrawableSkin(drawableID, costume){
        const drawable = this._allDrawables[drawableID];
        if (!drawable) return;
        drawable.skin = this._allSkins[costume.skinId];
        drawable.setSkinByName(costume.name);
    }

    updateSkelDrawableAnimation(drawableID, animationName){
        const drawable = this._allDrawables[drawableID];
        if (!drawable) return;
        drawable.setAnimation(animationName);
    }


    getCurrentSkinSize (drawableID) {
        const drawable = this._allDrawables[drawableID];
        if(drawable instanceof SkeletonDrawable){
            return  drawable.getSkinSize();
        }
        return this.getSkinSize(drawable.skin.id);
    }


}


module.exports = ExRenderWebGL;