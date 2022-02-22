import {IS_NATIVE_PLAY_VIDEO} from "@/lib/const";

console.error('已废弃？');

/* eslint-disable no-invalid-this */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';

import styles from './styles.css';
import tipIcon from './tip.svg';
import tipAudio from './tips.mp3';
import {getParam, param} from '../../lib/param';
import PromptArea from '../prompt-area/prompt-area.jsx';
import initPng from './test.png';
const c = styles;
Object.assign(c, require('../../css/animate.css'));
import {playTipAudio} from '../../lib/courseTip/TipAudio.js';
import {OPERATE_TIME_2, timerType, RIGHT_ANSWER_1, RIGHT_ANSWER_2} from '../timer/data';
import {getIsNatvePlaying, removeTimer} from "@/lib/native-event";

class Tips extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            promptAreaShow: false,
            videoSrc: '',
            tipVideo: [],
            imageSrc: '',
            showState: false,
            timeOutEvent: null,
            type: '图文',
            clickCount: 0
        };
        this.audio = null;
        bindAll(this, [
        ]);
    }
    componentDidMount () {
        this.judgeVideoOrImageText();
        this.initListener();
    }

    componentWillUnmount () {
        clearTimeout(this.timeOutEvent);
        this.removeListener();
    }

    initListener = () => {
        // 正确答案计时器, 首次是97秒（重置一次之后是每隔61秒），就引导学生点击提示
        window.addEventListener(`noAction:${timerType.RIGHT_ANSWER}:${RIGHT_ANSWER_1}`, this.touchTip);
        // 正确答案计时器, 重置一次之后是每隔61秒，就引导学生点击提示
        window.addEventListener(`noAction:${timerType.RIGHT_ANSWER}:${RIGHT_ANSWER_2}`, this.touchTip);
        window.addEventListener('submitErrorCounter1', this.touchTip); // 第一次提交错误
        window.addEventListener('submitErrorCounter2', this.clickTips); // 第二次提交错误，自动播放视频
        window.addEventListener('jsonErrorCounterInRange', this.touchTip); // json自动批改错误，容错小范围内
        window.addEventListener('jsonErrorCounterOutRange', this.clickTips); // json自动批改错误，超过容错小范围
    }

    removeListener = () => {
        window.removeEventListener('submitErrorCounter1', this.touchTip);
        window.removeEventListener('submitErrorCounter2', this.clickTips);
        window.removeEventListener('jsonErrorCounterInRange', this.touchTip);
        window.removeEventListener('jsonErrorCounterOutRange', this.clickTips);
        window.removeEventListener(`noAction:${timerType.RIGHT_ANSWER}:${RIGHT_ANSWER_1}`, this.touchTip);
        window.removeEventListener(`noAction:${timerType.RIGHT_ANSWER}:${RIGHT_ANSWER_2}`, this.touchTip);
    }

    touchTip = () => {
        // if(IS_NATIVE_PLAY_VIDEO && getIsNatvePlaying()){
        //     removeTimer();
        //     return;
        // };
        this.setState({
            showState: true
        });

        this.audio = playTipAudio(tipAudio);
        this.timeOutEvent = this.setTimeout(() => {
            this.setState({
                showState: false
            });

        }, 12000);
    }

    judgeVideoOrImageText = () => {
        let tipVideo = getParam('tipVideo');
        const tipPic = getParam('tipPic');
        let type = '图文';
        if (tipVideo) {
            type = '视频';
            tipVideo = tipVideo.split('|');
        } else if (tipPic) {
            type = '图文';
        }
        this.setState({
            type: type,
            tipVideo: tipVideo || [],
            imageSrc: tipPic || initPng
        });
    }

    createAudio = tipSrc => {
        this.audio = playTipAudio(tipSrc);
        // this.audio = document.createElement('audio');
        // const src = tipSrc ? tipSrc : getParam('tipAudio');
        // this.audio.src = src ? src : '';
    }
    clickTips = () => {

        if (this.audio) {
            this.audio.pause();
        }
        const {clickCount, tipVideo} = this.state;
        let count = clickCount + 1;
        if (count > tipVideo.length) { // 最多超过2次后的点击固定都是最后一个视频
            count = tipVideo.length;
        }
        dispatchEvent(new Event('clickTips'));
        if (this.state.type === '视频'){
            dispatchEvent(new Event('clickVideoTips')); // 点击视频提示
        }
        this.setState({
            promptAreaShow: true,
            clickCount: count,
            videoSrc: tipVideo[count - 1]
        });
    }
    closePromptArea = () => {
        this.setState({
            promptAreaShow: false
        });
        if (this.state.type === '视频'){
            dispatchEvent(new Event('closeVideoTips')); // 关闭视频提示
        }
    }
    render () {
        const {
            ...props
        } = this.props;

        const {
            promptAreaShow,
            videoSrc,
            imageSrc,
            showState,
            type,
            ...state
        } = this.state;

        return (
            <div
                hidden={!(param('mode') === 'course')}
                className={classNames({
                    [styles.container]: true,
                    [styles.blingBling]: showState,
                    [styles.blingBlingRight]: showState})}
            >
                <img
                    className={styles.tipIcon}
                    src={tipIcon}
                    alt=""
                    onClick={this.clickTips}
                />
                {promptAreaShow ? <PromptArea
                    closePromptArea={this.closePromptArea}
                    videoSrc={videoSrc}
                    imageSrc={imageSrc}
                    type={type}
                /> : null}
            </div>
        );
    }
}

Tips.propTypes = {
};

const mapStateToProps = state => ({
});
const mapDispatchToProps = () => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Tips);
