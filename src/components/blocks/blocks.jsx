import PropTypes from 'prop-types';
import classNames from 'classnames';
import React from 'react';
import Box from '../box/box.jsx';
import styles from './blocks.css';
import AsideBtnMenu from '../asidebtn-menu/asidebtn-menu.jsx';
import iconDelete from './icon-delete.svg';

const BlocksComponent = props => {
    const {
        containerRef,
        dragOver,
        ...componentProps
    } = props;
    return (
        <Box
            className={classNames(styles.blocks, {
                [styles.dragOver]: dragOver
            })}
            {...componentProps}
            componentRef={containerRef}
        >
            <div
                id="toolboxTrashcan"
                className={styles.trashcanInitStyle}
            >
                <img
                    src={iconDelete}
                    className={styles.trashcanImg}
                />
            </div>
            <AsideBtnMenu />
        </Box>
    );
};
BlocksComponent.propTypes = {
    containerRef: PropTypes.func,
    dragOver: PropTypes.bool
};
export default BlocksComponent;
