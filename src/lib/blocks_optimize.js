/* eslint-disable */
// 优化
export default function (Blockly){
    Blockly.Workspace.prototype.MAX_UNDO = 100;

    // 优化定位
    Blockly.WorkspaceSvg.prototype.topOnBlock = function(id) {
        if (!this.scrollbar) {
          console.warn('Tried to scroll a non-scrollable workspace.');
          return;
        }
      
        var block = this.getBlockById(id);
        if (!block) {
          return;
        }
      
        // XY is in workspace coordinates.
        var xy = block.getRelativeToSurfaceXY();
        // Height/width is in workspace units.
        var heightWidth = block.getHeightWidth();
      
        // Find the enter of the block in workspace units.
        // var blockCenterY = xy.y + heightWidth.height / 2;
        var blockCenterY = xy.y + 20; // 固定整理积木中心点为第一块积木自顶向下高度为20的地方，避免积木块太长造成顶部超出workspace的情况发生
      
        // In RTL the block's position is the top right of the block, not top left.
        var multiplier = this.RTL ? -1 : 1;
        var blockCenterX = xy.x + (multiplier * heightWidth.width / 2);
      
        // Workspace scale, used to convert from workspace coordinates to pixels.
        var scale = this.scale;
      
        // Center in pixels.  0, 0 is at the workspace origin.  These numbers may
        // be negative.
        var pixelX = blockCenterX * scale;
        var pixelY = blockCenterY * scale;
      
        var metrics = this.getMetrics();
      
        // Scrolling to here would put the block in the top-left corner of the
        // visible workspace.
        var scrollToBlockX = pixelX - metrics.contentLeft;
        var scrollToBlockY = pixelY - metrics.contentTop;
      
        // viewHeight and viewWidth are in pixels.
        var halfViewWidth = metrics.viewWidth / 2;
        var halfViewHeight = metrics.viewHeight / 6.5;
      
        // Put the block in the center of the visible workspace instead.
        var scrollToCenterX = scrollToBlockX - halfViewWidth;
        var scrollToCenterY = scrollToBlockY - halfViewHeight;
      
        Blockly.hideChaff();
        this.scrollbar.set(scrollToCenterX, scrollToCenterY);
      };
}