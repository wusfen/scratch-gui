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


    return ScratchBlocks;
}
