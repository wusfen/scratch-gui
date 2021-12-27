import PropTypes from 'prop-types';
import React from 'react';

import styles from './watermark.css';

const Watermark = props => (
    <img
        className={styles.spriteImage}
        src={props.costumeURL}
        onLoad={props.onImgLoad}
    />
);

Watermark.propTypes = {
    costumeURL: PropTypes.string,
    onImgLoad: PropTypes.func,
};

export default Watermark;
