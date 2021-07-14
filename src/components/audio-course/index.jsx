import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';

import styles from './styles.css';
import audioIcon from './audio.svg'
import {getParam} from '../../lib/param'
import {TIME_1, TIME_2, timerType} from '../timer/data'
import {setTipAudioSrc} from '../../reducers/tipAudio';
const c = styles;

class AudioCourse extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            isPlay: false
        };
        this.audio = null
        bindAll(this, [
        ]);
    }
    componentDidMount() {
        this.createAudio()
        window.addEventListener('pauseAudioCourse', this.closeAudio)// 终止音频
        window.addEventListener(`noAction:${TIME_1}:${timerType.OPERATE}`, this.openAudio) // 连续*秒无任何操作
    }
    
    createAudio = () => {
        const {tipAudio} = this.props
        this.audio = document.createElement('audio')
        this.audio.src = tipAudio.tipAudioSrc
    }
    openAudio = () => {
        this.setState({
            isPlay: true
        })
        this.audio.play()
    }
    closeAudio = () => {
        this.setState({
            isPlay: false
        })
        this.audio.pause()
    }
    componentWillUnmount() {
        window.removeEventListener('pauseAudioCourse', this.openAudio)
        window.removeEventListener(`noAction:${TIME_1}:${timerType.OPERATE}`, this.closeAudio)
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
                className={classNames(styles.container)}
            >
                <img className={isPlay ? `${styles.audioIcon} ${styles.playing}` : styles.audioIcon} src={audioIcon} alt="" onClick={this.openAudio}/>
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
const mapDispatchToProps = (dispatch) => ({
    setTipAudioSrcFunc: (src) => dispatch(setTipAudioSrc(src)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AudioCourse);
