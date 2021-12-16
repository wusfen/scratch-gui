/* eslint-disable */
window.MODE = (new URL(location)).searchParams.get('mode');

export default function (Blockly, vm){

    // 教师模拟下过滤名字
    const getVariablesOfType = function (workspace, type){
        const variable_list = workspace.getVariablesOfType(type);
        if (window.MODE !== 'teacher'){
            return variable_list.filter(variable => {
                const text = variable.name;
                return !(text.indexOf('#') === 0 && text.length - 1 === text.indexOf('*'));
            });
        }
        return variable_list;
    };
    
    const needHide_ = function(xmlNode){
        if (!xmlNode.getElementsByTagName){
            return false;
        }
        if(xmlNode.getAttribute && xmlNode.getAttribute("type") === 'control_block_hide'){
            return true;
        }
        const fields = xmlNode.getElementsByTagName('field');
        const fieldCount = fields.length;
        if (fieldCount > 0){
            for (let j = 0; j < fieldCount; j++){
                const field = fields[j];
                const name = field.getAttribute('name');
                if (name === 'VARIABLE'|| name === 'BROADCAST_OPTION' || name === 'LIST'){
                    const name = field.innerHTML;
                    if (name.indexOf('#') === 0 && name.length - 1 === name.indexOf('*')){
                        return true;
                    }
                }
            }
        }
        const childCount = xmlNode.childNodes.length;
        for (let i = 0; i < childCount; i++){
            if (needHide_(xmlNode.childNodes[i])){
                return true;
            }
        }
        return false; 
    }

    // 判断模块是否需要隐藏
    const needHide = function (xmlNode){
        if (window.MODE === 'teacher'){
            return false;
        }
        if (!xmlNode.getElementsByTagName){
            return false;
        }
        const html = xmlNode.innerHTML;
        //自定义积木
        let start = html.indexOf("proccode=\"");
        if(- 1 !== start){
            start += 10;
            const end = html.indexOf("\"", start);
            const name = html.substring(start, end);
            if (name.indexOf('#') === 0 && -1 !== name.indexOf('*')){
                return true;
            }
        }
        return needHide_(xmlNode);
        
      
    };

    const orgDataCategory = Blockly.DataCategory;

    Blockly.DataCategory = function (workspace) {
        let variableModelList = getVariablesOfType(workspace, '');
        variableModelList.sort(Blockly.VariableModel.compareByName);
        const xmlList = [];
      
        orgDataCategory.addCreateButton(xmlList, workspace, 'VARIABLE');
      
        for (var i = 0; i < variableModelList.length; i++) {
            orgDataCategory.addDataVariable(xmlList, variableModelList[i]);
        }
      
        if (variableModelList.length > 0) {
            xmlList[xmlList.length - 1].setAttribute('gap', 24);
            var firstVariable = variableModelList[0];
      
            orgDataCategory.addSetVariableTo(xmlList, firstVariable);
            orgDataCategory.addChangeVariableBy(xmlList, firstVariable);
            orgDataCategory.addShowVariable(xmlList, firstVariable);
            orgDataCategory.addHideVariable(xmlList, firstVariable);
        }
      
        // Now add list variables to the flyout
        orgDataCategory.addCreateButton(xmlList, workspace, 'LIST');
        variableModelList = getVariablesOfType(workspace, Blockly.LIST_VARIABLE_TYPE);
        variableModelList.sort(Blockly.VariableModel.compareByName);
        for (var i = 0; i < variableModelList.length; i++) {
            orgDataCategory.addDataList(xmlList, variableModelList[i]);
        }
      
        if (variableModelList.length > 0) {
            xmlList[xmlList.length - 1].setAttribute('gap', 24);
            var firstVariable = variableModelList[0];
      
            orgDataCategory.addAddToList(xmlList, firstVariable);
            orgDataCategory.addSep(xmlList);
            orgDataCategory.addDeleteOfList(xmlList, firstVariable);
            orgDataCategory.addDeleteAllOfList(xmlList, firstVariable);
            orgDataCategory.addInsertAtList(xmlList, firstVariable);
            orgDataCategory.addReplaceItemOfList(xmlList, firstVariable);
            orgDataCategory.addSep(xmlList);
            orgDataCategory.addItemOfList(xmlList, firstVariable);
            orgDataCategory.addItemNumberOfList(xmlList, firstVariable);
            orgDataCategory.addLengthOfList(xmlList, firstVariable);
            orgDataCategory.addListContainsItem(xmlList, firstVariable);
            orgDataCategory.addSep(xmlList);
            orgDataCategory.addShowList(xmlList, firstVariable);
            orgDataCategory.addHideList(xmlList, firstVariable);
        }
      
        return xmlList;
    };

    
    for (const key of Object.keys(orgDataCategory)){
        Blockly.DataCategory[key] = orgDataCategory[key];
    }

    Blockly.FieldVariable.dropdownCreate = function () {
        if (!this.variable_) {
            throw new Error('Tried to call dropdownCreate on a variable field with no' +
              ' variable selected.');
        }
        var variableModelList = [];
        const name = this.getText();
        let workspace = null;
        if (this.sourceBlock_) {
            workspace = this.sourceBlock_.workspace;
        }
        if (workspace) {
            const variableTypes = this.getVariableTypes_();
            var variableModelList = [];
            // Get a copy of the list, so that adding rename and new variable options
            // doesn't modify the workspace's list.
            for (var i = 0; i < variableTypes.length; i++) {
                const variableType = variableTypes[i];
                const variables = getVariablesOfType(workspace, variableType);
                variableModelList = variableModelList.concat(variables);
      
                const potentialVarMap = workspace.getPotentialVariableMap();
                if (potentialVarMap) {
                    const potentialVars = potentialVarMap.getVariablesOfType(variableType);
                    variableModelList = variableModelList.concat(potentialVars);
                }
            }
        }
        variableModelList.sort(Blockly.VariableModel.compareByName);
      
        const options = [];
        for (var i = 0; i < variableModelList.length; i++) {
            // Set the uuid as the internal representation of the variable.
            options[i] = [variableModelList[i].name, variableModelList[i].getId()];
        }
        if (this.defaultType_ == Blockly.BROADCAST_MESSAGE_VARIABLE_TYPE) {
            options.unshift(
                [Blockly.Msg.NEW_BROADCAST_MESSAGE, Blockly.NEW_BROADCAST_MESSAGE_ID]);
        } else {
            // Scalar variables and lists have the same backing action, but the option
            // text is different.
            if (this.defaultType_ == Blockly.LIST_VARIABLE_TYPE) {
                var renameText = Blockly.Msg.RENAME_LIST;
                var deleteText = Blockly.Msg.DELETE_LIST;
            } else {
                var renameText = Blockly.Msg.RENAME_VARIABLE;
                var deleteText = Blockly.Msg.DELETE_VARIABLE;
            }
            options.push([renameText, Blockly.RENAME_VARIABLE_ID]);
            if (deleteText) {
                options.push(
                    [
                        deleteText.replace('%1', name),
                        Blockly.DELETE_VARIABLE_ID
                    ]);
            }
        }
      
        return options;
    };

    Blockly.Xml.domToBlock = function (xmlBlock, workspace) {
        if (xmlBlock instanceof Blockly.Workspace) {
            const swap = xmlBlock;
            xmlBlock = workspace;
            workspace = swap;
            console.warn('Deprecated call to Blockly.Xml.domToBlock, ' +
                       'swap the arguments.');
        }
        // Create top-level block.
        Blockly.Events.disable();
        const variablesBeforeCreation = workspace.getAllVariables();
        try {
            const hide = needHide(xmlBlock);
            var topBlock = Blockly.Xml.domToBlockHeadless_(xmlBlock, workspace, hide);
            // Generate list of all blocks.
            const blocks = topBlock.getDescendants(false);
            if (workspace.rendered) {
            // Hide connections to speed up assembly.
                topBlock.setConnectionsHidden(true);
                // Render each block.
                for (var i = blocks.length - 1; i >= 0; i--) {
                    blocks[i].initSvg(hide);
                }
                if(!hide){
                    for (var i = blocks.length - 1; i >= 0; i--) {
                        blocks[i].render(false);
                    }
                }
                
                // Populating the connection database may be deferred until after the
                // blocks have rendered.
                if (!workspace.isFlyout) {
                    setTimeout(() => {
                        if (topBlock.workspace) { // Check that the block hasn't been deleted.
                            topBlock.setConnectionsHidden(false);
                        }
                    }, 1);
                }
                topBlock.updateDisabled();
                // Allow the scrollbars to resize and move based on the new contents.
                // TODO(@picklesrus): #387. Remove when domToBlock avoids resizing.
                workspace.resizeContents();
            } else {
                for (var i = blocks.length - 1; i >= 0; i--) {
                    blocks[i].initModel();
                }
            }
        } finally {
            Blockly.Events.enable();
        }
        if (Blockly.Events.isEnabled()) {
            const newVariables = Blockly.Variables.getAddedVariables(workspace,
                variablesBeforeCreation);
            // Fire a VarCreate event for each (if any) new variable created.
            for (var i = 0; i < newVariables.length; i++) {
                const thisVariable = newVariables[i];
                Blockly.Events.fire(new Blockly.Events.VarCreate(thisVariable));
            }
            // Block events come after var events, in case they refer to newly created
            // variables.
            Blockly.Events.fire(new Blockly.Events.BlockCreate(topBlock));
        }
        return topBlock;
    };


    Blockly.BlockSvg.prototype.initSvg = function (needHide) {
        // goog.asserts.assert(this.workspace.rendered, 'Workspace is headless.');
        if (!this.isInsertionMarker()) { // Insertion markers not allowed to have inputs or icons
            // Input shapes are empty holes drawn when a value input is not connected.
            for (var i = 0, input; input = this.inputList[i]; i++) {
                input.init();
                input.initOutlinePath(this.svgGroup_);
            }
            const icons = this.getIcons();
            for (i = 0; i < icons.length; i++) {
                icons[i].createIcon();
            }
        }
        this.updateColour();
        this.updateMovable();
        if (!this.workspace.options.readOnly && !this.eventsInit_) {
            Blockly.bindEventWithChecks_(
                this.getSvgRoot(), 'mousedown', this, this.onMouseDown_);
        }
        this.eventsInit_ = true;
        if (needHide){
            return;
        }
        if (!this.getSvgRoot().parentNode) {
            this.workspace.getCanvas().appendChild(this.getSvgRoot());
        }
    };

    Blockly.BlockSvg.prototype.bringToFront = function() {
        var block = this;
        do {
          var root = block.getSvgRoot();
          if(!root.parentNode){
             return;
          }
          root.parentNode.appendChild(root);
          block = block.getParent();
        } while (block);
    };

    const orgIsConnectionAllowed = Blockly.Connection.prototype.isConnectionAllowed;
    Blockly.Connection.prototype.isConnectionAllowed = function(candidate) {
        if (!candidate.sourceBlock_.rendered) {
            return false;
        }
        return orgIsConnectionAllowed.apply(this, arguments);
    };

    const orgToJSON = vm.toJSON.bind(vm);
    // 保存toolbox配置
    vm.toJSON = function (){
        let prj = orgToJSON();
        if (window.vcode_toolbox){
            prj = `${prj.substr(0, prj.length - 1)}, "toolbox":${JSON.stringify(window.vcode_toolbox)}}`;
        }
        return prj;
    };
    // 读取toolbox配置
    const orgDeserializeProject = vm.deserializeProject.bind(vm);

    vm.deserializeProject = function (projectJSON, zip) {
        window.vcode_toolbox = projectJSON.toolbox;
        // window.vcode_toolbox = {"%{BKY_CATEGORY_MOTION}":{},"%{BKY_CATEGORY_LOOKS}":{"looks_switchbackdropto":true, "looks_switchbackdroptoandwait":true, "looks_nextbackdrop":true,"looks_changeeffectby":true}};
        return orgDeserializeProject(projectJSON, zip);
    };

    Blockly.WorkspaceSvg.prototype.updateToolbox = function (tree) {
        tree = Blockly.Options.parseToolboxTree(tree);
        if (!tree) {
            if (this.options.languageTree) {
                throw 'Can\'t nullify an existing toolbox.';
            }
            return; // No change (null to null).
        }
        if (!this.options.languageTree) {
            throw 'Existing toolbox is null.  Can\'t create new toolbox.';
        }
        const categories = tree.getElementsByTagName('category');
        const length = categories.length;
        const teacherMode = window.MODE === 'teacher';
        if (window.vcode_toolbox){
            for (let i = categories.length - 1; i >= 0; i--){
                const category = categories[i];
                const categoryName = category.getAttribute('name');
                const had = window.vcode_toolbox[categoryName];
                if(had && (categoryName === '%{BKY_CATEGORY_MYBLOCKS}' || categoryName === '%{BKY_CATEGORY_VARIABLES}')){
                    continue;
                }else if (!had || had.length == 0){
                    if (!teacherMode){
                        tree.removeChild(category);
                    } else {
                        var blocks = category.getElementsByTagName('block');
                        for (var j = blocks.length - 1; j >= 0; j--){
                            blocks[j].setAttribute('opacity', '0.5');
                        }
                    }
                } else {
                    var blocks = category.getElementsByTagName('block');
                    let remove = true;
                    for (var j = blocks.length - 1; j >= 0; j--){
                        const block = blocks[j];
                        if (!had[block.getAttribute('type')]){
                            teacherMode ? block.setAttribute('opacity', '0.5') : category.removeChild(block);
                        } else {
                            remove = false;
                        }
                    }
                    if (remove){
                        if (!teacherMode){
                            tree.removeChild(category);
                        } else {
                            var blocks = category.getElementsByTagName('block');
                            for (var j = blocks.length - 1; j >= 0; j--){
                                blocks[j].setAttribute('opacity', '0.5');
                            }
                        }
                    }
                }
            }
        }
        if (length) {
            if (!this.toolbox_) {
                throw 'Existing toolbox has no categories.  Can\'t change mode.';
            }
            this.options.languageTree = tree;
            this.toolbox_.populate_(tree);
            this.toolbox_.position();
        } else {
            if (!this.flyout_) {
                throw 'Existing toolbox has categories.  Can\'t change mode.';
            }
            this.options.languageTree = tree;
            this.flyout_.show(tree.childNodes);
        }
    };

    Blockly.Xml.domToBlockHeadless_ = function (xmlBlock, workspace, hide) {
        let block = null;
        const prototypeName = xmlBlock.getAttribute('type');
        // goog.asserts.assert(
        //     prototypeName, 'Block type unspecified: %s', xmlBlock.outerHTML);
        const id = xmlBlock.getAttribute('id');
        block = workspace.newBlock(prototypeName, id);
      
        let blockChild = null;
        for (var i = 0, xmlChild; xmlChild = xmlBlock.childNodes[i]; i++) {
            if (xmlChild.nodeType == 3) {
            // Ignore any text at the <block> level.  It's all whitespace anyway.
                continue;
            }
            var input;
      
            // Find any enclosed blocks or shadows in this tag.
            let childBlockElement = null;
            let childShadowElement = null;
            for (var j = 0, grandchild; grandchild = xmlChild.childNodes[j]; j++) {
                if (grandchild.nodeType == 1) {
                    if (grandchild.nodeName.toLowerCase() == 'block') {
                        childBlockElement = /** @type {!Element} */ (grandchild);
                    } else if (grandchild.nodeName.toLowerCase() == 'shadow') {
                        childShadowElement = /** @type {!Element} */ (grandchild);
                    }
                }
            }
            // Use the shadow block if there is no child block.
            if (!childBlockElement && childShadowElement) {
                childBlockElement = childShadowElement;
            }
      
            const name = xmlChild.getAttribute('name');
            switch (xmlChild.nodeName.toLowerCase()) {
            case 'mutation':
                // Custom data for an advanced block.
                if (block.domToMutation) {
                    block.domToMutation(xmlChild);
                    if (block.initSvg) {
                        // Mutation may have added some elements that need initializing.
                        block.initSvg(hide);
                    }
                }
                break;
            case 'comment':
                var commentId = xmlChild.getAttribute('id');
                var bubbleX = parseInt(xmlChild.getAttribute('x'), 10);
                var bubbleY = parseInt(xmlChild.getAttribute('y'), 10);
                var minimized = xmlChild.getAttribute('minimized') || false;
      
                // Note bubbleX and bubbleY can be NaN, but the ScratchBlockComment
                // constructor will handle that.
                block.setCommentText(xmlChild.textContent, commentId, bubbleX, bubbleY,
                    minimized == 'true');
      
                var visible = xmlChild.getAttribute('pinned');
                if (visible && !block.isInFlyout) {
                // Give the renderer a millisecond to render and position the block
                // before positioning the comment bubble.
                    setTimeout(() => {
                        if (block.comment && block.comment.setVisible) {
                            block.comment.setVisible(!hide && visible == 'true');
                        }
                    }, 1);
                }
                var bubbleW = parseInt(xmlChild.getAttribute('w'), 10);
                var bubbleH = parseInt(xmlChild.getAttribute('h'), 10);
                if (!isNaN(bubbleW) && !isNaN(bubbleH) &&
                  block.comment && block.comment.setVisible) {
                    if (block.comment instanceof Blockly.ScratchBlockComment) {
                        block.comment.setSize(bubbleW, bubbleH);
                    } else {
                        block.comment.setBubbleSize(bubbleW, bubbleH);
                    }
                }
                break;
            case 'data':
                block.data = xmlChild.textContent;
                break;
            case 'title':
                // Titles were renamed to field in December 2013.
                // Fall through.
            case 'field':
                Blockly.Xml.domToField_(block, name, xmlChild);
                break;
            case 'value':
            case 'statement':
                input = block.getInput(name);
                if (!input) {
                    console.warn(`Ignoring non-existent input ${name} in block ${
                        prototypeName}`);
                    break;
                }
                if (childShadowElement) {
                    input.connection.setShadowDom(childShadowElement);
                }
                if (childBlockElement) {
                    blockChild = Blockly.Xml.domToBlockHeadless_(childBlockElement,
                        workspace);
                    if (blockChild.outputConnection) {
                        input.connection.connect(blockChild.outputConnection);
                    } else if (blockChild.previousConnection) {
                        input.connection.connect(blockChild.previousConnection);
                    } else {
                        // goog.asserts.fail(
                        //     'Child block does not have output or previous statement.');
                    }
                }
                break;
            case 'next':
                if (childShadowElement && block.nextConnection) {
                    block.nextConnection.setShadowDom(childShadowElement);
                }
                if (childBlockElement && block.nextConnection) {
                // goog.asserts.assert(block.nextConnection,
                //     'Next statement does not exist.');
                // // If there is more than one XML 'next' tag.
                // goog.asserts.assert(!block.nextConnection.isConnected(),
                //     'Next statement is already connected.');
                    blockChild = Blockly.Xml.domToBlockHeadless_(childBlockElement,
                        workspace);
                    // goog.asserts.assert(blockChild.previousConnection,
                    //     'Next block does not have previous statement.');
                    block.nextConnection.connect(blockChild.previousConnection);
                }
                break;
            default:
                // Unknown tag; ignore.  Same principle as HTML parsers.
                console.warn(`Ignoring unknown tag: ${xmlChild.nodeName}`);
            }
        }
      
        const inline = xmlBlock.getAttribute('inline');
        if (inline) {
            block.setInputsInline(inline == 'true');
        }
        const disabled = xmlBlock.getAttribute('disabled');
        if (disabled) {
            block.setDisabled(disabled == 'true' || disabled == 'disabled');
        }
        const deletable = xmlBlock.getAttribute('deletable');
        if (deletable) {
            block.setDeletable(deletable == 'true');
        }
        const movable = xmlBlock.getAttribute('movable');
        if (movable) {
            block.setMovable(movable == 'true');
        }
        const editable = xmlBlock.getAttribute('editable');
        if (editable) {
            block.setEditable(editable == 'true');
        }
        const collapsed = xmlBlock.getAttribute('collapsed');
        if (collapsed) {
            block.setCollapsed(collapsed == 'true');
        }
        const opacity = xmlBlock.getAttribute('opacity');
        if (opacity) {
            block.setOpacity(opacity);
        }
        if (xmlBlock.nodeName.toLowerCase() == 'shadow') {
            // Ensure all children are also shadows.
            const children = block.getChildren(false);
            for (var i = 0, child; child = children[i]; i++) {
                // goog.asserts.assert(
                //     child.isShadow(), 'Shadow block not allowed non-shadow child.');
            }
            block.setShadow(true);
        }
        return block;
    };


    Blockly.Variables.createVariable = function(workspace, opt_callback, opt_type) {
        // Decide on a modal message based on the opt_type. If opt_type was not
        // provided, default to the original message for scalar variables.
        var newMsg, modalTitle;
        if (opt_type == Blockly.BROADCAST_MESSAGE_VARIABLE_TYPE) {
          newMsg = Blockly.Msg.NEW_BROADCAST_MESSAGE_TITLE;
          modalTitle = Blockly.Msg.BROADCAST_MODAL_TITLE;
        } else if (opt_type == Blockly.LIST_VARIABLE_TYPE) {
          newMsg = Blockly.Msg.NEW_LIST_TITLE;
          modalTitle = Blockly.Msg.LIST_MODAL_TITLE;
        } else {
          // Note: this case covers 1) scalar variables, 2) any new type of
          // variable not explicitly checked for above, and 3) a null or undefined
          // opt_type -- turns a falsey opt_type into ''
          // TODO (#1251) Warn developers that they didn't provide an opt_type/provided
          // a falsey opt_type
          opt_type = opt_type ? opt_type : '';
          newMsg = Blockly.Msg.NEW_VARIABLE_TITLE;
          modalTitle = Blockly.Msg.VARIABLE_MODAL_TITLE;
        }
        var validate = Blockly.Variables.nameValidator_.bind(null, opt_type);
      
        // Prompt the user to enter a name for the variable
        Blockly.prompt(newMsg, '',
            function(text, additionalVars, variableOptions) {
              variableOptions = variableOptions || {};
              var scope = variableOptions.scope;
              var isLocal = (scope === 'local') || false;
              var isCloud = variableOptions.isCloud || false;
              // Default to [] if additionalVars is not provided
              additionalVars = additionalVars || [];
              // Only use additionalVars for global variable creation.
              var additionalVarNames = isLocal ? [] : additionalVars;
      
              var validatedText = validate(text, workspace, additionalVarNames, isCloud, opt_callback);
              if (validatedText) {
                // The name is valid according to the type, create the variable
                var potentialVarMap = workspace.getPotentialVariableMap();
                var variable;
                // This check ensures that if a new variable is being created from a
                // workspace that already has a variable of the same name and type as
                // a potential variable, that potential variable gets turned into a
                // real variable and thus there aren't duplicate options in the field_variable
                // dropdown.
                if (potentialVarMap && opt_type) {
                  variable = Blockly.Variables.realizePotentialVar(validatedText,
                      opt_type, workspace, false);
                }
                if (!variable) {
                  variable = workspace.createVariable(validatedText, opt_type, null, isLocal, isCloud);
                }
      
                var flyout = workspace.isFlyout ? workspace : workspace.getFlyout();
                var variableBlockId = variable.getId();
                var hide = validatedText.indexOf('#') === 0 && validatedText.length - 1 === validatedText.indexOf('*');
                if (flyout.setCheckboxState) {
                    flyout.setCheckboxState(variableBlockId, !hide);
                }
      
                if (opt_callback) {
                    if(window.MODE === 'teacher' || !hide){
                        opt_callback(variableBlockId);
                    }
                }
              } else {
                // User canceled prompt without a value.
                if (opt_callback) {
                  opt_callback(null);
                }
              }
            }, modalTitle, opt_type);
      };

    //广播默认值
    Blockly.FieldVariable.prototype.initFlyoutBroadcast_ = function(workspace) {
        // Using shorter name for this constant
        var broadcastMsgType = Blockly.BROADCAST_MESSAGE_VARIABLE_TYPE;
        var broadcastVars = getVariablesOfType(workspace, broadcastMsgType);
        if(workspace.isFlyout && this.defaultType_ == broadcastMsgType &&
            broadcastVars.length != 0) {
          broadcastVars.sort(Blockly.VariableModel.compareByName);
          return broadcastVars[0];
        }
    };

    
}
