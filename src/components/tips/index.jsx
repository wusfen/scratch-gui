import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';

import styles from './styles.css';
import tipIcon from './tip.svg'
import {getParam} from '../../lib/param'
import PromptArea from '../prompt-area/prompt-area.jsx'
const c = styles;

class Tips extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            promptAreaShow: false,
            videoSrc: ''
        };
        this.audio = null
        bindAll(this, [
        ]);
    }
    componentDidMount() {
        // this.createAudio()
        // window.addEventListener('pauseAudioCourse', () => {
        //     this.closeAudio()
        // })
        // window.addEventListener('noAction:operate', () => { // 连续10秒无任何操作
        //     this.openAudio()
        // });
    }
    createAudio = () => {
        this.audio = document.createElement('audio')
        let src = getParam('tipAudio')
        this.audio.src = src ? src : ''
    }
    clickTips = () => {
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
            ...state
        } = this.state;
        
        return (
            <div
                className={classNames(styles.container)}
            >
                <img className={styles.tipIcon} src={tipIcon} alt="" onClick={this.clickTips}/>
                {promptAreaShow ? <PromptArea closePromptArea={this.closePromptArea} videoSrc={videoSrc} type={'图文'}/> : null}
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
