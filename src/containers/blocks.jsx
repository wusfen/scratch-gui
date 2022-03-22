import bindAll from 'lodash.bindall';
import debounce from 'lodash.debounce';
import defaultsDeep from 'lodash.defaultsdeep';
import makeToolboxXML from '../lib/make-toolbox-xml';
import PropTypes from 'prop-types';
import React from 'react';
import VMScratchBlocks from '../lib/blocks';
import VM from 'scratch-vm';

import log from '../lib/log.js';
import Prompt from './prompt.jsx';
import BlocksComponent from '../components/blocks/blocks.jsx';
import ExtensionLibrary from './extension-library.jsx';
import extensionData from '../lib/libraries/extensions/index.jsx';
import CustomProcedures from './custom-procedures.jsx';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import {BLOCKS_DEFAULT_SCALE, STAGE_DISPLAY_SIZES} from '../lib/layout-constants';
import DropAreaHOC from '../lib/drop-area-hoc.jsx';
import DragConstants from '../lib/drag-constants';
import defineDynamicBlock from '../lib/define-dynamic-block';
import AutoClose from '../components/auto-close/auto-close.jsx';

import {connect} from 'react-redux';
import {updateToolbox} from '../reducers/toolbox';
import {activateColorPicker} from '../reducers/color-picker';
import {closeExtensionLibrary, openSoundRecorder, openConnectionModal} from '../reducers/modals';
import {activateCustomProcedures, deactivateCustomProcedures} from '../reducers/custom-procedures';
import {setConnectionModalExtensionId} from '../reducers/connection-modal';
import {updateMetrics} from '../reducers/workspace-metrics';
import {setAutoClose, setVisible} from '../reducers/auto-close';
import classNames from 'classnames';
import styles from './blocks.css';
import disappearGif from '../assets/icons/disappear.gif';
import {playTipAudio} from '../lib/courseTip/TipAudio.js';
import disappearMp3 from '../assets/sounds/disappear.mp3';
import dragBlockFromFlyoutMp3 from '../assets/sounds/dragBlockFromFlyout.mp3';
import jointBlockMp3 from '../assets/sounds/jointBlock.mp3';
import separateBlockMp3 from '../assets/sounds/separateBlock.mp3';

import {
    activateTab,
    SOUNDS_TAB_INDEX
} from '../reducers/editor-tab';

const addFunctionListener = (object, property, callback) => {
    const oldFn = object[property];
    object[property] = function (...args) {
        const result = oldFn.apply(this, args);
        callback.apply(this, result);
        return result;
    };
};

const DroppableBlocks = DropAreaHOC([
    DragConstants.BACKPACK_CODE
])(BlocksComponent);

class Blocks extends React.Component {
    constructor (props) {
        super(props);
        this.ScratchBlocks = VMScratchBlocks(props.vm);
        bindAll(this, [
            'attachVM',
            'detachVM',
            'getToolboxXML',
            'handleCategorySelected',
            'handleConnectionModalStart',
            'handleDrop',
            'handleStatusButtonUpdate',
            'handleOpenSoundRecorder',
            'handlePromptStart',
            'handlePromptCallback',
            'handlePromptClose',
            'handleCustomProceduresClose',
            'onScriptGlowOn',
            'onScriptGlowOff',
            'onBlockGlowOn',
            'onBlockGlowOff',
            'handleExtensionAdded',
            'handleBlocksInfoUpdate',
            'onTargetsUpdate',
            'onVisualReport',
            'onWorkspaceUpdate',
            'onWorkspaceMetricsChange',
            'setBlocks',
            'setLocale',
            'workSpaceChangeHandle'
        ]);
        this.ScratchBlocks.prompt = this.handlePromptStart;
        this.ScratchBlocks.statusButtonCallback = this.handleConnectionModalStart;
        this.ScratchBlocks.recordSoundCallback = this.handleOpenSoundRecorder;

        this.state = {
            prompt: null
        };
        this.onTargetsUpdate = debounce(this.onTargetsUpdate, 100);
        this.toolboxUpdateQueue = [];
    }

