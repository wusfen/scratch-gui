/* eslint-disable no-invalid-this */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';

import styles from './styles.css';
import audioIcon from './audio.svg';
import getTipParam from '../../lib/courseTip/getTipParam';
import {OPERATE_TIME_1, OPERATE_TIME_2, CODE_TIME_1, timerType} from '../timer/data';
import {setTipAudioSrc} from '../../reducers/tipAudio';
import tipAudioSource from '../../assets/sounds/tipAudio.mp3';
import {playTipAudio} from '../../lib/courseTip/TipAudio.js';
import {param} from '../../lib/param.js';
import {getIsNatvePlaying} from "@/lib/native-event";
import {IS_NATIVE_PLAY_VIDEO} from "@/lib/const";
const c = styles;
Object.assign(c, require('../../css/animate.css'));
class AudioCourse extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            isPlay: false
        };
        this.audio = null;
        this.titleAudioSrc = null;
        bindAll(this, [
        ]);
    }
    componentDidMount () {
        this.titleAudioSrc = getTipParam('tipAudio');
        this.createAudio();
        window.addEventListener('clickSubmit', this.closeAudio);// 点击提交终止语音
        window.addEventListener('clickVideoTips', this.closeAudio);// 点击视频提示终止语音
        window.addEventListener('handleGreenFlagClick', this.closeAudio);// 点击开始运行代码终止语音
        window.addEventListener('saveToComputer', this.closeAudio);// 点击保存到电脑终止语音
        window.addEventListener('projectRunning', this.closeAudio); // 代码运行中

        if (param('mode') === 'course') {
            window.addEventListener(`noAction:${timerType.OPERATE}:${OPERATE_TIME_1}`, this.openTitleAudio);
        }
    }
    componentWillUnmount () {
        window.removeEventListener('clickSubmit', this.closeAudio);
        window.removeEventListener('clickVideoTips', this.closeAudio);
        window.removeEventListener('handleGreenFlagClick', this.closeAudio);
        window.removeEventListener('saveToComputer', this.closeAudio);
        window.removeEventListener('projectRunning', this.closeAudio);
        window.removeEventListener(`noAction:${timerType.OPERATE}:${OPERATE_TIME_1}`, this.openTitleAudio);
        this.audio = null;
    }
    createAudio = () => {
    }
    openTitleAudio = () => {
        if(IS_NATIVE_PLAY_VIDEO && getIsNatvePlaying())return;
        if (this.titleAudioSrc){
            this.setState({
                isPlay: true
            });
            console.log('openTitleAudio');
            this.audio = playTipAudio(this.titleAudioSrc);
            this.audio.removeEventListener('ended', this.stopPlay);
            this.audio.addEventListener('ended', this.stopPlay);
        }
    }
    stopPlay = () => {
        console.log('读题语音结束，停止动效');
        this.setState({
            isPlay: false
        });
    }
    closeAudio = () => {
        this.setState({
            isPlay: false
        });
        if (this.audio) {
            this.audio.pause();
        }

    }
    render () {
        const {
            children,
            ...props
        } = this.props;

        const {
            isPlay,
            ...state
        } = this.state;
        return (
            <div
                hidden={!(param('mode') === 'course')}
                className={classNames({
                    [styles.container]: true,
                    [styles.blingBling]: isPlay
                })}
            >
                <img
                    className={styles.audioIcon}
                    src={audioIcon}
                    alt=""
                    onClick={this.openTitleAudio}
                />
            </div>
        );
    }
}

AudioCourse.propTypes = {
    children: PropTypes.node,
};

const mapStateToProps = state => ({
    tipAudio: state.scratchGui.tipAudio
});
const mapDispatchToProps = dispatch => ({
    setTipAudioSrcFunc: src => dispatch(setTipAudioSrc(src)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AudioCourse);
