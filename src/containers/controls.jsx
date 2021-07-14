import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {connect} from 'react-redux';

import ControlsComponent from '../components/controls/controls.jsx';
import startBgS from '../assets/sounds/begin.mp3';

class Controls extends React.Component {
    constructor (props) {
        super(props);
        this.state = this.getInitState();
        bindAll(this, [
            'handleGreenFlagClick',
            'handleStopAllClick'
        ]);
        this.setOnNativeCallJsInWindow();
        

        this.initGuide();
    }
    playSound () {
        var _audio = new Audio(startBgS);
        _audio.play(); // 播放 mp3这个音频对象
    }
    
    getInitState () {
        return {
            guide: false,
        };
    }
    initGuide () {
        this.setState({
            guide: false
        });
        addEventListener('超过60秒无操作', e => {
            // 显示引导提示
            if (String(e.type) === '超过60秒无操作') {
                // 处理
                this.playSound();
                this.setState({
                    guide: true
                });
            }
        });
    }

    setOnNativeCallJsInWindow () {
        window.onNativeCallJs = mess => {
            console.log('onNativeCallJs params---', mess);
            try {
                const code = mess.code;
                const data = mess.data;
                switch (code) {
                case 1:
                    // 1：生命周期协议
                    var life = data.lifecycle;
                    if (life === 'onPause') {
                        // webview页面暂停，即将进入后台
                        console.log('to stop');
                        this.props.vm.stopAll();
                    } else if (life === 'onResume') {
                        // webview页面即将进入前台
                        console.log('to start');
                        this.props.vm.start();
                    }
                    break;
                default:
                    break;
                }
            } catch (error) {
                console.error('onNativeCallJs error---', error);
            }
        };
    }

    handleGreenFlagClick (e) {
        e.preventDefault();
        if (e.shiftKey) {
            this.props.vm.setTurboMode(!this.props.turbo);
        } else {
            if (!this.props.isStarted) {
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
            vm, // eslint-disable-line no-unused-vars
            isStarted, // eslint-disable-line no-unused-vars
            projectRunning,
            turbo,
            ...props
        } = this.props;
        return (
            <ControlsComponent
                {...props}
                guide={this.state.guide}
                active={projectRunning}
                turbo={turbo}
                onGreenFlagClick={this.handleGreenFlagClick}
                onStopAllClick={this.handleStopAllClick}
            />
        );
    }
}

Controls.propTypes = {
    isStarted: PropTypes.bool.isRequired,
    projectRunning: PropTypes.bool.isRequired,
    turbo: PropTypes.bool.isRequired,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({
    isStarted: state.scratchGui.vmStatus.running,
    projectRunning: state.scratchGui.vmStatus.running,
    turbo: state.scratchGui.vmStatus.turbo
});
// no-op function to prevent dispatch prop being passed to component
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