    componentDidMount () {
        var props = this.props;
        this.ScratchBlocks.FieldColourSlider.activateEyedropper_ = this.props.onActivateColorPicker;
        this.ScratchBlocks.Procedures.externalProcedureDefCallback = this.props.onActivateCustomProcedures;
        this.ScratchBlocks.ScratchMsgs.setLocale(this.props.locale);

        const workspaceConfig = defaultsDeep({}, {
            grid: {
                length: 48,
                spacing: 48,
                colour: '#ddf4fb',
                snap: true,
            },
            zoom: {
                controls: true,
                wheel: true,
                // startScale: .75,
                startScale: this.ScratchBlocks.getFitScale(),
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            },
            collapse: true,
            media: `${window.PUBLIC_PATH || '.'}/static/blocks-media/`.replace(/([^:])[/]{2,}/g, '$1/'),
        },
        Blocks.defaultOptions,
        this.props.options,
        {rtl: this.props.isRtl, toolbox: this.props.toolboxXML}
        );

        this.workspace = this.ScratchBlocks.inject(this.blocks, workspaceConfig);
        window.ScratchBlocks = this.ScratchBlocks;
        window.workspace = this.workspace;
        const workspace = this.workspace;
        const toolbox_ = workspace.toolbox_;
        const startScale = workspaceConfig.zoom.startScale * (1 / this.ScratchBlocks.getFitScale());
        toolbox_.flyout_.DEFAULT_WIDTH = 250 * startScale;
        toolbox_.width = toolbox_.flyout_.DEFAULT_WIDTH + (73 * startScale);
        toolbox_.flyout_.autoClose = this.props.autoClose;
        // // autoClose 时会执行它
        toolbox_.clearSelection = function () {
            // null 后，更新 toolbox xml 时，不能走依赖 selectedItem 的逻辑
            // this.setSelectedItem(null);
            // 只改变样式，以免影响到 toolbox xml;
            toolbox_.flyout_.setVisible(false);
        };
        toolbox_.clearSelection(); // 初始关闭
        var _setVisible = this.ScratchBlocks.mainWorkspace.toolbox_.flyout_.setVisible;
        this.ScratchBlocks.mainWorkspace.toolbox_.flyout_.setVisible = function (bool) {
            const blocklyFlyout = this.svgGroup_;
            const categorySelected = document.querySelector('.scratchCategoryMenuItem.categorySelected');
            const isSelectedAndVisible = !!categorySelected && bool;
            // console.warn('bool:', bool, isSelectedAndVisible);

            if (isSelectedAndVisible) {
                blocklyFlyout.classList.add(`${styles['flyout-open']}`);
                blocklyFlyout.classList.remove(`${styles['flyout-close']}`);
            } else {
                blocklyFlyout.classList.add(`${styles['flyout-close']}`);
                blocklyFlyout.classList.remove(`${styles['flyout-open']}`);
            }

            if (!bool) {
                if (categorySelected) {
                    categorySelected.classList.remove('categorySelected');
                }
            }

            props.setVisible(isSelectedAndVisible);
            return _setVisible.apply(this, arguments);
        };

        // 修正 toolbox 边界，以前是往左延伸，影响到代码拖动到另一角色
        const rect = toolbox_.getClientRect();
        toolbox_.getClientRect = function () {
            const toolboxRect = this.HtmlDiv.getBoundingClientRect();
            const x = toolboxRect.left;
            const y = toolboxRect.top;
            const width = toolboxRect.width;
            const height = toolboxRect.height;

            return Object.assign(rect, {
                left: x,
                top: y,
                width: width,
                height: height,
            });
        };

        // Register buttons under new callback keys for creating variables,
        // lists, and procedures from extensions.

        const toolboxWorkspace = this.workspace.getFlyout().getWorkspace();
        const varListButtonCallback = type =>
            (() => this.ScratchBlocks.Variables.createVariable(this.workspace, null, type));
        const procButtonCallback = () => {
            this.ScratchBlocks.Procedures.createProcedureDefCallback_(this.workspace);
        };

        toolboxWorkspace.registerButtonCallback('MAKE_A_VARIABLE', varListButtonCallback(''));
        toolboxWorkspace.registerButtonCallback('MAKE_A_LIST', varListButtonCallback('list'));
        toolboxWorkspace.registerButtonCallback('MAKE_A_PROCEDURE', procButtonCallback);

        // Store the xml of the toolbox that is actually rendered.
        // This is used in componentDidUpdate instead of prevProps, because
        // the xml can change while e.g. on the costumes tab.
        this._renderedToolboxXML = this.props.toolboxXML;

        // we actually never want the workspace to enable "refresh toolbox" - this basically re-renders the
        // entire toolbox every time we reset the workspace.  We call updateToolbox as a part of
        // componentDidUpdate so the toolbox will still correctly be updated
        this.setToolboxRefreshEnabled = this.workspace.setToolboxRefreshEnabled.bind(this.workspace);
        this.workspace.setToolboxRefreshEnabled = () => {
            this.setToolboxRefreshEnabled(false);
        };

        // eslint-disable-next-line no-warning-comments
        // @todo change this when blockly supports UI events
        addFunctionListener(this.workspace, 'translate', this.onWorkspaceMetricsChange);
        addFunctionListener(this.workspace, 'zoom', this.onWorkspaceMetricsChange);

        this.attachVM();
        // Only update blocks/vm locale when visible to avoid sizing issues
        // If locale changes while not visible it will get handled in didUpdate
        if (this.props.isVisible) {
            this.setLocale();
        }

        this.addEventListener('updateToolBox', () => {
            this.requestToolboxUpdate();
        });

        this.addEventListener('updateWorkspace_', () => {
            this.props.vm.refreshWorkspace();
            this.requestToolboxUpdate();
        });
    }
    shouldComponentUpdate (nextProps, nextState) {
        return (
            this.state.prompt !== nextState.prompt ||
            this.props.isVisible !== nextProps.isVisible ||
            this._renderedToolboxXML !== nextProps.toolboxXML ||
            this.props.extensionLibraryVisible !== nextProps.extensionLibraryVisible ||
            this.props.customProceduresVisible !== nextProps.customProceduresVisible ||
            this.props.locale !== nextProps.locale ||
            this.props.anyModalVisible !== nextProps.anyModalVisible ||
            this.props.stageSize !== nextProps.stageSize ||
            this.props.autoClose !== nextProps.autoClose ||
            this.props.isStageHidden !== nextProps.isStageHidden
        );
    }
    componentDidUpdate (prevProps) {
        // 切换角色 xml 也会变化
        // 切换角色 Category 也会变化

        // console.log('this.props.toolboxXML:', prevProps.toolboxXML === this.props.toolboxXML);

        if (this.props.autoClose !== prevProps.autoClose || this.props.isStageHidden !== prevProps.isStageHidden) {
            var Blockly = this.ScratchBlocks;
            var mainWorkspace = this.ScratchBlocks.mainWorkspace;
            const flyout_ = mainWorkspace.toolbox_?.flyout_;

            // TODO FIXME 点【制作新的积木】后 toolbox_ 会变为空，但是页面还显示 flyout_
            if (flyout_){
                flyout_.autoClose = this.props.autoClose;

                Blockly.hideChaffOnResize(true);
                const scale = Blockly.getFitScale();
                mainWorkspace.options.zoomOptions.startScale = scale;
                mainWorkspace.setScale(scale);
                Blockly.svgResize(mainWorkspace);
                // mainWorkspace.scrollCenter();
                // const toolbox = mainWorkspace.toolbox_;
                flyout_.workspace_.scale = scale;
                flyout_.reflow();
            }

        }

        // If any modals are open, call hideChaff to close z-indexed field editors
        if (this.props.anyModalVisible && !prevProps.anyModalVisible) {
            this.ScratchBlocks.hideChaff();
        }

        // Only rerender the toolbox when the blocks are visible and the xml is
        // different from the previously rendered toolbox xml.
        // Do not check against prevProps.toolboxXML because that may not have been rendered.
        if (
            (this.props.isVisible && this.props.toolboxXML !== this._renderedToolboxXML) ||
            this.props.isStageHidden !== prevProps.isStageHidden
        ) {
            this.requestToolboxUpdate();
        }

        if (this.props.isVisible === prevProps.isVisible) {
            if (this.props.stageSize !== prevProps.stageSize) {
                // force workspace to redraw for the new stage size
                window.dispatchEvent(new Event('resize'));
            }
            return;
        }
        // eslint-disable-next-line no-warning-comments
        // @todo hack to resize blockly manually in case resize happened while hidden
        // eslint-disable-next-line no-warning-comments
        // @todo hack to reload the workspace due to gui bug #413
        if (this.props.isVisible) { // Scripts tab
            this.workspace.setVisible(true);
            if (prevProps.locale !== this.props.locale || this.props.locale !== this.props.vm.getLocale()) {
                // call setLocale if the locale has changed, or changed while the blocks were hidden.
                // vm.getLocale() will be out of sync if locale was changed while not visible
                this.setLocale();
            } else {
                this.props.vm.refreshWorkspace();
                this.requestToolboxUpdate();
            }

            window.dispatchEvent(new Event('resize'));
        } else {
            this.workspace.setVisible(false);
        }
    }
    componentWillUnmount () {
        this.detachVM();
        this.workspace.dispose();
        clearTimeout(this.toolboxUpdateTimeout);
    }
    requestToolboxUpdate () {
        clearTimeout(this.toolboxUpdateTimeout);
        this.toolboxUpdateTimeout = setTimeout(() => {
            this.updateToolbox();
        }, 0);
    }
    setLocale () {
        this.ScratchBlocks.ScratchMsgs.setLocale(this.props.locale);
        this.props.vm.setLocale(this.props.locale, this.props.messages)
            .then(() => {
                this.workspace.getFlyout().setRecyclingEnabled(false);
                this.props.vm.refreshWorkspace();
                this.requestToolboxUpdate();
                this.withToolboxUpdates(() => {
                    this.workspace.getFlyout().setRecyclingEnabled(true);
                });
            });
    }

