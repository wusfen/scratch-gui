import ScratchBlocks from 'scratch-blocks';

window.MODE = (new URL(location)).searchParams.get('mode');

/**
 * Connect scratch blocks with the vm
 * @param {VirtualMachine} vm - The scratch vm
 * @return {ScratchBlocks} ScratchBlocks connected with the vm
 */
export default function (vm) {

    //教师模拟下过滤名字
    const getVariablesOfType = function(workspace, type){
        var variable_list = workspace.getVariablesOfType(type);
        if(window.MODE !== 'teacher'){
            return variable_list.filter(function(variable){
                var text = variable.name;
                return !(0 === text.indexOf('#') && text.length - 1 === text.indexOf('*'));
              });
        }
        return variable_list;
    }

    //判断模块是否需要隐藏
    const needHide = function(xmlNode){
        if(window.MODE === 'teacher'){
            return false;
        }
        if(!xmlNode.getElementsByTagName){
            return false;
        }
        var fields = xmlNode.getElementsByTagName("field");
        var fieldCount = fields.length;
        if(fieldCount > 0){
            for(var j = 0; j < fieldCount; j++){
                var field = fields[j];
                if(field.getAttribute('name') === 'VARIABLE'){
                    var name = field.innerHTML;
                    if(0 == name.indexOf('#') && name.length - 1 == name.indexOf('*')){
                        return true;
                    }
                }
            }
        }else{
            var childCount = xmlNode.childNodes.length;
            for(var i = 0; i < childCount; i++){
                if(needHide(xmlNode.childNodes[i])){
                    return true;
                }
            }
        }
        return false;
        
    }


    const jsonForMenuBlock = function (name, menuOptionsFn, colors, start) {
        return {
            message0: '%1',
            args0: [
                {
                    type: 'field_dropdown',
                    name: name,
                    options: function () {
                        return start.concat(menuOptionsFn());
                    }
                }
            ],
            inputsInline: true,
            output: 'String',
            colour: colors.secondary,
            colourSecondary: colors.secondary,
            colourTertiary: colors.tertiary,
            outputShape: ScratchBlocks.OUTPUT_SHAPE_ROUND
        };
    };

    const jsonForHatBlockMenu = function (hatName, name, menuOptionsFn, colors, start) {
        return {
            message0: hatName,
            args0: [
                {
                    type: 'field_dropdown',
                    name: name,
                    options: function () {
                        return start.concat(menuOptionsFn());
                    }
                }
            ],
            colour: colors.primary,
            colourSecondary: colors.secondary,
            colourTertiary: colors.tertiary,
            extensions: ['shape_hat']
        };
    };


    const jsonForSensingMenus = function (menuOptionsFn) {
        return {
            message0: ScratchBlocks.Msg.SENSING_OF,
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'PROPERTY',
                    options: function () {
                        return menuOptionsFn();
                    }

                },
                {
                    type: 'input_value',
                    name: 'OBJECT'
                }
            ],
            output: true,
            colour: ScratchBlocks.Colours.sensing.primary,
            colourSecondary: ScratchBlocks.Colours.sensing.secondary,
            colourTertiary: ScratchBlocks.Colours.sensing.tertiary,
            outputShape: ScratchBlocks.OUTPUT_SHAPE_ROUND
        };
    };

    const soundsMenu = function () {
        let menu = [['', '']];
        if (vm.editingTarget && vm.editingTarget.sprite.sounds.length > 0) {
            menu = vm.editingTarget.sprite.sounds.map(sound => [sound.name, sound.name]);
        }
        // menu.push([
        //     ScratchBlocks.ScratchMsgs.translate('SOUND_RECORD', 'record...'),
        //     ScratchBlocks.recordSoundCallback
        // ]);
        menu.push([
            '+ 编辑',
            function () {
                document.querySelector('[role="tablist"]').children[2].click();
            }
        ]);
        return menu;
    };

    const costumesMenu = function () {
        if (vm.editingTarget && vm.editingTarget.getCostumes().length > 0) {
            return vm.editingTarget.getCostumes().map(costume => [costume.name, costume.name]);
        }
        return [['', '']];
    };

    const backdropsMenu = function () {
        const next = ScratchBlocks.ScratchMsgs.translate('LOOKS_NEXTBACKDROP', 'next backdrop');
        const previous = ScratchBlocks.ScratchMsgs.translate('LOOKS_PREVIOUSBACKDROP', 'previous backdrop');
        const random = ScratchBlocks.ScratchMsgs.translate('LOOKS_RANDOMBACKDROP', 'random backdrop');
        if (vm.runtime.targets[0] && vm.runtime.targets[0].getCostumes().length > 0) {
            return vm.runtime.targets[0].getCostumes().map(costume => [costume.name, costume.name])
                .concat([[next, 'next backdrop'],
                    [previous, 'previous backdrop'],
                    [random, 'random backdrop']]);
        }
        return [['', '']];
    };

    const backdropNamesMenu = function () {
        const stage = vm.runtime.getTargetForStage();
        if (stage && stage.getCostumes().length > 0) {
            return stage.getCostumes().map(costume => [costume.name, costume.name]);
        }
        return [['', '']];
    };

    const spriteMenu = function () {
        const sprites = [];
        for (const targetId in vm.runtime.targets) {
            if (!vm.runtime.targets.hasOwnProperty(targetId)) continue;
            if (vm.runtime.targets[targetId].isOriginal) {
                if (!vm.runtime.targets[targetId].isStage) {
                    if (vm.runtime.targets[targetId] === vm.editingTarget) {
                        continue;
                    }
                    sprites.push([vm.runtime.targets[targetId].sprite.name, vm.runtime.targets[targetId].sprite.name]);
                }
            }
        }
        return sprites;
    };

    const cloneMenu = function () {
        if (vm.editingTarget && vm.editingTarget.isStage) {
            const menu = spriteMenu();
            if (menu.length === 0) {
                return [['', '']]; // Empty menu matches Scratch 2 behavior
            }
            return menu;
        }
        const myself = ScratchBlocks.ScratchMsgs.translate('CONTROL_CREATECLONEOF_MYSELF', 'myself');
        return [[myself, '_myself_']].concat(spriteMenu());
    };

    const soundColors = ScratchBlocks.Colours.sounds;

    const looksColors = ScratchBlocks.Colours.looks;

    const motionColors = ScratchBlocks.Colours.motion;

    const sensingColors = ScratchBlocks.Colours.sensing;

    const controlColors = ScratchBlocks.Colours.control;

    const eventColors = ScratchBlocks.Colours.event;

    ScratchBlocks.Blocks.sound_sounds_menu.init = function () {
        const json = jsonForMenuBlock('SOUND_MENU', soundsMenu, soundColors, []);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.looks_costume.init = function () {
        const json = jsonForMenuBlock('COSTUME', costumesMenu, looksColors, []);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.looks_backdrops.init = function () {
        const json = jsonForMenuBlock('BACKDROP', backdropsMenu, looksColors, []);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.event_whenbackdropswitchesto.init = function () {
        const json = jsonForHatBlockMenu(
            ScratchBlocks.Msg.EVENT_WHENBACKDROPSWITCHESTO,
            'BACKDROP', backdropNamesMenu, eventColors, []);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.motion_pointtowards_menu.init = function () {
        const mouse = ScratchBlocks.ScratchMsgs.translate('MOTION_POINTTOWARDS_POINTER', 'mouse-pointer');
        const json = jsonForMenuBlock('TOWARDS', spriteMenu, motionColors, [
            [mouse, '_mouse_']
        ]);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.motion_goto_menu.init = function () {
        const random = ScratchBlocks.ScratchMsgs.translate('MOTION_GOTO_RANDOM', 'random position');
        const mouse = ScratchBlocks.ScratchMsgs.translate('MOTION_GOTO_POINTER', 'mouse-pointer');
        const json = jsonForMenuBlock('TO', spriteMenu, motionColors, [
            [random, '_random_'],
            [mouse, '_mouse_']
        ]);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.motion_glideto_menu.init = function () {
        const random = ScratchBlocks.ScratchMsgs.translate('MOTION_GLIDETO_RANDOM', 'random position');
        const mouse = ScratchBlocks.ScratchMsgs.translate('MOTION_GLIDETO_POINTER', 'mouse-pointer');
        const json = jsonForMenuBlock('TO', spriteMenu, motionColors, [
            [random, '_random_'],
            [mouse, '_mouse_']
        ]);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.sensing_of_object_menu.init = function () {
        const stage = ScratchBlocks.ScratchMsgs.translate('SENSING_OF_STAGE', 'Stage');
        const json = jsonForMenuBlock('OBJECT', spriteMenu, sensingColors, [
            [stage, '_stage_']
        ]);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.sensing_of.init = function () {
        const blockId = this.id;
        const blockType = this.type;

        // Get the sensing_of block from vm.
        let defaultSensingOfBlock;
        const blocks = vm.runtime.flyoutBlocks._blocks;
        Object.keys(blocks).forEach(id => {
            const block = blocks[id];
            if (id === blockType || (block && block.opcode === blockType)) {
                defaultSensingOfBlock = block;
            }
        });

        // Function that fills in menu for the first input in the sensing block.
        // Called every time it opens since it depends on the values in the other block input.
        const menuFn = function () {
            const stageOptions = [
                [ScratchBlocks.Msg.SENSING_OF_BACKDROPNUMBER, 'backdrop #'],
                [ScratchBlocks.Msg.SENSING_OF_BACKDROPNAME, 'backdrop name'],
                [ScratchBlocks.Msg.SENSING_OF_VOLUME, 'volume']
            ];
            const spriteOptions = [
                [ScratchBlocks.Msg.SENSING_OF_XPOSITION, 'x position'],
                [ScratchBlocks.Msg.SENSING_OF_YPOSITION, 'y position'],
                [ScratchBlocks.Msg.SENSING_OF_DIRECTION, 'direction'],
                [ScratchBlocks.Msg.SENSING_OF_COSTUMENUMBER, 'costume #'],
                [ScratchBlocks.Msg.SENSING_OF_COSTUMENAME, 'costume name'],
                [ScratchBlocks.Msg.SENSING_OF_SIZE, 'size'],
                [ScratchBlocks.Msg.SENSING_OF_VOLUME, 'volume']
            ];
            if (vm.editingTarget) {
                let lookupBlocks = vm.editingTarget.blocks;
                let sensingOfBlock = lookupBlocks.getBlock(blockId);

                // The block doesn't exist, but should be in the flyout. Look there.
                if (!sensingOfBlock) {
                    sensingOfBlock = vm.runtime.flyoutBlocks.getBlock(blockId) || defaultSensingOfBlock;
                    // If we still don't have a block, just return an empty list . This happens during
                    // scratch blocks construction.
                    if (!sensingOfBlock) {
                        return [['', '']];
                    }
                    // The block was in the flyout so look up future block info there.
                    lookupBlocks = vm.runtime.flyoutBlocks;
                }
                const sort = function (options) {
                    options.sort(ScratchBlocks.scratchBlocksUtils.compareStrings);
                };
                // Get all the stage variables (no lists) so we can add them to menu when the stage is selected.
                const stageVariableOptions = vm.runtime.getTargetForStage().getAllVariableNamesInScopeByType('');
                sort(stageVariableOptions);
                const stageVariableMenuItems = stageVariableOptions.map(variable => [variable, variable]);
                if (sensingOfBlock.inputs.OBJECT.shadow !== sensingOfBlock.inputs.OBJECT.block) {
                    // There's a block dropped on top of the menu. It'd be nice to evaluate it and
                    // return the correct list, but that is tricky. Scratch2 just returns stage options
                    // so just do that here too.
                    return stageOptions.concat(stageVariableMenuItems);
                }
                const menuBlock = lookupBlocks.getBlock(sensingOfBlock.inputs.OBJECT.shadow);
                const selectedItem = menuBlock.fields.OBJECT.value;
                if (selectedItem === '_stage_') {
                    return stageOptions.concat(stageVariableMenuItems);
                }
                // Get all the local variables (no lists) and add them to the menu.
                const target = vm.runtime.getSpriteTargetByName(selectedItem);
                let spriteVariableOptions = [];
                // The target should exist, but there are ways for it not to (e.g. #4203).
                if (target) {
                    spriteVariableOptions = target.getAllVariableNamesInScopeByType('', true);
                    sort(spriteVariableOptions);
                }
                const spriteVariableMenuItems = spriteVariableOptions.map(variable => [variable, variable]);
                return spriteOptions.concat(spriteVariableMenuItems);
            }
            return [['', '']];
        };

        const json = jsonForSensingMenus(menuFn);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.sensing_distancetomenu.init = function () {
        const mouse = ScratchBlocks.ScratchMsgs.translate('SENSING_DISTANCETO_POINTER', 'mouse-pointer');
        const json = jsonForMenuBlock('DISTANCETOMENU', spriteMenu, sensingColors, [
            [mouse, '_mouse_']
        ]);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.sensing_touchingobjectmenu.init = function () {
        const mouse = ScratchBlocks.ScratchMsgs.translate('SENSING_TOUCHINGOBJECT_POINTER', 'mouse-pointer');
        const edge = ScratchBlocks.ScratchMsgs.translate('SENSING_TOUCHINGOBJECT_EDGE', 'edge');
        const json = jsonForMenuBlock('TOUCHINGOBJECTMENU', spriteMenu, sensingColors, [
            [mouse, '_mouse_'],
            [edge, '_edge_']
        ]);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.control_create_clone_of_menu.init = function () {
        const json = jsonForMenuBlock('CLONE_OPTION', cloneMenu, controlColors, []);
        this.jsonInit(json);
    };

    ScratchBlocks.VerticalFlyout.getCheckboxState = function (blockId) {
        const monitoredBlock = vm.runtime.monitorBlocks._blocks[blockId];
        return monitoredBlock ? monitoredBlock.isMonitored : false;
    };

    ScratchBlocks.FlyoutExtensionCategoryHeader.getExtensionState = function (extensionId) {
        if (vm.getPeripheralIsConnected(extensionId)) {
            return ScratchBlocks.StatusButtonState.READY;
        }
        return ScratchBlocks.StatusButtonState.NOT_READY;
    };

    ScratchBlocks.FieldNote.playNote_ = function (noteNum, extensionId) {
        vm.runtime.emit('PLAY_NOTE', noteNum, extensionId);
    };

    // Use a collator's compare instead of localeCompare which internally
    // creates a collator. Using this is a lot faster in browsers that create a
    // collator for every localeCompare call.
    const collator = new Intl.Collator([], {
        sensitivity: 'base',
        numeric: true
    });
    ScratchBlocks.scratchBlocksUtils.compareStrings = function (str1, str2) {
        return collator.compare(str1, str2);
    };

    // Blocks wants to know if 3D CSS transforms are supported. The cross
    // section of browsers Scratch supports and browsers that support 3D CSS
    // transforms will make the return always true.
    //
    // Shortcutting to true lets us skip an expensive style recalculation when
    // first loading the Scratch editor.
    ScratchBlocks.utils.is3dSupported = function () {
        return true;
    };

    const orgDataCategory = ScratchBlocks.DataCategory;

    ScratchBlocks.DataCategory = function(workspace) {
        var variableModelList = getVariablesOfType(workspace, '');
        variableModelList.sort(ScratchBlocks.VariableModel.compareByName);
        var xmlList = [];
      
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
        variableModelList = getVariablesOfType(workspace, ScratchBlocks.LIST_VARIABLE_TYPE);
        variableModelList.sort(ScratchBlocks.VariableModel.compareByName);
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

    
    for(var key of Object.keys(orgDataCategory)){
        ScratchBlocks.DataCategory[key] = orgDataCategory[key];
    }

    ScratchBlocks.FieldVariable.dropdownCreate = function() {
        if (!this.variable_) {
          throw new Error('Tried to call dropdownCreate on a variable field with no' +
              ' variable selected.');
        }
        var variableModelList = [];
        var name = this.getText();
        var workspace = null;
        if (this.sourceBlock_) {
          workspace = this.sourceBlock_.workspace;
        }
        if (workspace) {
          var variableTypes = this.getVariableTypes_();
          var variableModelList = [];
          // Get a copy of the list, so that adding rename and new variable options
          // doesn't modify the workspace's list.
          for (var i = 0; i < variableTypes.length; i++) {
            var variableType = variableTypes[i];
            var variables = getVariablesOfType(workspace, variableType);
            variableModelList = variableModelList.concat(variables);
      
            var potentialVarMap = workspace.getPotentialVariableMap();
            if (potentialVarMap) {
              var potentialVars = potentialVarMap.getVariablesOfType(variableType);
              variableModelList = variableModelList.concat(potentialVars);
            }
          }
        }
        variableModelList.sort(ScratchBlocks.VariableModel.compareByName);
      
        var options = [];
        for (var i = 0; i < variableModelList.length; i++) {
          // Set the uuid as the internal representation of the variable.
          options[i] = [variableModelList[i].name, variableModelList[i].getId()];
        }
        if (this.defaultType_ == ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE) {
          options.unshift(
              [ScratchBlocks.Msg.NEW_BROADCAST_MESSAGE, ScratchBlocks.NEW_BROADCAST_MESSAGE_ID]);
        } else {
          // Scalar variables and lists have the same backing action, but the option
          // text is different.
          if (this.defaultType_ == ScratchBlocks.LIST_VARIABLE_TYPE) {
            var renameText = ScratchBlocks.Msg.RENAME_LIST;
            var deleteText = ScratchBlocks.Msg.DELETE_LIST;
          } else {
            var renameText = ScratchBlocks.Msg.RENAME_VARIABLE;
            var deleteText = ScratchBlocks.Msg.DELETE_VARIABLE;
          }
          options.push([renameText, ScratchBlocks.RENAME_VARIABLE_ID]);
          if (deleteText) {
            options.push(
                [
                  deleteText.replace('%1', name),
                  ScratchBlocks.DELETE_VARIABLE_ID
                ]);
          }
        }
      
        return options;
      };

      ScratchBlocks.Xml.domToBlock = function(xmlBlock, workspace) {
        if (xmlBlock instanceof ScratchBlocks.Workspace) {
          var swap = xmlBlock;
          xmlBlock = workspace;
          workspace = swap;
          console.warn('Deprecated call to Blockly.Xml.domToBlock, ' +
                       'swap the arguments.');
        }
        // Create top-level block.
        ScratchBlocks.Events.disable();
        var variablesBeforeCreation = workspace.getAllVariables();
        try {
          var topBlock = ScratchBlocks.Xml.domToBlockHeadless_(xmlBlock, workspace);
          // Generate list of all blocks.
          var blocks = topBlock.getDescendants(false);
          if (workspace.rendered) {
            // Hide connections to speed up assembly.
            topBlock.setConnectionsHidden(true);
            // Render each block.
            var hide = [];
            for (var i = blocks.length - 1; i >= 0; i--) {
                hide[i] = needHide(xmlBlock);
            }
            for (var i = blocks.length - 1; i >= 0; i--) {
                blocks[i].initSvg(hide[i]);
            }
            for (var i = blocks.length - 1; i >= 0; i--) {
                if(!hide[i]){
                    blocks[i].render(false);
                }
            }
            // Populating the connection database may be deferred until after the
            // blocks have rendered.
            if (!workspace.isFlyout) {
              setTimeout(function() {
                if (topBlock.workspace) {  // Check that the block hasn't been deleted.
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
            ScratchBlocks.Events.enable();
        }
        if (ScratchBlocks.Events.isEnabled()) {
          var newVariables = ScratchBlocks.Variables.getAddedVariables(workspace,
              variablesBeforeCreation);
          // Fire a VarCreate event for each (if any) new variable created.
          for (var i = 0; i < newVariables.length; i++) {
            var thisVariable = newVariables[i];
            ScratchBlocks.Events.fire(new ScratchBlocks.Events.VarCreate(thisVariable));
          }
          // Block events come after var events, in case they refer to newly created
          // variables.
          ScratchBlocks.Events.fire(new ScratchBlocks.Events.BlockCreate(topBlock));
        }
        return topBlock;
      };


      ScratchBlocks.BlockSvg.prototype.initSvg = function(needHide) {
        //goog.asserts.assert(this.workspace.rendered, 'Workspace is headless.');
        if (!this.isInsertionMarker()) { // Insertion markers not allowed to have inputs or icons
          // Input shapes are empty holes drawn when a value input is not connected.
          for (var i = 0, input; input = this.inputList[i]; i++) {
            input.init();
            input.initOutlinePath(this.svgGroup_);
          }
          var icons = this.getIcons();
          for (i = 0; i < icons.length; i++) {
            icons[i].createIcon();
          }
        }
        this.updateColour();
        this.updateMovable();
        if (!this.workspace.options.readOnly && !this.eventsInit_) {
            ScratchBlocks.bindEventWithChecks_(
              this.getSvgRoot(), 'mousedown', this, this.onMouseDown_);
        }
        this.eventsInit_ = true;
        if(needHide){
            return;
        }
        if (!this.getSvgRoot().parentNode) {
          this.workspace.getCanvas().appendChild(this.getSvgRoot());
        }
      };

    ScratchBlocks.vcode_toolbox = undefined;

    const orgToJSON = vm.toJSON.bind(vm);
    // 保存toolbox配置
    vm.toJSON = function(){
        var prj = orgToJSON();
        if(ScratchBlocks.vcode_toolbox){
            prj = prj.substr(0, prj.length - 1) + ", \"toolbox\":" + JSON.stringify(ScratchBlocks.vcode_toolbox) + "}";
        }
        return prj;
    }
    //读取toolbox配置
    const orgDeserializeProject = vm.deserializeProject.bind(vm);

    vm.deserializeProject = function(projectJSON, zip) {
        ScratchBlocks.vcode_toolbox = projectJSON.toolbox;
        //ScratchBlocks.vcode_toolbox = {"%{BKY_CATEGORY_MOTION}":{},"%{BKY_CATEGORY_LOOKS}":{"looks_switchbackdropto":true, "looks_switchbackdroptoandwait":true, "looks_nextbackdrop":true,"looks_changeeffectby":true}};
        return orgDeserializeProject(projectJSON, zip)
    }

    ScratchBlocks.WorkspaceSvg.prototype.updateToolbox = function(tree) {
        tree = ScratchBlocks.Options.parseToolboxTree(tree);
        if (!tree) {
          if (this.options.languageTree) {
            throw 'Can\'t nullify an existing toolbox.';
          }
          return;  // No change (null to null).
        }
        if (!this.options.languageTree) {
          throw 'Existing toolbox is null.  Can\'t create new toolbox.';
        }
        var categories = tree.getElementsByTagName('category');
        var teacherMode = window.MODE === 'teacher';
        if(ScratchBlocks.vcode_toolbox && !teacherMode){
            for(var i = categories.length - 1; i >= 0; i--){
                var category = categories[i];
                var had = ScratchBlocks.vcode_toolbox[category.getAttribute("name")];
                if(!had || had.length == 0){
                    // if(!teacherMode){
                        tree.removeChild(category);
                    // }else{
                    //     var blocks = category.getElementsByTagName('block');
                    //     for(var j = blocks.length - 1; j >= 0; j--){
                    //         blocks[j].setAttribute("opacity", "0.6")
                    //     }
                    // }
                }else{
                    var blocks = category.getElementsByTagName('block');
                    var remove = true;
                    for(var j = blocks.length - 1; j >= 0; j--){
                        var block = blocks[j];
                        if(!had[block.getAttribute("type")]){
                            teacherMode?block.setAttribute("opacity", "0.6"):category.removeChild(block);
                        }else{
                            remove = false;
                        }
                    }
                    if(remove){
                        //if(!teacherMode){
                            tree.removeChild(category);
                        // }else{
                        //     var blocks = category.getElementsByTagName('block');
                        //     for(var j = blocks.length - 1; j >= 0; j--){
                        //         blocks[j].setAttribute("opacity", "0.6")
                        //     }
                        // }
                    }
                }
            }
        }
        if (categories.length) {
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

    //   ScratchBlocks.Xml.domToBlockHeadless_ = function(xmlBlock, workspace) {
    //     var block = null;
    //     var prototypeName = xmlBlock.getAttribute('type');
    //     // goog.asserts.assert(
    //     //     prototypeName, 'Block type unspecified: %s', xmlBlock.outerHTML);
    //     var id = xmlBlock.getAttribute('id');
    //     block = workspace.newBlock(prototypeName, id);
      
    //     var blockChild = null;
    //     for (var i = 0, xmlChild; xmlChild = xmlBlock.childNodes[i]; i++) {
    //       if (xmlChild.nodeType == 3) {
    //         // Ignore any text at the <block> level.  It's all whitespace anyway.
    //         continue;
    //       }
    //       var input;
      
    //       // Find any enclosed blocks or shadows in this tag.
    //       var childBlockElement = null;
    //       var childShadowElement = null;
    //       for (var j = 0, grandchild; grandchild = xmlChild.childNodes[j]; j++) {
    //         if (grandchild.nodeType == 1) {
    //           if (grandchild.nodeName.toLowerCase() == 'block') {
    //             childBlockElement = /** @type {!Element} */ (grandchild);
    //           } else if (grandchild.nodeName.toLowerCase() == 'shadow') {
    //             childShadowElement = /** @type {!Element} */ (grandchild);
    //           }
    //         }
    //       }
    //       // Use the shadow block if there is no child block.
    //       if (!childBlockElement && childShadowElement) {
    //         childBlockElement = childShadowElement;
    //       }
      
    //       var name = xmlChild.getAttribute('name');
    //       switch (xmlChild.nodeName.toLowerCase()) {
    //         case 'mutation':
    //           // Custom data for an advanced block.
    //           if (block.domToMutation) {
    //             block.domToMutation(xmlChild);
    //             if (block.initSvg) {
    //               // Mutation may have added some elements that need initializing.
    //               block.initSvg();
    //             }
    //           }
    //           break;
    //         case 'comment':
    //           var commentId = xmlChild.getAttribute('id');
    //           var bubbleX = parseInt(xmlChild.getAttribute('x'), 10);
    //           var bubbleY = parseInt(xmlChild.getAttribute('y'), 10);
    //           var minimized = xmlChild.getAttribute('minimized') || false;
      
    //           // Note bubbleX and bubbleY can be NaN, but the ScratchBlockComment
    //           // constructor will handle that.
    //           block.setCommentText(xmlChild.textContent, commentId, bubbleX, bubbleY,
    //               minimized == 'true');
      
    //           var visible = xmlChild.getAttribute('pinned');
    //           if (visible && !block.isInFlyout) {
    //             // Give the renderer a millisecond to render and position the block
    //             // before positioning the comment bubble.
    //             setTimeout(function() {
    //               if (block.comment && block.comment.setVisible) {
    //                 block.comment.setVisible(visible == 'true');
    //               }
    //             }, 1);
    //           }
    //           var bubbleW = parseInt(xmlChild.getAttribute('w'), 10);
    //           var bubbleH = parseInt(xmlChild.getAttribute('h'), 10);
    //           if (!isNaN(bubbleW) && !isNaN(bubbleH) &&
    //               block.comment && block.comment.setVisible) {
    //             if (block.comment instanceof Blockly.ScratchBlockComment) {
    //               block.comment.setSize(bubbleW, bubbleH);
    //             } else {
    //               block.comment.setBubbleSize(bubbleW, bubbleH);
    //             }
    //           }
    //           break;
    //         case 'data':
    //           block.data = xmlChild.textContent;
    //           break;
    //         case 'title':
    //           // Titles were renamed to field in December 2013.
    //           // Fall through.
    //         case 'field':
    //             ScratchBlocks.Xml.domToField_(block, name, xmlChild);
    //           break;
    //         case 'value':
    //         case 'statement':
    //           input = block.getInput(name);
    //           if (!input) {
    //             console.warn('Ignoring non-existent input ' + name + ' in block ' +
    //                          prototypeName);
    //             break;
    //           }
    //           if (childShadowElement) {
    //             input.connection.setShadowDom(childShadowElement);
    //           }
    //           if (childBlockElement) {
    //             blockChild = ScratchBlocks.Xml.domToBlockHeadless_(childBlockElement,
    //                 workspace);
    //             if (blockChild.outputConnection) {
    //               input.connection.connect(blockChild.outputConnection);
    //             } else if (blockChild.previousConnection) {
    //               input.connection.connect(blockChild.previousConnection);
    //             } else {
    //               goog.asserts.fail(
    //                   'Child block does not have output or previous statement.');
    //             }
    //           }
    //           break;
    //         case 'next':
    //           if (childShadowElement && block.nextConnection) {
    //             block.nextConnection.setShadowDom(childShadowElement);
    //           }
    //           if (childBlockElement) {
    //             // goog.asserts.assert(block.nextConnection,
    //             //     'Next statement does not exist.');
    //             // // If there is more than one XML 'next' tag.
    //             // goog.asserts.assert(!block.nextConnection.isConnected(),
    //             //     'Next statement is already connected.');
    //             blockChild = ScratchBlocks.Xml.domToBlockHeadless_(childBlockElement,
    //                 workspace);
    //             // goog.asserts.assert(blockChild.previousConnection,
    //             //     'Next block does not have previous statement.');
    //             block.nextConnection.connect(blockChild.previousConnection);
    //           }
    //           break;
    //         default:
    //           // Unknown tag; ignore.  Same principle as HTML parsers.
    //           console.warn('Ignoring unknown tag: ' + xmlChild.nodeName);
    //       }
    //     }
      
    //     var inline = xmlBlock.getAttribute('inline');
    //     if (inline) {
    //       block.setInputsInline(inline == 'true');
    //     }
    //     var disabled = xmlBlock.getAttribute('disabled');
    //     if (disabled) {
    //       block.setDisabled(disabled == 'true' || disabled == 'disabled');
    //     }
    //     var deletable = xmlBlock.getAttribute('deletable');
    //     if (deletable) {
    //       block.setDeletable(deletable == 'true');
    //     }
    //     var movable = xmlBlock.getAttribute('movable');
    //     if (movable) {
    //       block.setMovable(movable == 'true');
    //     }
    //     var editable = xmlBlock.getAttribute('editable');
    //     if (editable) {
    //       block.setEditable(editable == 'true');
    //     }
    //     var collapsed = xmlBlock.getAttribute('collapsed');
    //     if (collapsed) {
    //       block.setCollapsed(collapsed == 'true');
    //     }
    //     var opacity = xmlBlock.getAttribute('opacity');
    //     if (opacity) {
    //       block.setOpacity(opacity);
    //     }
    //     if (xmlBlock.nodeName.toLowerCase() == 'shadow') {
    //       // Ensure all children are also shadows.
    //       var children = block.getChildren(false);
    //       for (var i = 0, child; child = children[i]; i++) {
    //         goog.asserts.assert(
    //             child.isShadow(), 'Shadow block not allowed non-shadow child.');
    //       }
    //       block.setShadow(true);
    //     }
    //     return block;
    //   };


    return ScratchBlocks;
}
