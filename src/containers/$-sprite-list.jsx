// copy from containers/target-pane.jsx

import bindAll from 'lodash.bindall';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {intlShape, injectIntl} from 'react-intl';
import Dialog from '../components/dialog/index.jsx';

import {
    openSpriteLibrary,
    closeSpriteLibrary
} from '../reducers/modals';
import {activateTab, COSTUMES_TAB_INDEX, BLOCKS_TAB_INDEX} from '../reducers/editor-tab';
import {setReceivedBlocks} from '../reducers/hovered-target';
import {showStandardAlert, closeAlertWithId} from '../reducers/alerts';
import {setRestore} from '../reducers/restore-deletion';
import DragConstants from '../lib/drag-constants';
import TargetPaneComponent from '../components/target-pane/target-pane.jsx';
import {BLOCKS_DEFAULT_SCALE} from '../lib/layout-constants';
import spriteLibraryContent from '../lib/libraries/wandou/sprites.js';
import {handleFileUpload, spriteUpload} from '../lib/file-uploader.js';
import sharedMessages from '../lib/shared-messages';
import {emptySprite} from '../lib/empty-assets';
import {highlightTarget} from '../reducers/targets';
import {fetchSprite, fetchCode} from '../lib/backpack-api';
import randomizeSpritePosition from '../lib/randomize-sprite-position';
import downloadBlob from '../lib/download-blob';

import classNames from 'classnames';
import SpriteList from '../components/sprite-selector/sprite-list.jsx';
import styles from './$-sprite-list.css';

import StageSelector from '../containers/stage-selector.jsx';
import Scroll from '../components/scroll/index.jsx';

