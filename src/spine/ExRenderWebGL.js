import Renderer from 'scratch-render';
const twgl = require('twgl.js');
const SkeletonDrawable = require('./SkeletonDrawable');
import * as spine from "@esotericsoftware/spine-webgl";
import SkeletonSkin from './SkeletonSkin';


class ExRenderWebGL extends Renderer {

    constructor (canvas, xLeft, xRight, yBottom, yTop) {
        super(canvas, xLeft, xRight, yBottom, yTop);
    }

    draw(){
        if(this._lastFrameTime == undefined){
            this._lastFrameTime = Date.now() / 1000;
            this._delta = 0;
        }else{
            let now = Date.now() / 1000;
			this._delta = now - this._lastFrameTime;
			this._lastFrameTime = now;
        }
        super.draw();
        
        
    }

    resize (pixelsWide, pixelsTall) {
        const {canvas} = this._gl;
        const pixelRatio = window.devicePixelRatio || 1;
        const newWidth = pixelsWide * pixelRatio;
        const newHeight = pixelsTall * pixelRatio;
        if(!this._skeletonRenderer){
            this._skeletonRenderer = new spine.SceneRenderer(canvas, this._gl);
        }
        // Certain operations, such as moving the color picker, call `resize` once per frame, even though the canvas
        // size doesn't change. To avoid unnecessary canvas updates, check that we *really* need to resize the canvas.
        if (canvas.width !== newWidth || canvas.height !== newHeight) {
            canvas.width = newWidth;
            canvas.height = newHeight;
            this._skeletonRenderer.camera.setViewport(newWidth, newHeight);
            // Resizing the canvas causes it to be cleared, so redraw it.
            this.draw();
        }

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
            
            if(drawable instanceof SkeletonDrawable){
                drawable.update(this._delta);
                if(this._regionId !== "skeleton"){
                    this._regionId = "skeleton";
                    this._skeletonRenderer.begin();
                }
                //this._skeletonRenderer.resize(spine.ResizeMode.Expand);
                this._skeletonRenderer.drawSkeleton(drawable.skeleton, true);
                continue;
            }else if(this._regionId === "skeleton"){
                this._skeletonRenderer.end();
                gl.enable(gl.BLEND);

            }

            /** @todo check if drawable is inside the viewport before anything else */

            // Hidden drawables (e.g., by a "hide" block) are not drawn unless
            // the ignoreVisibility flag is used (e.g. for stamping or touchingColor).
            if (!drawable.getVisible() && !opts.ignoreVisibility) continue;

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
            gl.enable(gl.BLEND);

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


}


module.exports = ExRenderWebGL;