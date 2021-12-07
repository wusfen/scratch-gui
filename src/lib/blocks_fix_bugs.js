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
                    if(!curBlock.rendered){
                        continue;
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

    // Blockly.ContextMenu.workspaceCommentOption = function(ws, e) {
    //     // Helper function to create and position a comment correctly based on the
    //     // location of the mouse event.
    //     var addWsComment = function() {
    //       // Disable events while this comment is getting created
    //       // so that we can fire a single create event for this comment
    //       // at the end (instead of CommentCreate followed by CommentMove,
    //       // which results in unexpected undo behavior).
    //       var disabled = false;
    //       if (Blockly.Events.isEnabled()) {
    //         Blockly.Events.disable();
    //         disabled = true;
    //       }
    //       var comment = new Blockly.WorkspaceCommentSvg(
    //           ws, '', Blockly.WorkspaceCommentSvg.DEFAULT_SIZE,
    //           Blockly.WorkspaceCommentSvg.DEFAULT_SIZE, false);
      
    //       var injectionDiv = ws.getInjectionDiv();
    //       // Bounding rect coordinates are in client coordinates, meaning that they
    //       // are in pixels relative to the upper left corner of the visible browser
    //       // window.  These coordinates change when you scroll the browser window.
    //       var boundingRect = injectionDiv.getBoundingClientRect();
      
    //       // The client coordinates offset by the injection div's upper left corner.
    //       var clientOffsetPixels = new goog.math.Coordinate(
    //           e.clientX - boundingRect.left, e.clientY - boundingRect.top);
      
    //       // The offset in pixels between the main workspace's origin and the upper
    //       // left corner of the injection div.
    //       var mainOffsetPixels = ws.getOriginOffsetInPixels();
      
    //       // The position of the new comment in pixels relative to the origin of the
    //       // main workspace.
    //       var finalOffsetPixels = goog.math.Coordinate.difference(clientOffsetPixels,
    //           mainOffsetPixels);
      
    //       // The position of the new comment in main workspace coordinates.
    //       var finalOffsetMainWs = finalOffsetPixels.scale(1 / ws.scale);
      
    //       var commentX = finalOffsetMainWs.x;
    //       var commentY = finalOffsetMainWs.y;
    //       comment.moveBy(commentX, commentY);
    //       if (ws.rendered) {
    //         comment.initSvg();
    //         comment.render(false);
    //         comment.select();
    //       }
    //       if (disabled) {
    //         Blockly.Events.enable();
    //       }
    //       Blockly.WorkspaceComment.fireCreateEvent(comment);
    //     };
      
    //     var wsCommentOption = {enabled: true};
    //     wsCommentOption.text = Blockly.Msg.ADD_COMMENT;
    //     wsCommentOption.callback = function() {
    //       addWsComment();
    //     };
    //     return wsCommentOption;
    //   };


    Blockly.Workspace.prototype.fireChangeListener = function(event) {
        if (event.recordUndo && !this.isFlyout) {
          this.undoStack_.push(event);
          this.redoStack_.length = 0;
          if (this.undoStack_.length > this.MAX_UNDO) {
            this.undoStack_.shift();
          }
          //console.log(this.undoStack_.length, "xxxxx", this.id)
        }
       
        // Copy listeners in case a listener attaches/detaches itself.
        var currentListeners = this.listeners_.slice();
        for (var i = 0, func; func = currentListeners[i]; i++) {
          func(event);
        }
    };

    Blockly.Block.prototype.dispose = function(healStack) {
        if (!this.workspace) {
          // Already deleted.
          return;
        }
        // Terminate onchange event calls.
        if (this.onchangeWrapper_) {
          this.workspace.removeChangeListener(this.onchangeWrapper_);
        }
        this.unplug(healStack);
        if (Blockly.Events.isEnabled() && !this.workspace.isFlyout) {//是flayout就不发送删除事件，因为不需要undo
          Blockly.Events.fire(new Blockly.Events.BlockDelete(this));
        }
        Blockly.Events.disable();
      
        try {
          // This block is now at the top of the workspace.
          // Remove this block from the workspace's list of top-most blocks.
          if (this.workspace) {
            this.workspace.removeTopBlock(this);
            // Remove from block database.
            delete this.workspace.blockDB_[this.id];
            this.workspace = null;
          }
      
          // Just deleting this block from the DOM would result in a memory leak as
          // well as corruption of the connection database.  Therefore we must
          // methodically step through the blocks and carefully disassemble them.
      
          if (Blockly.selected == this) {
            Blockly.selected = null;
          }
      
          // First, dispose of all my children.
          for (var i = this.childBlocks_.length - 1; i >= 0; i--) {
            this.childBlocks_[i].dispose(false);
          }
          // Then dispose of myself.
          // Dispose of all inputs and their fields.
          for (var i = 0, input; input = this.inputList[i]; i++) {
            input.dispose();
          }
          this.inputList.length = 0;
          // Dispose of any remaining connections (next/previous/output).
          var connections = this.getConnections_(true);
          for (var i = 0; i < connections.length; i++) {
            var connection = connections[i];
            if (connection.isConnected()) {
              connection.disconnect();
            }
            connections[i].dispose();
          }
        } finally {
          Blockly.Events.enable();
        }
      };

    //   Blockly.BlockSvg.prototype.moveBy = function(dx, dy) {
    //     //goog.asserts.assert(!this.parentBlock_, 'Block has parent.');
    //     var eventsEnabled = Blockly.Events.isEnabled();
    //     if (eventsEnabled) {
    //       var event = new Blockly.Events.BlockMove(this);
    //     }
    //     var xy = this.getRelativeToSurfaceXY();
    //     this.translate(xy.x + dx, xy.y + dy);
    //     this.moveConnections_(dx, dy);
    //     if (eventsEnabled) {
    //         event.recordUndo = !this.workspace.isFlyout;//是flayout就不需要undo
    //         event.recordNew();
    //         Blockly.Events.fire(event);
    //     }
    //     this.workspace.resizeContents();
    //   };

      Blockly.Field.prototype.setValue = function(newValue) {
        if (newValue === null) {
          // No change if null.
          return;
        }
        var oldValue = this.getValue();
        if (oldValue == newValue) {
          return;
        }
        if (this.sourceBlock_ && Blockly.Events.isEnabled() && !this.sourceBlock_.workspace.isFlyout) {
          Blockly.Events.fire(new Blockly.Events.BlockChange(
              this.sourceBlock_, 'field', this.name, oldValue, newValue));
        }
        this.setText(newValue);
      };

      // Blockly.WorkspaceSvg.prototype.setScale = function(newScale) {
      //   if(this.options.zoomOptions){
      //       if (this.options.zoomOptions.maxScale &&
      //         newScale > this.options.zoomOptions.maxScale) {
      //       newScale = this.options.zoomOptions.maxScale;
      //     } else if (this.options.zoomOptions.minScale &&
      //         newScale < this.options.zoomOptions.minScale) {
      //       newScale = this.options.zoomOptions.minScale;
      //     }
      //   }
        
      //   this.scale = newScale;
      //   if (this.grid_) {
      //     this.grid_.update(this.scale);
      //   }
      //   if (this.scrollbar) {
      //     this.scrollbar.resize();
      //   } else {
      //     this.translate(this.scrollX, this.scrollY);
      //   }
      //   Blockly.hideChaff(false);
      //   if (this.flyout_) {
      //     // No toolbox, resize flyout.
      //     this.flyout_.reflow();
      //   }
      //   if(this.toolbox_ && this.toolbox_.flyout_){
      //     this.toolbox_.flyout_.reflow();
      //   }
      // };

      Blockly.init_ = function(mainWorkspace) {
        var options = mainWorkspace.options;
        var svg = mainWorkspace.getParentSvg();
      
        // Suppress the browser's context menu.
        Blockly.bindEventWithChecks_(svg.parentNode, 'contextmenu', null,
            function(e) {
              if (!Blockly.utils.isTargetInput(e)) {
                e.preventDefault();
              }
            });
      
        var workspaceResizeHandler = Blockly.bindEventWithChecks_(window, 'resize',
            null,
            function() {
              // fix: 积木调起软键盘后马上被收起，无法进行输入
              if (/input/i.test(document.activeElement?.tagName)) {
                document.activeElement.dispatchEvent(new Event('input'))
                document.activeElement.scrollIntoView({block:"center", behavior:'smooth'})
                return
              }

              Blockly.hideChaffOnResize(true);
              const scale = Blockly.getFitScale();
              mainWorkspace.options.zoomOptions.startScale = scale;
              mainWorkspace.setScale(scale);
              Blockly.svgResize(mainWorkspace);
              // mainWorkspace.scrollCenter();
             //const toolbox = mainWorkspace.toolbox_;
             if(mainWorkspace.toolbox_ && mainWorkspace.toolbox_.flyout_){
                const flyout = mainWorkspace.toolbox_.flyout_;
                flyout.workspace_.scale = scale;
                flyout.reflow();
             }
             
              //const flyoutWS = mainWorkspace.getFlyout().getWorkspace();
              //toolbox.flyout_.DEFAULT_WIDTH = (250+70) * scale;
              // toolbox.width = toolbox_.flyout_.DEFAULT_WIDTH + (50 * scale);
              //flyoutWS.setScale(scale);
          });
        mainWorkspace.setResizeHandlerWrapper(workspaceResizeHandler);
      
        Blockly.inject.bindDocumentEvents_();
      
        if (options.languageTree) {
          if (mainWorkspace.toolbox_) {
            mainWorkspace.toolbox_.init(mainWorkspace);
          } else if (mainWorkspace.flyout_) {
            // Build a fixed flyout with the root blocks.
            mainWorkspace.flyout_.init(mainWorkspace);
            mainWorkspace.flyout_.show(options.languageTree.childNodes);
            mainWorkspace.flyout_.scrollToStart();
            // Translate the workspace to avoid the fixed flyout.
            if (options.horizontalLayout) {
              mainWorkspace.scrollY = mainWorkspace.flyout_.height_;
              if (options.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
                mainWorkspace.scrollY *= -1;
              }
            } else {
              mainWorkspace.scrollX = mainWorkspace.flyout_.width_;
              if (options.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
                mainWorkspace.scrollX *= -1;
              }
            }
            mainWorkspace.translate(mainWorkspace.scrollX, mainWorkspace.scrollY);
          }
        }
      
        if (options.hasScrollbars) {
          mainWorkspace.scrollbar = new Blockly.ScrollbarPair(mainWorkspace);
          mainWorkspace.scrollbar.resize();
        }
      
        // Load the sounds.
        if (options.hasSounds) {
          Blockly.inject.loadSounds_(options.pathToMedia, mainWorkspace);
        }
      };

      Blockly.getFitScale = function(){
        // return Math.max(0.5, Math.min(.75 * (window.innerHeight / 768), 1)); // todo add
        // TODO
        return 0.75 * (window.innerHeight / 768)
      }
      Blockly.Flyout.prototype.setVisible = function(visible) {
        var visibilityChanged = (visible != this.isVisible());
      
        this.isVisible_ = visible;
        if (visibilityChanged) {
          if(this._changeSize && this.isVisible_){
            this.position();//重新计算大小
            this._changeSize = false;
          }
          this.updateDisplay_();
        }
      };

      //实现reflowInternal_方法
      Blockly.VerticalFlyout.prototype.reflowInternal_ = function(blocks) {
        //this.workspace_.scale = this.targetWorkspace_.scale;
        var flyoutWidth = 0;
        for (var i = 0, block; block = blocks[i]; i++) {
          flyoutWidth = Math.max(flyoutWidth, block.getHeightWidth().width);
        }
        flyoutWidth += this.MARGIN * 1.5;
        flyoutWidth *= this.workspace_.scale;
        flyoutWidth += Blockly.Scrollbar.scrollbarThickness;
        if(flyoutWidth < 150){
          flyoutWidth = 150;
        }
        if (this.getWidth() !== flyoutWidth) {
          this.width_ = flyoutWidth;
          if (this.parentToolbox_) {
            this.parentToolbox_.width = flyoutWidth + 97 * this.workspace_.scale;
          }
          this._changeSize = true;
        }
       
      }

      Blockly.VerticalFlyout.prototype.getWidth = function() {
        return this.width_  || this.DEFAULT_WIDTH;
      };

      Blockly.WorkspaceSvg.getTopLevelWorkspaceMetrics_ = function() {
        var toolboxDimensions;
        if (this?.getFlyout()?.autoClose) {
          if(this.toolbox_){
            toolboxDimensions = this.toolbox_.getClientRect();
          }
          if(!toolboxDimensions){
            toolboxDimensions = Blockly.WorkspaceSvg.getDimensionsPx_(this.toolbox_);
          }
        } else {
          toolboxDimensions = Blockly.WorkspaceSvg.getDimensionsPx_(this.toolbox_);
        }
            
        var flyoutDimensions =
            Blockly.WorkspaceSvg.getDimensionsPx_(this.flyout_);
      
        // Contains height and width in CSS pixels.
        // svgSize is equivalent to the size of the injectionDiv at this point.
        var svgSize = Blockly.svgSize(this.getParentSvg());
        if (this.toolbox_) {
          if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP ||
              this.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
            svgSize.height -= toolboxDimensions.height;
          } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT ||
              this.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
            svgSize.width -= toolboxDimensions.width;
          }
        }
      
        // svgSize is now the space taken up by the Blockly workspace, not including
        // the toolbox.
        var contentDimensions =
            Blockly.WorkspaceSvg.getContentDimensions_(this, svgSize);
      
        var absoluteLeft = 0;
        if (this.toolbox_ && this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
          absoluteLeft = toolboxDimensions.width;
        }
        var absoluteTop = 0;
        if (this.toolbox_ && this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
          absoluteTop = toolboxDimensions.height;
        }
      
        var metrics = {
          contentHeight: contentDimensions.height,
          contentWidth: contentDimensions.width,
          contentTop: contentDimensions.top,
          contentLeft: contentDimensions.left,
      
          viewHeight: svgSize.height,
          viewWidth: svgSize.width,
          viewTop: -this.scrollY,   // Must be in pixels, somehow.
          viewLeft: -this.scrollX,  // Must be in pixels, somehow.
      
          absoluteTop: absoluteTop,
          absoluteLeft: absoluteLeft,
      
          toolboxWidth: toolboxDimensions.width,
          toolboxHeight: toolboxDimensions.height,
      
          flyoutWidth: flyoutDimensions.width,
          flyoutHeight: flyoutDimensions.height,
      
          toolboxPosition: this.toolboxPosition
        };
        return metrics;
      };
      
    


      



      
}
