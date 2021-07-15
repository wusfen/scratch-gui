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
import testPng from './test.png'
const c = styles;
Object.assign(c, require('../../css/animate.css'));

class Tips extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            promptAreaShow: false,
            videoSrc: '',
            imageSrc: testPng,
            showState: false,
            timeOutEvent: null
        };
        this.audio = null
        bindAll(this, [
        ]);
    }
    componentDidMount() {
        let s = this;
        // this.createAudio()
        // window.addEventListener('pauseAudioCourse', () => {
        //     this.closeAudio()
        // })
        // window.addEventListener('noAction:operate', () => { // 连续10秒无任何操作
        //     this.openAudio()
        // });
        window.addEventListener("超过30秒无操作", () => {
            s.setState({
                showState: true
            });
            this.createAudio(tipAudio);
            this.audio.play();
            s.timeOutEvent = setTimeout(()=>{
                s.setState({
                    showState: false
                })
                s.audio.pause();
            },12000)
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
        window.operateTimer.pauseTimer()
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
            ...state
        } = this.state;
        
        return (
            <div
                className={classNames({ 
                    [styles.container]: true,
                    [styles.blingBling]: showState})}
            >
                <img className={styles.tipIcon} src={tipIcon} alt="" onClick={this.clickTips}/>
                {promptAreaShow ? <PromptArea closePromptArea={this.closePromptArea} imageSrc={imageSrc} type={'图文'}/> : null}
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
