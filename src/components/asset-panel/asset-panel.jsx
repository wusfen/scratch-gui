import React from 'react';

import Box from '../box/box.jsx';
import Selector from './selector.jsx';
import styles from './asset-panel.css';
import closeBtnIcon from './icon--close-btn.svg';

const AssetPanel = function (props) {
    const {
        onCloseBtn
    } = props;
    return (
        <Box className={styles.wrapper}>
            <Selector
                className={styles.selector}
                {...props}
            />
            <Box className={styles.detailArea}>
                {props.children}
            </Box>
            <img
                src={closeBtnIcon}
                onClick={() => {
                    onCloseBtn();
                }}
                className={styles.closeBtn}
            />
        </Box>
    );
};

AssetPanel.propTypes = {
    ...Selector.propTypes
};

export default AssetPanel;