    updateToolbox () {
        this.toolboxUpdateTimeout = false;
        const isVisible_ = this.workspace.toolbox_?.flyout_.isVisible_;

        // FIXED: autoClose 时 toolbox 关闭时，从舞台切换到角色，有些块（如当开始被点击）变成无法拖动
        //        切换前没有的块可以，广播消息也可以。必须 setVisible(true)
        this.workspace.toolbox_?.flyout_.setVisible(true);

        // eslint-disable-next-line no-warning-comments
        // TODO 有问题，暂不设置 selectedItem_ = null
        // 只更新 xml ，不能走依赖 selectedItem_ 的逻辑
        // eslint-disable-next-line no-negated-condition
        if (!this.workspace.toolbox_.selectedItem_) {
            this.workspace.updateToolbox(this.props.toolboxXML);
            this._renderedToolboxXML = this.props.toolboxXML;
            this.workspace.toolboxRefreshEnabled_ = true;
        } else {
            const categoryId = this.workspace.toolbox_.getSelectedCategoryId();
            const offset = this.workspace.toolbox_.getCategoryScrollOffset();
            this.workspace.updateToolbox(this.props.toolboxXML);
            this._renderedToolboxXML = this.props.toolboxXML;

            // In order to catch any changes that mutate the toolbox during "normal runtime"
            // (variable changes/etc), re-enable toolbox refresh.
            // Using the setter function will rerender the entire toolbox which we just rendered.
            this.workspace.toolboxRefreshEnabled_ = true;

            const currentCategoryPos = this.workspace.toolbox_.getCategoryPositionById(categoryId);
            const currentCategoryLen = this.workspace.toolbox_.getCategoryLengthById(categoryId);
            if (offset < currentCategoryLen) {
                this.workspace.toolbox_.setFlyoutScrollPos(currentCategoryPos + offset);
            } else {
                this.workspace.toolbox_.setFlyoutScrollPos(currentCategoryPos);
            }
        }

        this.workspace.toolbox_?.flyout_.setVisible(isVisible_);

        // 定位第一块积木
        if (this.props.vm.editingTarget) {
            if (!this.props.vm.editingTarget.__hasCenterOnBlock) {
                this.props.vm.editingTarget.__hasCenterOnBlock = true;

                this.workspace.topOnBlock(this.workspace.topBlocks_.filter(e => e.rendered).sort((a, b) => {
                    return a.getRelativeToSurfaceXY().y - b.getRelativeToSurfaceXY().y;
                })[0]?.id);
            }
        }

        const queue = this.toolboxUpdateQueue;
        this.toolboxUpdateQueue = [];
        queue.forEach(fn => fn());

    }