class TargetPane$ extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleActivateBlocksTab',
            'handleBlockDragEnd',
            'handleChangeSpriteRotationStyle',
            'handleChangeSpriteDirection',
            'handleChangeSpriteName',
            'handleChangeSpriteSize',
            'handleChangeSpriteVisibility',
            'handleChangeSpriteX',
            'handleChangeSpriteY',
            'handleDeleteSprite',
            'handleDrop',
            'handleDuplicateSprite',
            'handleExportSprite',
            'handleNewSprite',
            'handleSelectSprite',
            'handleSurpriseSpriteClick',
            'handlePaintSpriteClick',
            'handleFileUploadClick',
            'handleSpriteUpload',
            'setFileInput',
            'deleteSprite'
        ]);
    }
    componentDidMount () {
        this.props.vm.addListener('BLOCK_DRAG_END', this.handleBlockDragEnd);
    }
    componentWillUnmount () {
        this.props.vm.removeListener('BLOCK_DRAG_END', this.handleBlockDragEnd);
    }
    handleChangeSpriteDirection (direction) {
        this.props.vm.postSpriteInfo({direction});
    }
    handleChangeSpriteRotationStyle (rotationStyle) {
        this.props.vm.postSpriteInfo({rotationStyle});
    }
    handleChangeSpriteName (name) {
        this.props.vm.renameSprite(this.props.editingTarget, name);
    }
    handleChangeSpriteSize (size) {
        this.props.vm.postSpriteInfo({size});
    }
    handleChangeSpriteVisibility (visible) {
        this.props.vm.postSpriteInfo({visible});
    }
    handleChangeSpriteX (x) {
        this.props.vm.postSpriteInfo({x});
    }
    handleChangeSpriteY (y) {
        this.props.vm.postSpriteInfo({y});
    }
    handleDeleteSprite (id) {
        var curTarget;
        for (var i = 0; i < this.props.vm.runtime.targets.length; i++) {
            if (this.props.vm.runtime.targets[i].id === id) {
                curTarget = this.props.vm.runtime.targets[i];
            }

        }

        if (curTarget && curTarget.hidden) {
            Dialog.confirm({
                title: '求求你，别删我',
                content: '小朋友，想要完成这次任务，可不能丢下我哦！'
            });
            return;
        }

        if (Object.keys(curTarget?.sprite?.blocks?._blocks).length) { // 有积木的角色，增加删除确认框
            Dialog.confirm({
                title: '删除确认',
                content: '删除角色之后，角色内的积木也会被同时删除哦，是否确定删除？',
                onCancel: () => {

                },
                onConfirm: () => {
                    this.deleteSprite(id);
                },
            });
        } else {
            this.deleteSprite(id);
        }
    }
    deleteSprite (id) {
        const restoreSprite = this.props.vm.deleteSprite(id);
        const restoreFun = () => restoreSprite().then(this.handleActivateBlocksTab);

        this.props.dispatchUpdateRestore({
            restoreFun: restoreFun,
            deletedItem: 'Sprite'
        });
    }
    handleDuplicateSprite (id) {
        this.props.vm.duplicateSprite(id);
    }
    handleExportSprite (id) {
        const spriteName = this.props.vm.runtime.getTargetById(id).getName();
        const saveLink = document.createElement('a');
        document.body.appendChild(saveLink);

        this.props.vm.exportSprite(id).then(content => {
            downloadBlob(`${spriteName}.sprite3`, content);
        });
    }
    handleSelectSprite (id) {
        // debugger
        this.props.vm.setEditingTarget(id);
        if (this.props.stage && id !== this.props.stage.id) {
            this.props.onHighlightTarget(id);
            // setTimeout(() => {
            //     Blockly.getMainWorkspace().getFlyout().setVisible(false)
            //     Blockly.getMainWorkspace().getFlyout().getWorkspace().setVisible(false)
            // }, 1);
        }
        window.dispatchEvent(new Event('selectSprite'));
        document.querySelector('[role="tablist"]').children[0].click();
    }
    handleSurpriseSpriteClick () {
        const surpriseSprites = spriteLibraryContent.filter(sprite =>
            (sprite.tags.indexOf('letters') === -1) && (sprite.tags.indexOf('numbers') === -1)
        );
        const item = surpriseSprites[Math.floor(Math.random() * surpriseSprites.length)];
        randomizeSpritePosition(item);
        this.props.vm.addSprite(JSON.stringify(item))
            .then(this.handleActivateBlocksTab);
    }
    handlePaintSpriteClick () {
        const formatMessage = this.props.intl.formatMessage;
        const emptyItem = emptySprite(
            formatMessage(sharedMessages.sprite, {index: 1}),
            formatMessage(sharedMessages.pop),
            formatMessage(sharedMessages.costume, {index: 1})
        );
        this.props.vm.addSprite(JSON.stringify(emptyItem)).then(() => {
            setTimeout(() => { // Wait for targets update to propagate before tab switching
                this.props.onActivateTab(COSTUMES_TAB_INDEX);
            });
        });
    }
    handleActivateBlocksTab () {
        this.props.onActivateTab(BLOCKS_TAB_INDEX);
    }
    handleNewSprite (spriteJSONString) {
        return this.props.vm.addSprite(spriteJSONString)
            .then(this.handleActivateBlocksTab);
    }
    handleFileUploadClick () {
        this.fileInput.click();
    }
    handleSpriteUpload (e) {
        const storage = this.props.vm.runtime.storage;
        this.props.onShowImporting();
        handleFileUpload(e.target, (buffer, fileType, fileName, fileIndex, fileCount) => {
            spriteUpload(buffer, fileType, fileName, storage, newSprite => {
                this.handleNewSprite(newSprite)
                    .then(() => {
                        if (fileIndex === fileCount - 1) {
                            this.props.onCloseImporting();
                        }
                    })
                    .catch(this.props.onCloseImporting);
            }, this.props.onCloseImporting);
        }, this.props.onCloseImporting);
    }
    setFileInput (input) {
        this.fileInput = input;
    }
    handleBlockDragEnd (blocks) {
        if (this.props.hoveredTarget.sprite && this.props.hoveredTarget.sprite !== this.props.editingTarget) {
            this.shareBlocks(blocks, this.props.hoveredTarget.sprite, this.props.editingTarget);
            this.props.onReceivedBlocks(true);
        }
    }
    shareBlocks (blocks, targetId, optFromTargetId) {
        debugger
        // Position the top-level block based on the scroll position.
        const topBlock = blocks.find(block => block.topLevel);
        if (topBlock) {
            let metrics;
            if (this.props.workspaceMetrics.targets[targetId]) {
                metrics = this.props.workspaceMetrics.targets[targetId];
            } else {
                metrics = {
                    scrollX: 0,
                    scrollY: 0,
                    scale: BLOCKS_DEFAULT_SCALE
                };
            }

            // Determine position of the top-level block based on the target's workspace metrics.
            const {scrollX, scrollY, scale} = metrics;
            const posY = -scrollY + 30;
            let posX;
            if (this.props.isRtl) {
                posX = scrollX + 30;
            } else {
                posX = -scrollX + 30;
            }

            // Actually apply the position!
            topBlock.x = posX / scale;
            topBlock.y = posY / scale;
        }

        return this.props.vm.shareBlocksToTarget(blocks, targetId, optFromTargetId);
    }
    handleDrop (dragInfo) {
        const {sprite: targetId} = this.props.hoveredTarget;
        if (dragInfo.dragType === DragConstants.SPRITE) {
            // Add one to both new and target index because we are not counting/moving the stage
            this.props.vm.reorderTarget(dragInfo.index + 1, dragInfo.newIndex + 1);
        } else if (dragInfo.dragType === DragConstants.BACKPACK_SPRITE) {
            // TODO storage does not have a way of loading zips right now, and may never need it.
            // So for now just grab the zip manually.
            fetchSprite(dragInfo.payload.bodyUrl)
                .then(sprite3Zip => this.props.vm.addSprite(sprite3Zip));
        } else if (targetId) {
            // Something is being dragged over one of the sprite tiles or the backdrop.
            // Dropping assets like sounds and costumes duplicate the asset on the
            // hovered target. Shared costumes also become the current costume on that target.
            // However, dropping does not switch the editing target or activate that editor tab.
            // This is based on 2.0 behavior, but seems like it keeps confusing switching to a minimum.
            // it allows the user to share multiple things without switching back and forth.
            if (dragInfo.dragType === DragConstants.COSTUME) {
                this.props.vm.shareCostumeToTarget(dragInfo.index, targetId);
            } else if (targetId && dragInfo.dragType === DragConstants.SOUND) {
                this.props.vm.shareSoundToTarget(dragInfo.index, targetId);
            } else if (dragInfo.dragType === DragConstants.BACKPACK_COSTUME) {
                // In scratch 2, this only creates a new sprite from the costume.
                // We may be able to handle both kinds of drops, depending on where
                // the drop happens. For now, just add the costume.
                this.props.vm.addCostume(dragInfo.payload.body, {
                    name: dragInfo.payload.name
                }, targetId);
            } else if (dragInfo.dragType === DragConstants.BACKPACK_SOUND) {
                this.props.vm.addSound({
                    md5: dragInfo.payload.body,
                    name: dragInfo.payload.name
                }, targetId);
            } else if (dragInfo.dragType === DragConstants.BACKPACK_CODE) {
                fetchCode(dragInfo.payload.bodyUrl)
                    .then(blocks => this.shareBlocks(blocks, targetId))
                    .then(() => this.props.vm.refreshWorkspace());
            }
        }
    }
    clickDirBtn (dir) {

        // const ele = document.getElementsByClassName('sprite-selector_scroll-wrapper_3qlZ7 box_box_tWy-0')[0];
        const ele = document.getElementById('spriteList');
        if (dir == 'up') {
            ele.scrollTop -= 100;

        } else {
            ele.scrollTop += 100;
        }
    }

    _filterSprite (sprite){
        const name = sprite.name;
        return !(name.indexOf('#') === 0 && name.length - 1 === name.indexOf('*'));
    }

    render () {
        /* eslint-disable no-unused-vars */
        const {
            editingTarget,
            fileInputRef,
            hoveredTarget,
            spriteLibraryVisible,
            onActivateBlocksTab,
            onChangeSpriteDirection,
            onChangeSpriteName,
            onChangeSpriteRotationStyle,
            onChangeSpriteSize,
            onChangeSpriteVisibility,
            onChangeSpriteX,
            onChangeSpriteY,
            onDeleteSprite,
            onDrop,
            onDuplicateSprite,
            onExportSprite,
            onFileUploadClick,
            onNewSpriteClick,
            onPaintSpriteClick,
            onRequestCloseSpriteLibrary,
            onSelectSprite,
            onSpriteUpload,
            onSurpriseSpriteClick,
            raiseSprites,
            stage,
            stageSize,
            sprites,

            dispatchUpdateRestore,
            onActivateTab,
            onCloseImporting,
            onHighlightTarget,
            onReceivedBlocks,
            onShowImporting,
            workspaceMetrics,
            ...componentProps
        } = this.props;
        /* eslint-disable no-unused-vars, max-len */
        const items = window.MODE === 'teacher' ? Object.values(sprites) : Object.values(sprites).filter(this._filterSprite);
        if (stage.id !== editingTarget){
            let selectChange = true;
            for (const item of items){
                if (editingTarget === item.id){
                    selectChange = false;
                    break;
                }
            }
            if (selectChange){
                setTimeout(() => {
                    this.handleSelectSprite(items.length > 0 ? items[0].id : stage.id);
                });
            }
        }
        return (
            <div
                className={
                    classNames(styles.list)
                }
            >
                <StageSelector
                    asset={
                        stage.costume &&
                        stage.costume.asset
                    }
                    backdropCount={stage.costumeCount || 0}
                    id={stage.id}
                    selected={stage.id === editingTarget}
                    onSelect={this.handleSelectSprite}
                />
                <Scroll>
                    <SpriteList
                        editingTarget={editingTarget}
                        hoveredTarget={hoveredTarget}
                        items={items}
                        raised={raiseSprites}
                        selectedId={editingTarget}
                        onDeleteSprite={this.handleDeleteSprite}
                        onDrop={this.handleDrop}
                        onDuplicateSprite={this.handleDuplicateSprite}
                        onExportSprite={this.handleExportSprite}
                        onSelectSprite={this.handleSelectSprite}
                    />
                </Scroll>
            </div>

        );
    }
}

