/* eslint-disable no-invalid-this */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';

import styles from './styles.css';
import tipIcon from './tip.svg';
import tipAudio from './tips.mp3';
import {getParam} from '../../lib/param';
import PromptArea from '../prompt-area/prompt-area.jsx';
import initPng from './test.png';
const c = styles;
Object.assign(c, require('../../css/animate.css'));
import {OPERATE_TIME_2, timerType} from '../timer/data';

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
        this.createAudio(tipAudio);
        this.judgeVideoOrImageText();
        this.initListener();
    }

    componentWillUnmount () {
        clearTimeout(this.timeOutEvent);
        this.removeListener();
        this.audio.pause();
        this.audio = null;
    }

    initListener = () => {
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
    }

    touchTip = () => {
        this.setState({
            showState: true
        });
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.play();
        this.timeOutEvent = setTimeout(() => {
            this.setState({
                showState: false
            });
            this.audio.pause();
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
        this.audio = document.createElement('audio');
        this.audio.src = tipSrc ? tipSrc : '';
    }
    clickTips = () => {
        const {clickCount, tipVideo} = this.state;
        let count = clickCount + 1;
        if (count > tipVideo.length) { // 最多超过2次后的点击固定都是最后一个视频
            count = tipVideo.length;
        }
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
                className={classNames({
                    [styles.container]: true,
                    [styles.blingBling]: showState})}
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