    withToolboxUpdates (fn) {
        // if there is a queued toolbox update, we need to wait
        if (this.toolboxUpdateTimeout) {
            this.toolboxUpdateQueue.push(fn);
        } else {
            fn();
        }
    }

    createDeleteEffectInXY () { // 创建消失gif特效
        const imgDom = document.createElement('img');
        imgDom.src = disappearGif;
        imgDom.style.position = 'absolute';
        imgDom.style.zIndex = 999999999;
        imgDom.style.width = '3rem';
        imgDom.style.height = '3rem';
        imgDom.style.left = `${window.dragBlockClientX}px`;
        imgDom.style.top = `${window.dragBlockClientY}px`;
        imgDom.style.pointerEvents = 'none';
        document.body.appendChild(imgDom);
        // playTipAudio(disappearMp3); 2.5需求去掉删除音效
        this.deleteEffectTimer = setTimeout(() => {
            document.body.removeChild(imgDom);
            clearTimeout(this.deleteEffectTimer);
        }, 500);
    }

    getClientRectInWindow (dom) { // 记录所操作块的坐标
        if (!dom) {
            return;
        }
        window.dragBlockClientX = dom.left + 24;
        window.dragBlockClientY = dom.top + 24;
    }

    workSpaceChangeHandle (event) {
        if (event.type === 'delete' || (event.type === 'move' &&
        ((!event.oldParentId && event.newParentId) || (event.oldParentId && !event.newParentId)))) { // 对删除、拼接、分开事件做节流处理
            if (window.throttlrTimer) {
                return;
            }
            window.throttlrTimer = setTimeout(() => {
                clearTimeout(this.throttlrTimer);
                window.throttlrTimer = null;
            }, 200);
        }

        if (window.btnPlayAudioIng) { // 当点击代码块后退、前进操作时，也会触发事件，所以要丢弃后退、前进按钮被点击内1000ms触发的该事件。
            return;
        }
        const dom = document.getElementsByClassName('blocklySelected');
        this.getClientRectInWindow(dom[0]?.getBoundingClientRect());
        if (event.type === 'delete') { // 处理块删除事件
            if (!event.recordUndo) return; // 切换角色触发的delete不触发动效，这时event对象recordUndo为false
            this.createDeleteEffectInXY();
        } else if (event.type === 'ui') {
            const regex = new RegExp('^([a-zA-Z0-9_]){1,}$');
            if (event.newValue && regex.test(event.oldValue)) { // 从flyout拖出来
                playTipAudio(jointBlockMp3); // 2.5需求改为和拼接音效相同
            }
        } else if (event.type === 'move') {
            if (!event.oldParentId && event.newParentId) { // 拼接
                playTipAudio(jointBlockMp3);
            } else if (event.oldParentId && !event.newParentId) { // 分开
                playTipAudio(separateBlockMp3);
            }
        }
    }

