/* eslint-disable no-invalid-this */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';

import styles from './styles.css';
import audioIcon from './audio.svg';
import {getParam} from '../../lib/param';
import {OPERATE_TIME_1, OPERATE_TIME_2, CODE_TIME_1, timerType} from '../timer/data';
import {setTipAudioSrc} from '../../reducers/tipAudio';
import tipAudioSource from '../../assets/sounds/tipAudio.mp3';
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
        this.titleAudioSrc = getParam('tipAudio');
        this.createAudio();
        window.addEventListener('pauseAudioCourse', this.closeAudio);// 终止音频
        window.addEventListener(`noAction:${timerType.OPERATE}:${OPERATE_TIME_1}`, this.openTitleAudio); // 连续10秒无任何操作
        // window.addEventListener(`noAction:${timerType.OPERATE}:${OPERATE_TIME_2}`, this.openTipAudio) // 连续30秒无任何操作
    }
    componentWillUnmount () {
        window.removeEventListener('pauseAudioCourse', this.closeAudio);
        window.removeEventListener(`noAction:${timerType.OPERATE}:${OPERATE_TIME_1}`, this.openTitleAudio);
        window.removeEventListener(`noAction:${timerType.OPERATE}:${OPERATE_TIME_2}`, this.openTipAudio);
        this.audio = null;
    }
    createAudio = () => {
        // const {tipAudio} = this.props;
        this.audio = document.createElement('audio');
        this.audio.addEventListener('ended', this.closeAudio);
    }
    openTitleAudio = () => {
        this.audio.pause();
        if (this.titleAudioSrc){
            this.audio.src = this.titleAudioSrc;
            this.setState({
                isPlay: true
            });
            this.audio.currentTime = 0;
            this.audio.play();
        }
    }
    openTipAudio = () => {
        this.audio.pause();
        this.audio.src = tipAudioSource;
        this.setState({
            isPlay: true
        });
        this.audio.currentTime = 0;
        this.audio.play();
    }
    closeAudio = () => {
        this.setState({
            isPlay: false
        });
        this.audio.pause();
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
