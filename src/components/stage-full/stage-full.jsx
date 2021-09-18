import PropTypes from 'prop-types';
import React from 'react';
import ReactModal from 'react-modal';
import {connect} from 'react-redux';
import Box from '../box/box.jsx';
import classNames from 'classnames';
import VM from 'scratch-vm';
import styles from './stage-full.css';


class FullScreenComponent extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
        };
    }
    render () {
        const {
            stageSize,
            isStageFullScreen,
            ...boxProps
        } = this.props;
        return (
            <ReactModal
                isOpen={isStageFullScreen}
                className={classNames(styles.modalContent, styles.fullScreenModal, styles[stageSize]
                )}
                overlayClassName={styles.modalOverlay}
                contentLabel={''}
            >
                <Box
                    className={
                        classNames(
                            styles.stageAndTargetWrapper,
                            styles[stageSize]
                        )
                    }
                >
                </Box>
            </ReactModal>);
    }
}

FullScreenComponent.propTypes = {
    vm: PropTypes.instanceOf(VM).isRequired,
    stageSize: PropTypes.string,
    isStageFullScreen: PropTypes.bool,
};
const mapStateToProps = state => ({
    isStageFullScreen: state.scratchGui.mode.isStageFullScreen
});


export default connect(mapStateToProps)(FullScreenComponent);
