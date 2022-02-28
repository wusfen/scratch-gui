import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {connect} from 'react-redux';

import RunningComponent from '../components/running/index.jsx';

class Running extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleGreenFlagClick',
            'handleStopAllClick'
        ]);
    }

    componentDidMount () {
        // 监听代码运行正确
        window.addEventListener('codeRunningRight', this.handleCodeRunningRight);
    }

    componentWillUnmount () {
        window.removeEventListener('codeRunningRight', this.handleCodeRunningRight);
    }

    handleCodeRunningRight () {
        window.codeRunningResult = 1;
    }

    handleGreenFlagClick (e) {
        e.preventDefault();
        if (e.shiftKey) {
            this.props.vm.setTurboMode(!this.props.turbo);
        } else {
            if (!this.props.isStarted) {
                window.alreadyRunCode = true; // 记录已经点击过开始
                this.props.vm.start();
            }
            this.props.vm.greenFlag();
        }
    }
    handleStopAllClick (e) {
        e.preventDefault();
        this.props.vm.stopAll();
    }
    render () {
        const {
            isStarted, // eslint-disable-line no-unused-vars
            projectRunning,
            turbo,
            ...props
        } = this.props;

        // TODO
        if (projectRunning) {
            dispatchEvent(new Event('projectRunning'));
        } else {
            console.log('projectRunFinish');
            dispatchEvent(new Event('projectRunFinish'));
        }
        return (
            <RunningComponent
                {...props}
                active={projectRunning}
                turbo={turbo}
                onGreenFlagClick={this.handleGreenFlagClick}
                onStopAllClick={this.handleStopAllClick}
            />
        );
    }
}

Running.propTypes = {
    isStarted: PropTypes.bool.isRequired,
    projectRunning: PropTypes.bool.isRequired,
    turbo: PropTypes.bool.isRequired,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({
    isStarted: state.scratchGui.vmStatus.running,
    projectRunning: state.scratchGui.vmStatus.running,
    turbo: state.scratchGui.vmStatus.turbo,
    isFullScreen: state.scratchGui.mode.isFullScreen,
});
// no-op function to prevent dispatch prop being passed to component
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Running);
