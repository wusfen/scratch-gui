import * as spine from "@esotericsoftware/spine-webgl";

export default class SceneRenderer {

    constructor (canvas, context, twoColorTint = true) {
		this.canvas = canvas;
		this.context = context instanceof spine.ManagedWebGLRenderingContext ? context : new spine.ManagedWebGLRenderingContext(context);
		this.twoColorTint = twoColorTint;
        let w = canvas.width / 2;
        let h = canvas.height / 2;
		this.batcherShader = twoColorTint ? spine.Shader.newTwoColoredTextured(this.context) : spine.Shader.newColoredTextured(this.context);
		this.batcher = new spine.PolygonBatcher(this.context, twoColorTint);
		this.skeletonRenderer = new spine.SkeletonRenderer(this.context, twoColorTint);
	}

    begin (projection) {
		this.batcherShader.bind();
        this.batcherShader.setUniform4x4f(spine.Shader.MVP_MATRIX, projection);
        this.batcherShader.setUniformi("u_texture", 0);
        this.batcher.begin(this.batcherShader);
	}

    drawSkeleton (skeleton, premultipliedAlpha = false, slotRangeStart = -1, slotRangeEnd = -1) {
		this.skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
		this.skeletonRenderer.draw(this.batcher, skeleton, slotRangeStart, slotRangeEnd);
	}

    end () {
		this.batcher.end();
		this.batcherShader.unbind();
		let gl = this.context.gl;
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	}

    dispose(){
        this.batcher.dispose();
		this.batcherShader.dispose();
    }
}