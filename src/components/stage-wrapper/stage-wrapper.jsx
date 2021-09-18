import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import VM from 'scratch-vm';

import Box from '../box/box.jsx';
import {STAGE_DISPLAY_SIZES} from '../../lib/layout-constants.js';
import StageHeader from '../../containers/stage-header.jsx';
import Stage from '../../containers/stage.jsx';
import Loader from '../loader/loader.jsx';
import {setStage} from '../../reducers/mode.js';
import closeIcon from './icon--close.svg';
import {connect} from 'react-redux';

import styles from './stage-wrapper.css';

const StageWrapperComponent = function (props) {
    const {
        isFullScreen,
        isPlayerOnly,
        isRtl,
        isRendererSupported,
        isStageFullScreen,
        loading,
        stageSize,
        onSetStageFull,
        vm
    } = props;

    const handleClose = () => {
        onSetStageFull(false);
    };

    return (
        <Box
            className={classNames(
                styles.stageWrapper,
                {[styles.fullScreen]: isFullScreen,
                    [styles.satgeFull]: isStageFullScreen}
            )}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            <Box className={styles.stageCanvasWrapper}>
                {
                    isRendererSupported ?
                        <Stage
                            isPlayerOnly={isPlayerOnly}
                            stageSize={stageSize}
                            vm={vm}
                        /> :
                        null
                }
            </Box>
            <Box className={styles.stageMenuWrapper}>
                <StageHeader
                    stageSize={stageSize}
                    vm={vm}
                />
            </Box>
            {loading ? (
                <Loader
                    isFullScreen={isFullScreen}
                    isPlayerOnly={isPlayerOnly}
                />
            ) : null}
            {/* 全屏的时候添加关闭按钮 */}
            { isStageFullScreen ? <img
                src={closeIcon}
                className={classNames(styles.closeIcon)}
                onClick={handleClose}
            /> : null}
        </Box>
    );
};

StageWrapperComponent.propTypes = {
    isFullScreen: PropTypes.bool,
    isPlayerOnly: PropTypes.bool,
    isStageFullScreen: PropTypes.bool,
    onSetStageFull: PropTypes.func.isRequired,
    isRendererSupported: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    loading: PropTypes.bool,
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    vm: PropTypes.instanceOf(VM).isRequired
};


const mapStateToProps = state => ({
    isStageFullScreen: state.scratchGui.mode.isStageFullScreen
});

const mapDispatchToProps = dispatch => ({
    onSetStageFull: () => dispatch(setStage(false))
});

export default connect(mapStateToProps, mapDispatchToProps)(StageWrapperComponent);
