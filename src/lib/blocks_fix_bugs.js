/* eslint-disable */
// fix bugs
export default function (Blockly){


    const orgSetOpacity = Blockly.BlockSvg.prototype.setOpacity;

    Blockly.BlockSvg.prototype.setOpacity = function (opacity) {
        orgSetOpacity.bind(this)(opacity);
        for (var i = this.inputList.length - 1; i >= 0; i--){
            const fieldRow = this.inputList[i].fieldRow;
            for (let j = fieldRow.length - 1; j >= 0; j--){
                const box_ = fieldRow[j].box_;
                if (box_){
                    box_.setAttribute('fill-opacity', this.opacity_);
                }
            }
        }
        for (var i = this.childBlocks_.length - 1; i >= 0; i--){
            this.childBlocks_[i].setOpacity(this.opacity_);
        }
    };

    Blockly.FieldDropdown.prototype.init = function () {
        if (this.fieldGroup_) {
        // Dropdown has already been initialized once.
            return;
        }
        // Add dropdown arrow: "option ▾" (LTR) or "▾ אופציה" (RTL)
        // Positioned on render, after text size is calculated.
        /** @type {Number} */
        this.arrowSize_ = 12;
        /** @type {Number} */
        this.arrowX_ = 0;
        /** @type {Number} */
        this.arrowY_ = 11;
        this.arrow_ = Blockly.utils.createSvgElement('image', {
            height: `${this.arrowSize_}px`,
            width: `${this.arrowSize_}px`
        });
        this.arrow_.setAttributeNS('http://www.w3.org/1999/xlink',
            'xlink:href', `${Blockly.mainWorkspace.options.pathToMedia}dropdown-arrow.svg`);
        this.className_ += ' blocklyDropdownText';
    
        Blockly.FieldDropdown.superClass_.init.call(this);
        // If not in a shadow block, draw a box.
        if (!this.sourceBlock_.isShadow()) {
            this.box_ = Blockly.utils.createSvgElement('rect', {
                'rx': Blockly.BlockSvg.CORNER_RADIUS,
                'ry': Blockly.BlockSvg.CORNER_RADIUS,
                'x': 0,
                'y': 0,
                'width': this.size_.width,
                'height': this.size_.height,
                'stroke': this.sourceBlock_.getColourTertiary(),
                'fill': this.sourceBlock_.getColour(),
                'class': 'blocklyBlockBackground',
                'fill-opacity': this.sourceBlock_.getOpacity()
            }, null);
            this.fieldGroup_.insertBefore(this.box_, this.textElement_);
        }
        // Force a reset of the text to add the arrow.
        const text = this.text_;
        this.text_ = null;
        this.setText(text);
    };

    Blockly.Flyout.prototype.show = function (xmlList) {
        this.workspace_.setResizesEnabled(false);
        this.hide();
        this.clearOldBlocks_();
      
        this.setVisible(true);
        // Create the blocks to be shown in this flyout.
        const contents = [];
        const gaps = [];
        this.permanentlyDisabled_.length = 0;
        for (var i = 0, xml; xml = xmlList[i]; i++) {
            // Handle dynamic categories, represented by a name instead of a list of XML.
            // Look up the correct category generation function and call that to get a
            // valid XML list.
            if (typeof xml === 'string') {
                const fnToApply = this.workspace_.targetWorkspace.getToolboxCategoryCallback(
                    xmlList[i]);
                const newList = fnToApply(this.workspace_.targetWorkspace);
                // Insert the new list of blocks in the middle of the list.
                // We use splice to insert at index i, and remove a single element
                // (the placeholder string). Because the spread operator (...) is not
                // available, use apply and concat the array.
                xmlList.splice.apply(xmlList, [i, 1].concat(newList));
                xml = xmlList[i];
            }
            if (xml.tagName) {
                const tagName = xml.tagName.toUpperCase();
                const default_gap = this.horizontalLayout_ ? this.GAP_X : this.GAP_Y;
                if (tagName == 'BLOCK') {
      
                    // We assume that in a flyout, the same block id (or type if missing id) means
                    // the same output BlockSVG.
      
                    // Look for a block that matches the id or type, our createBlock will assign
                    // id = type if none existed.
                    var id = xml.getAttribute('id') || xml.getAttribute('type');
                    const recycled = this.recycleBlocks_.findIndex(block => block.id === id);
      
      
                    // If we found a recycled item, reuse the BlockSVG from last time.
                    // Otherwise, convert the XML block to a BlockSVG.
                    var curBlock;
                    if (recycled > -1) {
                        curBlock = this.recycleBlocks_.splice(recycled, 1)[0];
                        const opacity = xml.getAttribute('opacity');
                        if (opacity) {
                            curBlock.setOpacity(opacity);
                        } else {
                            curBlock.setOpacity(1);
                        }
                    } else {
                        curBlock = Blockly.Xml.domToBlock(xml, this.workspace_);
                    }
      
                    if (curBlock.disabled) {
                        // Record blocks that were initially disabled.
                        // Do not enable these blocks as a result of capacity filtering.
                        this.permanentlyDisabled_.push(curBlock);
                    }
                    contents.push({type: 'block', block: curBlock});
                    const gap = parseInt(xml.getAttribute('gap'), 10);
                    gaps.push(isNaN(gap) ? default_gap : gap);
                } else if (xml.tagName.toUpperCase() == 'SEP') {
                    // Change the gap between two blocks.
                    // <sep gap="36"></sep>
                    // The default gap is 24, can be set larger or smaller.
                    // This overwrites the gap attribute on the previous block.
                    // Note that a deprecated method is to add a gap to a block.
                    // <block type="math_arithmetic" gap="8"></block>
                    const newGap = parseInt(xml.getAttribute('gap'), 10);
                    // Ignore gaps before the first block.
                    if (!isNaN(newGap) && gaps.length > 0) {
                        gaps[gaps.length - 1] = newGap;
                    } else {
                        gaps.push(default_gap);
                    }
                } else if ((tagName == 'LABEL') && (xml.getAttribute('showStatusButton') == 'true')) {
                    var curButton = new Blockly.FlyoutExtensionCategoryHeader(this.workspace_,
                        this.targetWorkspace_, xml);
                    contents.push({type: 'button', button: curButton});
                    gaps.push(default_gap);
                } else if (tagName == 'BUTTON' || tagName == 'LABEL') {
                    // Labels behave the same as buttons, but are styled differently.
                    const isLabel = tagName == 'LABEL';
                    var curButton = new Blockly.FlyoutButton(this.workspace_,
                        this.targetWorkspace_, xml, isLabel);
                    contents.push({type: 'button', button: curButton});
                    gaps.push(default_gap);
                }
            }
        }
      
        this.emptyRecycleBlocks_();
      
        this.layout_(contents, gaps);
      
        // IE 11 is an incompetent browser that fails to fire mouseout events.
        // When the mouse is over the background, deselect all blocks.
        const deselectAll = function () {
            const topBlocks = this.workspace_.getTopBlocks(false);
            for (var i = 0, block; block = topBlocks[i]; i++) {
                block.removeSelect();
            }
        };
      
        this.listeners_.push(Blockly.bindEvent_(this.svgBackground_, 'mouseover',
            this, deselectAll));
      
        this.workspace_.setResizesEnabled(true);
        this.reflow();
      
        // Correctly position the flyout's scrollbar when it opens.
        this.position();
      
        this.reflowWrapper_ = this.reflow.bind(this);
        this.workspace_.addChangeListener(this.reflowWrapper_);
      
        this.recordCategoryScrollPositions_();
    };
}