    attachVM () {
        this.workspace.addChangeListener(this.props.vm.blockListener);
        this.workspace.addChangeListener(this.workSpaceChangeHandle); // 自定义workspace监听事件
        this.flyoutWorkspace = this.workspace
            .getFlyout()
            .getWorkspace();
        this.flyoutWorkspace.addChangeListener(this.props.vm.flyoutBlockListener);
        this.flyoutWorkspace.addChangeListener(this.props.vm.monitorBlockListener);
        this.props.vm.addListener('SCRIPT_GLOW_ON', this.onScriptGlowOn);
        this.props.vm.addListener('SCRIPT_GLOW_OFF', this.onScriptGlowOff);
        this.props.vm.addListener('BLOCK_GLOW_ON', this.onBlockGlowOn);
        this.props.vm.addListener('BLOCK_GLOW_OFF', this.onBlockGlowOff);
        this.props.vm.addListener('VISUAL_REPORT', this.onVisualReport);
        this.props.vm.addListener('workspaceUpdate', this.onWorkspaceUpdate);
        this.props.vm.addListener('targetsUpdate', this.onTargetsUpdate);
        this.props.vm.addListener('EXTENSION_ADDED', this.handleExtensionAdded);
        this.props.vm.addListener('BLOCKSINFO_UPDATE', this.handleBlocksInfoUpdate);
        this.props.vm.addListener('PERIPHERAL_CONNECTED', this.handleStatusButtonUpdate);
        this.props.vm.addListener('PERIPHERAL_DISCONNECTED', this.handleStatusButtonUpdate);

        // fix: 移动 block 后，与其关联的 comment 坐标没有更新
        this.workspace.addChangeListener(this._fixMoveBlock = e => {
            if (e.type === 'move') {
                // 从组分离和拼合时分别无旧坐标和新坐标
                if (!e.oldCoordinate || !e.newCoordinate) return;
                // ！！切换角色时也会触发，其旧坐标为0，以此排除非手动移动
                if (e.oldCoordinate.x === 0 && e.oldCoordinate.y === 0) return;

                const target = this.props.vm.editingTarget;
                const block = target.blocks._blocks[e.blockId];
                const comment = target.comments[block?.comment];

                if (comment) {
                    const diffX = e.newCoordinate.x - e.oldCoordinate.x;
                    const diffY = e.newCoordinate.y - e.oldCoordinate.y;
                    comment.x += diffX;
                    comment.y += diffY;
                }

            }
        });
    }
    detachVM () {
        this.props.vm.removeListener('SCRIPT_GLOW_ON', this.onScriptGlowOn);
        this.props.vm.removeListener('SCRIPT_GLOW_OFF', this.onScriptGlowOff);
        this.props.vm.removeListener('BLOCK_GLOW_ON', this.onBlockGlowOn);
        this.props.vm.removeListener('BLOCK_GLOW_OFF', this.onBlockGlowOff);
        this.props.vm.removeListener('VISUAL_REPORT', this.onVisualReport);
        this.props.vm.removeListener('workspaceUpdate', this.onWorkspaceUpdate);
        this.props.vm.removeListener('targetsUpdate', this.onTargetsUpdate);
        this.props.vm.removeListener('EXTENSION_ADDED', this.handleExtensionAdded);
        this.props.vm.removeListener('BLOCKSINFO_UPDATE', this.handleBlocksInfoUpdate);
        this.props.vm.removeListener('PERIPHERAL_CONNECTED', this.handleStatusButtonUpdate);
        this.props.vm.removeListener('PERIPHERAL_DISCONNECTED', this.handleStatusButtonUpdate);

        this.workspace.removeChangeListener(this._fixMoveBlock);
    }

    updateToolboxBlockValue (id, value) {
        this.withToolboxUpdates(() => {
            const block = this.workspace
                .getFlyout()
                .getWorkspace()
                .getBlockById(id);
            if (block) {
                block.inputList[0].fieldRow[0].setValue(value);
            }
        });
    }

