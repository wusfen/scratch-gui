import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';

import styles from './styles.css';
import tipIcon from './tip.svg'
import tipAudio from './tips.mp3'
import {getParam} from '../../lib/param'
import PromptArea from '../prompt-area/prompt-area.jsx'
import initPng from './test.png'
const c = styles;
Object.assign(c, require('../../css/animate.css'));
import {OPERATE_TIME_1, OPERATE_TIME_2, timerType} from '../timer/data'

class Tips extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            promptAreaShow: false,
            videoSrc: '',
            imageSrc: '',
            showState: false,
            timeOutEvent: null,
            type: '图文'
        };
        this.audio = null
        bindAll(this, [
        ]);
    }
    componentDidMount() {
        this.createAudio(tipAudio);
        this.judgeVideoOrImageText()
        let s = this;
        window.addEventListener(`noAction:${timerType.OPERATE}:${OPERATE_TIME_2}`, () => {
            s.setState({
                showState: true
            });
            s.audio.play();
            s.timeOutEvent = setTimeout(()=>{
                s.setState({
                    showState: false
                })
                s.audio.pause();
            },12000)
        })
    }
    judgeVideoOrImageText = () => {
        let tipVideo = getParam('tipVideo')
        let tipPic = getParam('tipPic')
        let type = '图文'
        if (tipVideo) {
            type = '视频'
        } else if (tipPic) {
            type = '图文'
        }
        this.setState({
            type: type,
            videoSrc: tipVideo,
            imageSrc: tipPic || initPng
        })
    }
    componentWillUnmount() {
        clearTimeout(this.timeOutEvent);
        this.audio.pause();
        this.audio = null;
    }
    createAudio = (tipSrc) => {
        this.audio = document.createElement('audio')
        let src = tipSrc ? tipSrc : getParam('tipAudio')
        this.audio.src = src ? src : ''
    }
    clickTips = () => {
        if(this.state.type === '视频'){
            dispatchEvent(new Event('pauseAudioCourse')) // 点击视频提示终止读题语音
        }
        this.setState({
            promptAreaShow: true
        })
    }
    closePromptArea = () => {
        this.setState({
            promptAreaShow: false
        })
    }
    render () {
        const {
            children,
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
                <img className={styles.tipIcon} src={tipIcon} alt="" onClick={this.clickTips}/>
                {promptAreaShow ? <PromptArea closePromptArea={this.closePromptArea} videoSrc={videoSrc} imageSrc={imageSrc} type={type}/> : null}
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