const {
    onSelectSprite, // eslint-disable-line no-unused-vars
    onActivateBlocksTab, // eslint-disable-line no-unused-vars
    ...targetPaneProps
} = TargetPaneComponent.propTypes;

TargetPane$.propTypes = {
    intl: intlShape.isRequired,
    onCloseImporting: PropTypes.func,
    onShowImporting: PropTypes.func,
    ...targetPaneProps
};

const mapStateToProps = state => ({
    editingTarget: state.scratchGui.targets.editingTarget,
    hoveredTarget: state.scratchGui.hoveredTarget,
    isRtl: state.locales.isRtl,
    spriteLibraryVisible: state.scratchGui.modals.spriteLibrary,
    sprites: state.scratchGui.targets.sprites,
    stage: state.scratchGui.targets.stage,
    raiseSprites: state.scratchGui.blockDrag,
    workspaceMetrics: state.scratchGui.workspaceMetrics
});

const mapDispatchToProps = dispatch => ({
    onNewSpriteClick: e => {
        e.preventDefault();
        window.dispatchEvent(new Event('onNewSpriteClick'));
        dispatch(openSpriteLibrary());
    },
    onRequestCloseSpriteLibrary: () => {
        dispatch(closeSpriteLibrary());
    },
    onActivateTab: tabIndex => {
        dispatch(activateTab(tabIndex));
    },
    onReceivedBlocks: receivedBlocks => {
        dispatch(setReceivedBlocks(receivedBlocks));
    },
    dispatchUpdateRestore: restoreState => {
        dispatch(setRestore(restoreState));
    },
    onHighlightTarget: id => {
        dispatch(highlightTarget(id));
    },
    onCloseImporting: () => dispatch(closeAlertWithId('importingAsset')),
    onShowImporting: () => dispatch(showStandardAlert('importingAsset'))
});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(TargetPane$));