    onTargetsUpdate () {
        if (this.props.vm.editingTarget && this.workspace.getFlyout()) {
            ['glide', 'move', 'set'].forEach(prefix => {
                this.updateToolboxBlockValue(`${prefix}x`, Math.round(this.props.vm.editingTarget.x).toString());
                this.updateToolboxBlockValue(`${prefix}y`, Math.round(this.props.vm.editingTarget.y).toString());
            });
        }
    }
    onWorkspaceMetricsChange () {
        const target = this.props.vm.editingTarget;
        if (target && target.id) {
            // Dispatch updateMetrics later, since onWorkspaceMetricsChange may be (very indirectly)
            // called from a reducer, i.e. when you create a custom procedure.
            // eslint-disable-next-line no-warning-comments
            // TODO: Is this a vehement hack?
            setTimeout(() => {
                this.props.updateMetrics({
                    targetID: target.id,
                    scrollX: this.workspace.scrollX,
                    scrollY: this.workspace.scrollY,
                    scale: this.workspace.scale
                });
            }, 0);
        }
    }
    onScriptGlowOn (data) {
        this.workspace.glowStack(data.id, true);
    }
    onScriptGlowOff (data) {
        this.workspace.glowStack(data.id, false);
    }
    onBlockGlowOn (data) {
        this.workspace.glowBlock(data.id, true);
    }
    onBlockGlowOff (data) {
        this.workspace.glowBlock(data.id, false);
    }
    onVisualReport (data) {
        this.workspace.reportValue(data.id, data.value);
    }
    getToolboxXML () {
        // Use try/catch because this requires digging pretty deep into the VM
        // Code inside intentionally ignores several error situations (no stage, etc.)
        // Because they would get caught by this try/catch
        try {
            let {editingTarget: target, runtime} = this.props.vm;
            const stage = runtime.getTargetForStage();
            if (!target) target = stage; // If no editingTarget, use the stage

            const stageCostumes = stage.getCostumes();
            const targetCostumes = target.getCostumes();
            const targetSounds = target.getSounds();
            const dynamicBlocksXML = this.props.vm.runtime.getBlocksXML(target);
            return makeToolboxXML(false, target.isStage, target.id, dynamicBlocksXML,
                targetCostumes[targetCostumes.length - 1].name,
                stageCostumes[stageCostumes.length - 1].name,
                targetSounds.length > 0 ? targetSounds[targetSounds.length - 1].name : ''
            );
        } catch {
            return null;
        }
    }
    onWorkspaceUpdate (data) {
        // When we change sprites, update the toolbox to have the new sprite's blocks
        const toolboxXML = this.getToolboxXML();
        if (toolboxXML) {
            this.props.updateToolboxState(toolboxXML);
        }

        if (this.props.vm.editingTarget && !this.props.workspaceMetrics.targets[this.props.vm.editingTarget.id]) {
            this.onWorkspaceMetricsChange();
        }

        // Remove and reattach the workspace listener (but allow flyout events)
        this.workspace.removeChangeListener(this.props.vm.blockListener);
        const dom = this.ScratchBlocks.Xml.textToDom(data.xml);
        try {
            this.ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(dom, this.workspace);
        } catch (error) {
            // The workspace is likely incomplete. What did update should be
            // functional.
            //
            // Instead of throwing the error, by logging it and continuing as
            // normal lets the other workspace update processes complete in the
            // gui and vm, which lets the vm run even if the workspace is
            // incomplete. Throwing the error would keep things like setting the
            // correct editing target from happening which can interfere with
            // some blocks and processes in the vm.
            if (error.message) {
                error.message = `Workspace Update Error: ${error.message}`;
            }
            log.error(error);
        }
        this.workspace.addChangeListener(this.props.vm.blockListener);

        if (this.props.vm.editingTarget && this.props.workspaceMetrics.targets[this.props.vm.editingTarget.id]) {
            const {scrollX, scrollY, scale} = this.props.workspaceMetrics.targets[this.props.vm.editingTarget.id];
            this.workspace.scrollX = scrollX;
            this.workspace.scrollY = scrollY;
            this.workspace.scale = scale;
            this.workspace.resize();
        }

        // Clear the undo state of the workspace since this is a
        // fresh workspace and we don't want any changes made to another sprites
        // workspace to be 'undone' here.
        this.workspace.clearUndo();
    }
    handleExtensionAdded (categoryInfo) {
        const defineBlocks = blockInfoArray => {
            if (blockInfoArray && blockInfoArray.length > 0) {
                const staticBlocksJson = [];
                const dynamicBlocksInfo = [];
                blockInfoArray.forEach(blockInfo => {
                    if (blockInfo.info && blockInfo.info.isDynamic) {
                        dynamicBlocksInfo.push(blockInfo);
                    } else if (blockInfo.json) {
                        staticBlocksJson.push(blockInfo.json);
                    }
                    // otherwise it's a non-block entry such as '---'
                });

                this.ScratchBlocks.defineBlocksWithJsonArray(staticBlocksJson);
                dynamicBlocksInfo.forEach(blockInfo => {
                    // This is creating the block factory / constructor -- NOT a specific instance of the block.
                    // The factory should only know static info about the block: the category info and the opcode.
                    // Anything else will be picked up from the XML attached to the block instance.
                    const extendedOpcode = `${categoryInfo.id}_${blockInfo.info.opcode}`;
                    const blockDefinition =
                        defineDynamicBlock(this.ScratchBlocks, categoryInfo, blockInfo, extendedOpcode);
                    this.ScratchBlocks.Blocks[extendedOpcode] = blockDefinition;
                });
            }
        };

        // scratch-blocks implements a menu or custom field as a special kind of block ("shadow" block)
        // these actually define blocks and MUST run regardless of the UI state
        defineBlocks(
            Object.getOwnPropertyNames(categoryInfo.customFieldTypes)
                .map(fieldTypeName => categoryInfo.customFieldTypes[fieldTypeName].scratchBlocksDefinition));
        defineBlocks(categoryInfo.menus);
        defineBlocks(categoryInfo.blocks);

        // Update the toolbox with new blocks if possible
        const toolboxXML = this.getToolboxXML();
        if (toolboxXML) {
            this.props.updateToolboxState(toolboxXML);
        }
    }
    handleBlocksInfoUpdate (categoryInfo) {
        // eslint-disable-next-line no-warning-comments
        // @todo Later we should replace this to avoid all the warnings from redefining blocks.
        this.handleExtensionAdded(categoryInfo);
    }
    handleCategorySelected (categoryId) {
        const extension = extensionData.find(ext => ext.extensionId === categoryId);
        if (extension && extension.launchPeripheralConnectionFlow) {
            this.handleConnectionModalStart(categoryId);
        }

        this.withToolboxUpdates(() => {
            this.workspace.toolbox_.setSelectedCategoryById(categoryId);
        });
    }
    setBlocks (blocks) {
        this.blocks = blocks;
    }
    handlePromptStart (message, defaultValue, callback, optTitle, optVarType) {
        const p = {prompt: {callback, message, defaultValue}};
        p.prompt.title = optTitle ? optTitle :
            this.ScratchBlocks.Msg.VARIABLE_MODAL_TITLE;
        p.prompt.varType = typeof optVarType === 'string' ?
            optVarType : this.ScratchBlocks.SCALAR_VARIABLE_TYPE;
        p.prompt.showVariableOptions = // This flag means that we should show variable/list options about scope
            optVarType !== this.ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE &&
            p.prompt.title !== this.ScratchBlocks.Msg.RENAME_VARIABLE_MODAL_TITLE &&
            p.prompt.title !== this.ScratchBlocks.Msg.RENAME_LIST_MODAL_TITLE;
        p.prompt.showCloudOption = (optVarType === this.ScratchBlocks.SCALAR_VARIABLE_TYPE) && this.props.canUseCloud;
        this.setState(p);
    }
    handleConnectionModalStart (extensionId) {
        this.props.onOpenConnectionModal(extensionId);
    }
    handleStatusButtonUpdate () {
        this.ScratchBlocks.refreshStatusButtons(this.workspace);
    }
    handleOpenSoundRecorder () {
        this.props.onOpenSoundRecorder();
    }

