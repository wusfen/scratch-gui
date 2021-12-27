import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './sprite-selector-item.css';
import {ContextMenuTrigger} from 'react-contextmenu';
import {DangerousMenuItem, ContextMenu, MenuItem} from '../context-menu/context-menu.jsx';
import {FormattedMessage} from 'react-intl';

// react-contextmenu requires unique id to match trigger and context menu
let contextMenuId = 0;

const SpriteSelectorItem = props => {
    let isClickEdit = false;
    return (<ContextMenuTrigger
        attributes={{
            className: classNames(props.className, styles.spriteSelectorItem, {
                [styles.isSelected]: props.selected,
                [styles.isEditSpace]: props.isEditSpace || false
            }),
            onClick: props.onClick,
            onMouseEnter: props.onMouseEnter,
            onMouseLeave: props.onMouseLeave,
            onMouseDown: props.onMouseDown,
            onTouchStart: props.onMouseDown
        }}
        disable={props.preventContextMenu}
        id={`${props.name}-${contextMenuId}`}
        ref={props.componentRef}
    >
        {typeof props.number === 'undefined' ? null : (
            <div className={styles.number}>{props.number}</div>
        )}
        {props.costumeURL ? (
            <div className={styles.spriteImageOuter}>
                <div className={styles.spriteImageInner}>
                    <img
                        className={styles.spriteImage}
                        draggable={false}
                        src={props.costumeURL}
                        onLoad={props.onImgLoad}
                    />
                </div>
            </div>
        ) : null}
        <div className={styles.spriteInfo}>
            <div className={styles.spriteName}>{props.name}</div>
            {props.details ? (
                <div className={styles.spriteDetails}>{props.details}</div>
            ) : null}
        </div>

        {(props.selected && props.onDeleteButtonClick) ? (
            <section>
                <div
                    className={
                        classNames('play_audio', {
                            [styles.deleteSprite]: true
                        })
                    }
                >
                    <img
                        className={styles.deleteImg}
                        src={require('../../assets/icons/delete.svg')}
                        alt="*"
                        onClick={props.onDeleteButtonClick}
                    />
                </div>

                <div className={styles.editSprite}>
                    <img
                        className={classNames('play_audio', styles.editImg, {
                            [styles.isSelect]: isClickEdit
                        })}
                        src={require('../../assets/icons/triangle.svg')}
                        alt="*"
                        onClick={function (e) {
                            isClickEdit = true;
                            e.stopPropagation();
                            window.dispatchEvent(new Event('editSprite'));
                            document.querySelector('[role="tablist"]').children[1].click();
                        }}
                    />
                </div>
            </section>


        ) : null }

        {props.onDuplicateButtonClick || props.onDeleteButtonClick || props.onExportButtonClick ? (
            <ContextMenu id={`${props.name}-${contextMenuId++}`}>
                {props.onDuplicateButtonClick ? (
                    <MenuItem onClick={props.onDuplicateButtonClick}>
                        <FormattedMessage
                            defaultMessage="duplicate"
                            description="Menu item to duplicate in the right click menu"
                            id="gui.spriteSelectorItem.contextMenuDuplicate"
                        />
                    </MenuItem>
                ) : null}
                {props.onExportButtonClick ? (
                    <MenuItem onClick={props.onExportButtonClick}>
                        <FormattedMessage
                            defaultMessage="export"
                            description="Menu item to export the selected item"
                            id="gui.spriteSelectorItem.contextMenuExport"
                        />
                    </MenuItem>
                ) : null }
                {props.onDeleteButtonClick ? (
                    <DangerousMenuItem onClick={props.onDeleteButtonClick}>
                        <FormattedMessage
                            defaultMessage="delete"
                            description="Menu item to delete in the right click menu"
                            id="gui.spriteSelectorItem.contextMenuDelete"
                        />
                    </DangerousMenuItem>
                ) : null }
            </ContextMenu>
        ) : null}
    </ContextMenuTrigger>);
};

SpriteSelectorItem.propTypes = {
    className: PropTypes.string,
    componentRef: PropTypes.func,
    costumeURL: PropTypes.string,
    details: PropTypes.string,
    name: PropTypes.string.isRequired,
    number: PropTypes.number,
    onClick: PropTypes.func,
    onDeleteButtonClick: PropTypes.func,
    onDuplicateButtonClick: PropTypes.func,
    onExportButtonClick: PropTypes.func,
    onMouseDown: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    preventContextMenu: PropTypes.bool,
    selected: PropTypes.bool.isRequired,
    isEditSpace: PropTypes.bool,
    onImgLoad: PropTypes.func,
};

export default SpriteSelectorItem;
