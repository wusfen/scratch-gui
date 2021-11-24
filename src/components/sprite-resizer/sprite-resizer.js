// 废弃 由 index.jsx
class SpriteResizer {
    renderer = null
    target = null
    targetDrawable = null

    layer = 'sprite'
    boxDrawable = null
    rotateDrawable = null
    resizeDrawable = null

    constructor (renderer) {
        this.renderer = renderer;

        this.boxDrawable = this.createDrawable(require('./img/b.png'));
        this.rotateDrawable = this.createDrawable(require('./img/r.png'));
        this.resizeDrawable = this.createDrawable(require('./img/s.png'));
    }

    createDrawable (imgUrl) {
        const renderer = this.renderer;
        const drawableID = renderer.createDrawable(this.layer);
        const drawable = renderer._allDrawables[drawableID];
        renderer.setDrawableOrder(drawableID, Infinity, this.layer);

        const img = new Image();
        img.src = imgUrl || require('./img/b.png');
        img.onload = e => {
            const skinId = renderer.createBitmapSkin(img);

            renderer.updateDrawableSkinId(drawableID, skinId);
        };

        return drawable;
    }
    setTarget (target) {
        this.renderer = target.renderer;
        this.target = target;
        this.targetDrawable = target.renderer._allDrawables[target.drawableID];

        this.set({
            x: target.x,
            y: target.y,
        });
    }
    set (options) {
        const {x, y, scale = 100, width, height} = options;
        this.boxDrawable.updateProperties({
            position: [x, y],
            scale: [scale, scale],
        });

        const box = this.renderer.extractDrawableScreenSpace(this.boxDrawable.id);
        this.rotateDrawable.updateProperties({
            position: [x + (box.width / 2), y + (box.height / 2)],
        });
        this.resizeDrawable.updateProperties({
            position: [x + (box.width / 2), y - (box.height / 2)],
        });
    }
    onUpdate (cb) {

    }
    destroy (){}
}

export default SpriteResizer;
