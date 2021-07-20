import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {connect} from 'react-redux';

import ControlsComponent from '../components/controls/controls.jsx';
import startBgS from '../assets/sounds/begin.mp3';
import {CODE_TIME_1, timerType} from '../components/timer/data';

import {ajax} from '../lib/ajax.js';

class Controls extends React.Component {
    constructor (props) {
        super(props);
        this.state = this.getInitState();
        bindAll(this, [
            'handleGreenFlagClick',
            'handleStopAllClick'
        ]);

        this.initGuide();

        window.bridge.on('pause', e => {
            props.vm.stopAll();
        });
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
        window.addEventListener(`noAction:${timerType.CODE}:${CODE_TIME_1}`, () => {
            console.log("60秒代码区域无变化")
            // 显示引导提示
            if (!this.state.guide) {
                // 处理
                this.playSound();
                this.setState({
                    guide: true
                });

                setTimeout(() => {
                    this.setState({
                        guide: false
                    });
                }, 13000);

            }
        });
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

        this.checkWork();
    }
    handleStopAllClick (e) {
        e.preventDefault();
        this.props.vm.stopAll();
    }
    async checkWork () {
        if (window._workInfo) {
            var json = this.props.vm.toJSON();
            if (this.lastVmJSON === json) {
                return;
            }
            this.lastVmJSON = json;

            var {data} = await ajax.post('hwUserWork/autoAnalyst', {
                workCode: window._workInfo.workCode,
                projectJsonStr: json,
            });

            if (data == 1) {
                dispatchEvent(new Event('运行时判断正确'));
            } else {
                dispatchEvent(new Event('运行时判断不正确'));
            }
        }

    }
    render () {
        const {
            vm, // eslint-disable-line no-unused-vars
            isStarted, // eslint-disable-line no-unused-vars
            projectRunning,
            turbo,
            ...props
        } = this.props;
        if (projectRunning) {
            dispatchEvent(new Event('projectRunning'));
        } else {
            dispatchEvent(new Event('projectRunFinish'));
        }
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
