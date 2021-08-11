/* eslint-disable no-invalid-this */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import {setProjectTitle} from '../../reducers/project-title';
import styles from './styles.css';
import {getParam} from '../../lib/param';
import folder from '../../assets/icons/folder.svg';
import hide from '../../assets/icons/hide.svg';
import blowUp from '../../assets/icons/blow-up.svg';
import fileUp from '../../assets/icons/fileUp.svg';
import video from '../../assets/icons/video.svg';
import audio from '../../assets/icons/audio.svg';
import close from '../../assets/icons/close.svg';
import SB3Downloader from '../../containers/sb3-downloader.jsx';
import collectMetadata from '../../lib/collect-metadata';
import VM from 'scratch-vm';
import {playTipAudio} from '../../lib/courseTip/TipAudio.js';
import getTipParam from '../../lib/courseTip/getTipParam';
import {OPERATE_TIME_1, OPERATE_TIME_2, CODE_TIME_1, timerType} from '../timer/data';
import {
    closeFileMenu
} from '../../reducers/menus';
const c = styles;
Object.assign(c, require('../../css/animate.css'));

class TaskBar extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            mode: getParam('mode') || '',
            isTeacherPreview: false, // true: 老师切学生
            moreFuncShow: false,
            audioPlaying: false,
            videoContentShow: true,
            currentTipVideoIndex: 0,
            currentVideoSrc: ''
        };
        this.introVideoSrc = '';
        this.titleAudioSrc = '';
        this.tipVideos = [];
        bindAll(this, [
        ]);
    }

    componentDidMount () {
        this.handleMode();
        
    }

    componentWillUnmount () {
        this.handleGb();
    }

    handleMode = () => {
        const {mode} = this.state;
        switch (mode) {
        case 'course':
            this.introVideoSrc = getTipParam('introVideo ');
            this.titleAudioSrc = getTipParam('tipAudio');
            this.tipVideos = getTipParam('tipVideo');

            if (this.tipVideos) {
                this.tipVideos = this.tipVideos.split('|');
            }
            window.addEventListener('clickSubmit', this.closeAudio);// 点击提交终止语音
            window.addEventListener('clickVideoTips', this.closeAudio);// 点击视频提示终止语音
            window.addEventListener('handleGreenFlagClick', this.closeAudio);// 点击开始运行代码终止语音
            window.addEventListener('saveToComputer', this.closeAudio);// 点击保存到电脑终止语音
            window.addEventListener('projectRunning', this.closeAudio); // 代码运行中
            window.addEventListener(`noAction:${timerType.OPERATE}:${OPERATE_TIME_1}`, this.openTitleAudio);
            break;
        case 'teacher':
            this.moreFuncBtnRef && this.moreFuncBtnRef.addEventListener('touchstart', this.handleTouchStart);
            document.addEventListener('touchstart', this.handleTouchOutside);
            break;
        case 'normal':
            
            break;
        default:
            break;
        }
    }

    handleGb = () => {
        const {mode} = this.state;
        switch (mode) {
        case 'course':
            window.removeEventListener('clickSubmit', this.closeAudio);
            window.removeEventListener('clickVideoTips', this.closeAudio);
            window.removeEventListener('handleGreenFlagClick', this.closeAudio);
            window.removeEventListener('saveToComputer', this.closeAudio);
            window.removeEventListener('projectRunning', this.closeAudio);
            window.removeEventListener(`noAction:${timerType.OPERATE}:${OPERATE_TIME_1}`, this.openTitleAudio);
            this.audio = null;
            break;
        case 'teacher':
            this.moreFuncBtnRef && this.moreFuncBtnRef.removeEventListener('touchstart', this.handleTouchStart);
            document.removeEventListener('touchstart', this.handleTouchOutside);
            break;
        case 'normal':
            
            break;
        default:
            break;
        }
    }

    handleTouchStart = e => {
        if (!this.state.moreFuncShow) {
            e.preventDefault();
            this.showMoreFunc();
        }
    }

    handleTouchOutside = e => {
        if (this.state.moreFuncShow && !this.containerRef.contains(e.target)) {
            this.setState({
                moreFuncShow: false
            });
        }
    }

    handleHideCode = () => {
        window.dispatchEvent(new Event('menu:hideCode'));
    }

    handleTeacherPreview = () => {
        var isTeacherPreview = this.state.isTeacherPreview;
        this.setState({
            isTeacherPreview: !isTeacherPreview,
        });
        isTeacherPreview ? window.MODE = 'teacher' : window.MODE = undefined;
        dispatchEvent(new Event('updateWorkspace_'));
    }

    handleInput = e => {
        this.props.setProjectTitle(e.target.value);
    }

    getSaveToComputerHandler = downloadProjectCallback => () => {
        dispatchEvent(new Event('saveToComputer'));
        this.props.onRequestCloseFile();
        downloadProjectCallback();
        if (this.props.onProjectTelemetryEvent) {
            const metadata = collectMetadata(this.props.vm, this.props.projectTitle, this.props.locale);
            this.props.onProjectTelemetryEvent('projectDidSave', metadata);
        }
    };

    showMoreFunc = () => {
        if (this.closeTimeoutId) {
            clearTimeout(this.closeTimeoutId);
        } else {
            this.setState({
                moreFuncShow: true
            });
        }
    }

    hideMoreFunc = () => {
        this.closeTimeoutId = setTimeout(() => {
            this.setState({
                moreFuncShow: false
            });
            this.closeTimeoutId = null;
            clearTimeout(this.closeTimeoutId);
        }, 200);
    }

    openTitleAudio = () => {
        if (this.titleAudioSrc){
            this.setState({
                audioPlaying: true
            });
            console.log('openTitleAudio');
            this.audio = playTipAudio(this.titleAudioSrc);
            this.audio.removeEventListener('ended', this.stopAudioPlay);
            this.audio.addEventListener('ended', this.stopAudioPlay);
        }
    }

    handleVideoContent = () => {
        this.setState({
            videoContentShow: !this.state.videoContentShow
        });
    }

    openIntroVideo = () => {
        if (!this.introVideoSrc) {
            // 提示没有介绍视频
            return;
        }
        this.setState({
            currentVideoSrc: this.introVideoSrc
        });
    }

    openTipVideo = index => {
        if (!this.tipVideos[index]) {
            // 提示没有该提示视频
            return;
        }
        const deviation = index - this.state.currentTipVideoIndex;
        if (deviation > 1) {
            // 提示别着急哦，先自己试试吧
            return;
        }
    }

    closeAudio = () => {
        this.setState({
            audioPlaying: false
        });
        if (this.audio) {
            this.audio.pause();
        }
    }
    
    stopAudioPlay = () => {
        console.log('读题语音结束，停止动效');
        this.setState({
            audioPlaying: false
        });
    }

    render () {
        const {
            onStartSelectingFileUpload,
            ...props
        } = this.props;

        const {
            mode,
            isTeacherPreview,
            moreFuncShow,
            audioPlaying,
            videoContentShow,
            currentVideoSrc,
            ...state
        } = this.state;

        return (
            <div
                className={classNames({
                    [styles.container]: true})}
            >
                {mode === 'normal' && <div className={c.productionName}>
                    <div>作品名：</div>
                    <input
                        type="text"
                        className={`${c.input}`}
                        placeholder="作品名称"
                        maxLength={20}
                        value={this.props.projectTitle}
                        onInput={this.handleInput}
                    />
                </div>}
                {mode === 'teacher' && <div className={c.teacherMode}>
                    <div 
                        className={c.moreFuncContainer}
                        ref={r => {
                            this.containerRef = r;
                        }}
                        onMouseLeave={this.hideMoreFunc}
                        onMouseEnter={this.showMoreFunc}
                    >
                        <div
                            className={classNames({
                                [c.teacherModeItem]: true
                            })}
                            ref={r => {
                                this.moreFuncBtnRef = r;
                            }}
                        >
                            <img
                                src={folder}
                                alt="folder"
                            />
                            <span>保存与加载</span>
                        </div>
                        {moreFuncShow && <div
                            className={classNames(c.moreContent)} 
                        >
                            <div className={classNames(c.item)}>
                                <button
                                    hidden={false}
                                    type="button"
                                    className={`${c.funcItem}`}
                                >
                                    <img
                                        className={c.funcIcon}
                                        src={folder}
                                        alt="folder"
                                    />
                                    <SB3Downloader>{(className, downloadProjectCallback) => (
                                        <div
                                            className={className}
                                            onClick={this.getSaveToComputerHandler(downloadProjectCallback)}
                                        >
                                            保存到本地
                                        </div>
                                    )}</SB3Downloader>
                                </button>
                            </div>
                            <div className={classNames(styles.item)}>
                                <button
                                    hidden={false}
                                    type="button"
                                    className={`${styles.funcItem}`}
                                    onClick={onStartSelectingFileUpload}
                                >
                                    <img
                                        className={styles.funcIcon}
                                        src={fileUp}
                                        alt="fileUp"
                                    />
                                    加载本地文件
                                </button>
                            </div>
                        </div>}
                    </div>
                    
                    <div className={c.line}></div>
                    <div
                        className={classNames({
                            [c.teacherModeItem]: true
                        })}
                        onClick={this.handleHideCode}
                    >
                        <img
                            src={hide}
                            alt="hide"
                        />
                        <span>隐藏设置</span>
                    </div>
                    <div className={c.line}></div>
                    <div
                        className={classNames({
                            [c.teacherModeItem]: true
                        })}
                        onClick={this.handleTeacherPreview}
                    >
                        <img
                            src={blowUp}
                            alt="blowUp"
                        />
                        <span>{isTeacherPreview ? '返回老师模式' : '预览学生模式'}</span>
                    </div>
                </div>}
                {mode === 'course' && (
                    <section>
                        <div
                            className={
                                classNames({
                                    [c.courseMode]: true,
                                    [c.videoContentIsOpen]: videoContentShow
                                })
                            }
                        >
                            <div
                                className={classNames(
                                    {
                                        [c.audioContent]: true,
                                        [c.blingBling]: audioPlaying
                                    }
                                )}
                                onClick={this.openTitleAudio}
                            >
                                <img
                                    className={classNames(
                                        {
                                            [c.audioIcon]: true
                                        }
                                    )}
                                    src={audio}
                                    alt="audio"
                                />
                                <span>任务内容描述，点击语音读题</span>
                            </div>
                            
                            <img
                                className={
                                    classNames({
                                        [c.videoIcon]: !videoContentShow,
                                        [c.closeIcon]: videoContentShow
                                    })
                                }
                                src={videoContentShow ? close : video}
                                alt="video"
                                onClick={this.handleVideoContent}
                            />
                        </div>
                        {videoContentShow && <div
                            className={
                                classNames({
                                    [c.videoContent]: true
                                })
                            }
                        >
                            <video
                                className={c.video}
                                src={currentVideoSrc}
                                controls={'controls'}
                            ></video>
                            <div className={c.videoOptions}>
                                <div
                                    className={c.option}
                                    onClick={this.openIntroVideo}
                                >任务</div>
                                <div
                                    className={c.option}
                                    onClick={this.openTipVideo(1)}
                                >提示1</div>
                                <div
                                    className={c.option}
                                    onClick={this.openTipVideo(2)}
                                >提示2</div>
                                <div
                                    className={c.option}
                                    onClick={this.openTipVideo(3)}
                                >提示3</div>
                                <div className={c.option}>新手指引</div>
                                <div className={c.option}>找老师</div>
                            </div>
                        </div>}
                    </section>
                )}
            </div>
        );
    }
}

TaskBar.propTypes = {
    setProjectTitle: PropTypes.func,
    projectTitle: PropTypes.string,
    onRequestCloseFile: PropTypes.func,
    onProjectTelemetryEvent: PropTypes.func,
    locale: PropTypes.string,
    vm: PropTypes.instanceOf(VM).isRequired,
    onStartSelectingFileUpload: PropTypes.func
};

const mapStateToProps = state => ({
    projectTitle: state.scratchGui.projectTitle,
    locale: state.locales.locale,
    vm: state.scratchGui.vm
});
const mapDispatchToProps = dispatch => ({
    setProjectTitle: title => dispatch(setProjectTitle(title)),
    onRequestCloseFile: () => dispatch(closeFileMenu()),
});

export default connect(mapStateToProps, mapDispatchToProps)(TaskBar);
