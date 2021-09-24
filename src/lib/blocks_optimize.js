/* eslint-disable */
// 优化
export default function (Blockly){
    Blockly.Workspace.prototype.MAX_UNDO = 100;

    // 优化定位
    Blockly.WorkspaceSvg.prototype.topOnBlock = function (id) {
        if (this.scrollbar) {
            let a = this.getBlockById(id);
            if (a) {
                var b = a.getRelativeToSurfaceXY();
                var c = a.getHeightWidth();
                var d = this.scale;
                a = (b.x + ((this.RTL ? -1 : 1) * (c.width / 2))) * d;
                b = (b.y + (c.height / 2)) * d;
                c = this.getMetrics();
                a = a - c.contentLeft - (c.viewWidth / 1.6);
                b = b - c.contentTop - (c.viewHeight / 6.5);
                Blockly.hideChaff();
                this.scrollbar.set(a, b);
            } else {
                console.warn('Tried to scroll a non-scrollable workspace.');
            }
        }
    };
}