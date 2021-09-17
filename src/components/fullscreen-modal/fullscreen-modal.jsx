import PropTypes from 'prop-types';
import React from 'react';
import ReactModal from 'react-modal';
import {connect} from 'react-redux';
import StageWrapper from '../../containers/stage-wrapper.jsx';
import TaskBar from '../taskBar/index.jsx';
import ErrorTips from '../errorTips/index.jsx';
import Box from '../box/box.jsx';
import classNames from 'classnames';
import VM from 'scratch-vm';
import styles from './fullscreen-modal.css';
import bindAll from 'lodash.bindall';
import {setStage} from '../../reducers/mode.js';
import closeIcon from './icon--close.svg';


class FullScreenComponent extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClose',
        ]);
        this.state = {
        };
    }
    handleClose (){
        // window.dispatchEvent(new Event('libraryBack'));
        // this.props.onRequestClose();
        this.props.onSetStageFull(false);
    }
    render () {
        const {
            isFullScreen,
            isRendererSupported,
            isRtl,
            vm,
            stageSize,
            onStartSelectingFileUpload,
            errorText,
            showErrorTips,
            setProjectTitle,
            onProjectTelemetryEvent,
            isStageFullScreen,
            ...boxProps
        } = this.props;
        return (
            <ReactModal
                isOpen={isStageFullScreen}
                className={classNames(styles.modalContent, styles.fullScreenModal
                )}
                overlayClassName={styles.modalOverlay}
                contentLabel={''}
            >
                <img
                    src={closeIcon}
                    className={classNames(styles.closeIcon)}
                    onClick={this.handleClose}
                />
                <Box
                    className={
                        classNames(
                            styles.stageAndTargetWrapper,
                            styles[stageSize]
                        )
                    }
                >
                    {/* 任务栏 */}
                    <TaskBar
                        isStageFullScreen={isStageFullScreen}
                        onProjectTelemetryEvent={onProjectTelemetryEvent}
                        onStartSelectingFileUpload={onStartSelectingFileUpload}
                    ></TaskBar>
                    {showErrorTips && <div
                        className={styles.errorTips}
                    >
                        <ErrorTips
                            text={errorText}
                        ></ErrorTips>
                    </div>}

                    <StageWrapper
                        isFullScreen={isFullScreen}
                        isStageFullScreen={isStageFullScreen}
                        isRendererSupported={isRendererSupported}
                        isRtl={isRtl}
                        stageSize={stageSize}
                        vm={vm}
                    />
                    {showErrorTips && <div className={styles.warningBorder}></div>}
                </Box>
            </ReactModal>);
    }
}

FullScreenComponent.propTypes = {
    isFullScreen: PropTypes.bool,
    isRendererSupported: PropTypes.bool,
    isRtl: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired,
    stageSize: PropTypes.string,
    onStartSelectingFileUpload: PropTypes.func,
    errorText: PropTypes.string,
    showErrorTips: PropTypes.bool,
    isStageFullScreen: PropTypes.bool,
    setProjectTitle: PropTypes.func,
    onProjectTelemetryEvent: PropTypes.func,
    onSetStageFull: PropTypes.func.isRequired
};
const mapStateToProps = state => ({
    isStageFullScreen: state.scratchGui.mode.isStageFullScreen
});

const mapDispatchToProps = dispatch => ({
    onSetStageFull: () => dispatch(setStage(false))
});

export default connect(mapStateToProps, mapDispatchToProps)(FullScreenComponent);