    /*
     * Pass along information about proposed name and variable options (scope and isCloud)
     * and additional potentially conflicting variable names from the VM
     * to the variable validation prompt callback used in scratch-blocks.
     */
    handlePromptCallback (input, variableOptions) {
        this.state.prompt.callback(
            input,
            this.props.vm.runtime.getAllVarNamesOfType(this.state.prompt.varType),
            variableOptions);
        this.handlePromptClose();
    }
    handlePromptClose () {
        this.setState({prompt: null});
    }
    handleCustomProceduresClose (data) {
        this.props.onRequestCloseCustomProcedures(data);
        const ws = this.workspace;
        ws.refreshToolboxSelection_();
        ws.toolbox_.scrollToCategoryById('myBlocks');
    }
    handleDrop (dragInfo) {
        fetch(dragInfo.payload.bodyUrl)
            .then(response => response.json())
            .then(blocks => this.props.vm.shareBlocksToTarget(blocks, this.props.vm.editingTarget.id))
            .then(() => {
                this.props.vm.refreshWorkspace();
                this.updateToolbox(); // To show new variables/custom blocks
            });
    }
    clickDirBtn (dir) {
        const ele = document.getElementsByClassName('blocklyToolboxDiv')[0];
        if (dir === 'up') {
            ele.scrollTop -= 100;

        } else {
            ele.scrollTop += 100;
        }
    }
    render () {
        /* eslint-disable no-unused-vars */
        const {
            anyModalVisible,
            canUseCloud,
            customProceduresVisible,
            extensionLibraryVisible,
            options,
            stageSize,
            vm,
            isRtl,
            isVisible,
            onActivateColorPicker,
            onOpenConnectionModal,
            onOpenSoundRecorder,
            updateToolboxState,
            onActivateCustomProcedures,
            onRequestCloseExtensionLibrary,
            onRequestCloseCustomProcedures,
            toolboxXML,
            updateMetrics: updateMetricsProp,
            workspaceMetrics,
            autoClose,
            setAutoClose,
            setVisible,
            isStageHidden,
            ...props
        } = this.props;
        /* eslint-enable no-unused-vars */
        return (
            <React.Fragment>
                <AutoClose></AutoClose>
                <img
                    hidden
                    className={
                        classNames(styles.dirBtn, styles.upBtn)
                    }
                    onClick={this.clickDirBtn.bind(this, 'up')}
                    src={require('../assets/icons/clist_up.png')}
                ></img>
                <img
                    hidden
                    className={
                        classNames(styles.dirBtn, styles.downBtn)
                    }
                    onClick={this.clickDirBtn.bind(this, 'down')}
                    src={require('../assets/icons/clist_down.png')}
                ></img>
                <DroppableBlocks
                    componentRef={this.setBlocks}
                    onDrop={this.handleDrop}
                    {...props}
                />

                {this.state.prompt ? (
                    <Prompt
                        defaultValue={this.state.prompt.defaultValue}
                        isStage={vm.runtime.getEditingTarget().isStage}
                        label={this.state.prompt.message}
                        showCloudOption={this.state.prompt.showCloudOption}
                        showVariableOptions={this.state.prompt.showVariableOptions}
                        title={this.state.prompt.title}
                        vm={vm}
                        onCancel={this.handlePromptClose}
                        onOk={this.handlePromptCallback}
                    />
                ) : null}
                {extensionLibraryVisible ? (
                    <ExtensionLibrary
                        vm={vm}
                        onCategorySelected={this.handleCategorySelected}
                        onRequestClose={onRequestCloseExtensionLibrary}
                    />
                ) : null}
                {customProceduresVisible ? (
                    <CustomProcedures
                        options={{
                            media: options.media
                        }}
                        onRequestClose={this.handleCustomProceduresClose}
                    />
                ) : null}
            </React.Fragment>
        );
    }
}

