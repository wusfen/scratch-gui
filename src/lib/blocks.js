import ScratchBlocks from 'scratch-blocks';
import fixBugs from './blocks_fix_bugs';
import teacherMode from './blocks_teacher_mode';
import optimize from './blocks_optimize';
// eslint-disable-next-line camelcase
import appear_modify from './blocks_appearance_modify';
import addNew from './blocks_add_new';
import Style from '../css/blockly.css';

addNew(ScratchBlocks);// 增加积木块
appear_modify(ScratchBlocks);// UI样式修改
fixBugs(ScratchBlocks);// 修正bug
optimize(ScratchBlocks);// 优化

/**
 * Connect scratch blocks with the vm
 * @param {VirtualMachine} vm - The scratch vm
 * @return {ScratchBlocks} ScratchBlocks connected with the vm
 */
export default function (vm) {

    teacherMode(ScratchBlocks, vm);

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
        menu.unshift([
            '增加/编辑声音',
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
        let target, name;
        for (const targetId in vm.runtime.targets) {
            // eslint-disable-next-line no-prototype-builtins
            if (!vm.runtime.targets.hasOwnProperty(targetId)) continue;
            target = vm.runtime.targets[targetId];
            if (target.isOriginal) {
                if (!target.isStage) {
                    if (target === vm.editingTarget) {
                        continue;
                    }
                    name = target.sprite.name;
                    if((window.MODE !== 'teacher' && name.indexOf('#') === 0 && name.length - 1 === name.indexOf('*'))){
                        continue;
                    }
                    sprites.push([name, name]);
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

    const oldStartDrag = ScratchBlocks.BlockDragger.prototype.startBlockDrag;
    ScratchBlocks.BlockDragger.prototype.startBlockDrag = function () {
        document.getElementById('toolboxTrashcan').style.display = 'block';
        return (oldStartDrag.apply(this, arguments));
    };

    const updateCursorDuringBlockDrag_ = ScratchBlocks.BlockDragger.prototype.updateCursorDuringBlockDrag_;
    ScratchBlocks.BlockDragger.prototype.updateCursorDuringBlockDrag_ = function (){
        const toolBoxDom = document.getElementById('toolboxTrashcan');
        const trashCanDom = document.getElementById('trashcanImg');
        const trashDom = document.getElementById('trashImg');
        const selectedBlockly = document.querySelector('.blocklySelected');
        const left = toolBoxDom.getBoundingClientRect().left;
        const right = toolBoxDom.getBoundingClientRect().right;

        selectedBlockly.ontouchmove = function (e){
            const touchObj = e.touches[0];
            if (touchObj.pageX > left && touchObj.pageX < right){
                trashCanDom.style.display = 'block';
                trashDom.style.display = 'none';
                selectedBlockly.style.opacity = 0.5;
            } else {
                trashCanDom.style.display = 'none';
                trashDom.style.display = 'block';
                selectedBlockly.style.opacity = 1;
            }
        };
        const exr = /^[a-zA-z_]{1,}$/;
        const selectId = selectedBlockly.dataset.id;

        toolBoxDom.onmouseover = function (){
            trashCanDom.style.display = 'block';
            trashDom.style.display = 'none';
            // selectedBlockly.style.opacity = 0.5;
            if (!exr.test(selectId)){
                selectedBlockly.classList.add(`${Style.selectedblocklyOpacity}`);
            }
        };
        toolBoxDom.onmouseout = function (){
            trashCanDom.style.display = 'none';
            trashDom.style.display = 'block';
            // selectedBlockly.style.opacity = 0.5;
            selectedBlockly.classList.remove(`${Style.selectedblocklyOpacity}`);
        };
        return (updateCursorDuringBlockDrag_.apply(this, arguments));
    };
    const oldEndBlockDrag = ScratchBlocks.BlockDragger.prototype.endBlockDrag;
    ScratchBlocks.BlockDragger.prototype.endBlockDrag = function () {
        document.getElementById('toolboxTrashcan').style.display = 'none';
        return (oldEndBlockDrag.apply(this, arguments));
    };


    // ===== Blockly =====
    const Blockly = ScratchBlocks;

    /**
     * Show the context menu for this block.
     * @param {!Event} e Mouse event.
     * @private
     */
    Blockly.BlockSvg.prototype.showContextMenu_ = function (e) {
        if (this.workspace.options.readOnly || !this.contextMenu) {
            return;
        }
        // Save the current block in a variable for use in closures.
        var block = this;
        var menuOptions = [];
        if (this.isDeletable() && this.isMovable() && !block.isInFlyout) {
            menuOptions.push(
                Blockly.ContextMenu.blockDuplicateOption(block, e));
            if (this.isEditable() && this.workspace.options.comments) {
                menuOptions.push(Blockly.ContextMenu.blockCommentOption(block));
            }
            menuOptions.push(Blockly.ContextMenu.blockDeleteOption(block));

            var collapsed_ = this.collapsed_;
            var startHat_ = this.startHat_;
            menuOptions.push({
                text: collapsed_ ? Blockly.Msg.EXPAND : Blockly.Msg.COLLAPSE,
                enabled: true,
                callback () {
                    if (startHat_) {
                        while (block) {
                            block.setCollapsed(!collapsed_);
                            block = block.getNextBlock();
                        }
                    } else {
                        block.setCollapsed(!collapsed_);
                    }
                }
            });
        } else if (this.parentBlock_ && this.isShadow_) {
            this.parentBlock_.showContextMenu_(e);
            return;
        }

        // Allow the block to add or modify menuOptions.
        if (this.customContextMenu) {
            this.customContextMenu(menuOptions);
        }
        Blockly.ContextMenu.show(e, menuOptions, this.RTL);
        Blockly.ContextMenu.currentBlock = this;
    };

    /**
     * Show the context menu for the workspace.
     * @param {!Event} e Mouse event.
     * @private
     */
    Blockly.WorkspaceSvg.prototype.showContextMenu_ = function (e) {
        /* eslint-disable block-scoped-var, no-redeclare */
        if (this.options.readOnly || this.isFlyout) {
            return;
        }
        var menuOptions = [];
        var topBlocks = this.getTopBlocks(true);
        var eventGroup = Blockly.utils.genUid();
        var ws = this;

        // Options to undo/redo previous action.
        menuOptions.push(Blockly.ContextMenu.wsUndoOption(this));
        menuOptions.push(Blockly.ContextMenu.wsRedoOption(this));

        // Option to clean up blocks.
        if (this.scrollbar) {
            menuOptions.push(
                Blockly.ContextMenu.wsCleanupOption(this, topBlocks.length));
        }

        if (this.options.collapse) {
            var hasCollapsedBlocks = false;
            var hasExpandedBlocks = false;
            for (var i = 0; i < topBlocks.length; i++) {
                var block = topBlocks[i];
                while (block) {
                    if (block.isCollapsed()) {
                        hasCollapsedBlocks = true;
                    } else {
                        hasExpandedBlocks = true;
                    }
                    block = block.getNextBlock();
                }
            }

            menuOptions.push(Blockly.ContextMenu.wsCollapseOption(hasExpandedBlocks,
                topBlocks));

            menuOptions.push(Blockly.ContextMenu.wsExpandOption(hasCollapsedBlocks,
                topBlocks));
        }

        // Option to add a workspace comment.
        if (this.options.comments) {
            menuOptions.push(Blockly.ContextMenu.workspaceCommentOption(ws, e));
        }

        // Option to delete all blocks.
        // Count the number of blocks that are deletable.
        var deleteList = Blockly.WorkspaceSvg.buildDeleteList_(topBlocks);
        // Scratch-specific: don't count shadow blocks in delete count
        var deleteCount = 0;
        for (var i = 0; i < deleteList.length; i++) {
            if (!deleteList[i].isShadow()) {
                deleteCount++;
            }
        }

        var DELAY = 10;
        function deleteNext () {
            Blockly.Events.setGroup(eventGroup);
            var block = deleteList.shift();
            if (block) {
                if (block.workspace) {
                    block.dispose(false, true);
                    setTimeout(deleteNext, DELAY);
                } else {
                    deleteNext();
                }
            }
            Blockly.Events.setGroup(false);
        }

        var deleteOption = {
            text: deleteCount == 1 ? Blockly.Msg.DELETE_BLOCK :
                Blockly.Msg.DELETE_X_BLOCKS.replace('%1', String(deleteCount)),
            enabled: deleteCount > 0,
            callback: function () {
                if (ws.currentGesture_) {
                    ws.currentGesture_.cancel();
                }
                if (deleteCount < 2) {
                    deleteNext();
                } else {
                    Blockly.confirm(
                        Blockly.Msg.DELETE_ALL_BLOCKS.replace('%1', String(deleteCount)),
                        ok => {
                            if (ok) {
                                deleteNext();
                            }
                        });
                }
            }
        };
        // menuOptions.push(deleteOption);

        Blockly.ContextMenu.show(e, menuOptions, this.RTL);
    };


    return ScratchBlocks;
}
