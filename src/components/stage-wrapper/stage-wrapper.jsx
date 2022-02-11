import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import VM from 'scratch-vm';

import Box from '../box/box.jsx';
import {STAGE_DISPLAY_SIZES, STAGE_SIZE_MODES} from '../../lib/layout-constants.js';
import StageHeader from '../../containers/stage-header.jsx';
import Stage from '../../containers/stage.jsx';
import Loader from '../loader/loader.jsx';

import styles from './stage-wrapper.css';

let isLoaded = false;

const StageWrapperComponent = function (props) {
    const {
        isFullScreen,
        isPlayerOnly,
        isRtl,
        isRendererSupported,
        loading,
        stageSize,
        stageMode,
        vm
    } = props;
    if (!loading && !isLoaded){
        isLoaded = true;
        window.bridge.emit('ready');
    }

    return (
        <Box
            className={classNames(
                {[styles.stageWrapper]: !isPlayerOnly},
                {[styles.fullScreen]: isFullScreen}
            )}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            <Box
                className={styles.stageCanvasWrapper}
                id="stageCanvasWrapper"
            >
                {
                    isRendererSupported ?
                        <Stage
                            isPlayerOnly={isPlayerOnly}
                            stageSize={stageSize}
                            stageMode={stageMode}
                            vm={vm}
                        /> :
                        null
                }
            </Box>
            {/* <Box className={styles.stageMenuWrapper}>
                <StageHeader
                    stageSize={stageSize}
                    stageMode={stageMode}
                    vm={vm}
                />
            </Box> */}
            {loading ? (
                <Loader
                    isFullScreen={isFullScreen}
                    isPlayerOnly={isPlayerOnly}
                />
            ) : null}
        </Box>
    );
};

StageWrapperComponent.propTypes = {
    isFullScreen: PropTypes.bool,
    isPlayerOnly: PropTypes.bool,
    isRendererSupported: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    loading: PropTypes.bool,
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    stageMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)).isRequired,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default StageWrapperComponent;
