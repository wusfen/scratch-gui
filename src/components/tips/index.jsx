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
        const s = this;
        window.addEventListener(`noAction:${timerType.OPERATE}:${OPERATE_TIME_2}`, () => {
            s.setState({
                showState: true
            });
            s.audio.play();
            s.timeOutEvent = setTimeout(() => {
                s.setState({
                    showState: false
                });
                s.audio.pause();
            }, 12000);
        });
    }

    componentWillUnmount () {
        clearTimeout(this.timeOutEvent);
        this.audio.pause();
        this.audio = null;
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
        const src = tipSrc ? tipSrc : getParam('tipAudio');
        this.audio.src = src ? src : '';
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