Blocks.propTypes = {
    anyModalVisible: PropTypes.bool,
    canUseCloud: PropTypes.bool,
    customProceduresVisible: PropTypes.bool,
    extensionLibraryVisible: PropTypes.bool,
    isRtl: PropTypes.bool,
    isVisible: PropTypes.bool,
    locale: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    messages: PropTypes.object,
    onActivateColorPicker: PropTypes.func,
    onActivateCustomProcedures: PropTypes.func,
    onOpenConnectionModal: PropTypes.func,
    onOpenSoundRecorder: PropTypes.func,
    onRequestCloseCustomProcedures: PropTypes.func,
    onRequestCloseExtensionLibrary: PropTypes.func,
    options: PropTypes.shape({
        media: PropTypes.string,
        zoom: PropTypes.shape({
            controls: PropTypes.bool,
            wheel: PropTypes.bool,
            startScale: PropTypes.number
        }),
        colours: PropTypes.shape({
            workspace: PropTypes.string,
            flyout: PropTypes.string,
            toolbox: PropTypes.string,
            toolboxSelected: PropTypes.string,
            scrollbar: PropTypes.string,
            scrollbarHover: PropTypes.string,
            insertionMarker: PropTypes.string,
            insertionMarkerOpacity: PropTypes.number,
            fieldShadow: PropTypes.string,
            dragShadowOpacity: PropTypes.number
        }),
        comments: PropTypes.bool,
        collapse: PropTypes.bool
    }),
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    toolboxXML: PropTypes.string,
    updateMetrics: PropTypes.func,
    updateToolboxState: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired,
    workspaceMetrics: PropTypes.shape({
        targets: PropTypes.objectOf(PropTypes.object)
    }),
    autoClose: PropTypes.bool,
    setAutoClose: PropTypes.func,
    setVisible: PropTypes.func,
    isStageHidden: PropTypes.bool,
};

Blocks.defaultOptions = {
    zoom: {
        controls: true,
        wheel: true,
        startScale: BLOCKS_DEFAULT_SCALE
    },
    grid: {
        spacing: 40,
        length: 2,
        colour: '#ddd'
    },
    colours: {
        workspace: '#F9F9F9',
        flyout: '#F9F9F9',
        toolbox: '#FFFFFF',
        toolboxSelected: '#E9EEF2',
        scrollbar: '#CECDCE',
        scrollbarHover: '#CECDCE',
        insertionMarker: '#000000',
        insertionMarkerOpacity: 0.2,
        fieldShadow: 'rgba(255, 255, 255, 0.3)',
        dragShadowOpacity: 0.6
    },
    comments: true,
    collapse: false,
    sounds: false
};

Blocks.defaultProps = {
    isVisible: true,
    options: Blocks.defaultOptions
};

const mapStateToProps = state => ({
    anyModalVisible: (
        Object.keys(state.scratchGui.modals).some(key => state.scratchGui.modals[key]) ||
        state.scratchGui.stageSize.isFullScreen
    ),
    extensionLibraryVisible: state.scratchGui.modals.extensionLibrary,
    isRtl: state.locales.isRtl,
    locale: state.locales.locale,
    messages: state.locales.messages,
    toolboxXML: state.scratchGui.toolbox.toolboxXML,
    customProceduresVisible: state.scratchGui.customProcedures.active,
    workspaceMetrics: state.scratchGui.workspaceMetrics,
    autoClose: state.scratchGui.autoClose.autoClose,
    isStageHidden: state.scratchGui.mode.isStageHidden,
});

const mapDispatchToProps = dispatch => ({
    onActivateColorPicker: callback => dispatch(activateColorPicker(callback)),
    onActivateCustomProcedures: (data, callback) => dispatch(activateCustomProcedures(data, callback)),
    onOpenConnectionModal: id => {
        console.log('id:', id);
        dispatch(setConnectionModalExtensionId(id));
        dispatch(openConnectionModal());
    },
    onOpenSoundRecorder: () => {
        dispatch(activateTab(SOUNDS_TAB_INDEX));
        dispatch(openSoundRecorder());
    },
    onRequestCloseExtensionLibrary: () => {
        dispatch(closeExtensionLibrary());
    },
    onRequestCloseCustomProcedures: data => {
        dispatch(deactivateCustomProcedures(data));
    },
    updateToolboxState: toolboxXML => {
        dispatch(updateToolbox(toolboxXML));
    },
    updateMetrics: metrics => {
        dispatch(updateMetrics(metrics));
    },
    setAutoClose: autoClose => dispatch(setAutoClose(autoClose)),
    setVisible: isVisible => dispatch(setVisible(isVisible)),
});

export default errorBoundaryHOC('Blocks')(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Blocks)
);
