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
import tipAudio from './tips.mp3';
import {OPERATE_TIME_1, RIGHT_ANSWER_1, RIGHT_ANSWER_2, timerType} from '../timer/data';
import pullSvg from './pull.svg';
import {
    closeFileMenu
} from '../../reducers/menus';
import * as bridge from '../../playground/bridge.js';
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
            isVideoContentOpen: false,
            currentTipVideoIndex: 0,
            currentVideoSrc: '',
            currentFuncIndex: -1,
            alreadyClickVideo: [],
            tipsShow: false,
            style: {
                width: '',
            },
            oriPos: { // 开始状态
                top: 0, // 元素的坐标
                left: 0,
                cX: 0, // 鼠标的坐标
                cY: 0
            },
            oriLeft: '',
            oriTop: '',
            oriWidth: 0,
            oriHeight: 0,
            isAlreadyInitTouchMove: false,
            nativePlayVideo: getParam('nativePlayVideo'),
            isPlayOnNative: false
        };
        this.introVideoSrc = '';
        this.titleAudioSrc = '';
        this.tipVideos = [];
        this.isExplain = false;
        this.videoFuncList = [
            {
                funcName: '任务',
                func: index => this.openIntroVideo(index),
                show: () => true
            },
            {
                funcName: '提示1',
                func: index => this.setTipVideoAndPlay(index, 1),
                show: () => this.tipVideos.length >= 1
            },
            {
                funcName: '提示2',
                func: index => this.setTipVideoAndPlay(index, 2),
                show: () => this.tipVideos.length >= 2
            },
            {
                funcName: '提示3',
                func: index => this.setTipVideoAndPlay(index, 3),
                show: () => this.tipVideos.length >= 3
            },
            // {
            //     funcName: '新手指引',
            //     func: index => this.openBeginnerGuideVideo(index),
            //     show: () => true
            // },
            // {
            //     funcName: '找老师',
            //     func: index => this.findTeacher(index),
            //     show: () => true
            // }
        ];
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
            this.isExplain = getTipParam('tipVideo')?.includes('_explain');
            this.introVideoSrc = getTipParam('introVideo');
            this.titleAudioSrc = getTipParam('tipAudio');
            this.tipVideos = getTipParam('tipVideo') || [];
            if (typeof this.tipVideos === 'string') {
                this.tipVideos = this.tipVideos.split('|');
            }
            // 读题语音相关的监听
            window.addEventListener('clickSubmit', this.closeAudio);// 点击提交终止语音
            window.addEventListener('clickVideoTips', this.closeAudio);// 点击视频提示终止语音
            window.addEventListener('handleGreenFlagClick', this.closeAudio);// 点击开始运行代码终止语音
            window.addEventListener('saveToComputer', this.closeAudio);// 点击保存到电脑终止语音
            window.addEventListener('projectRunning', this.closeAudio); // 代码运行中
            window.addEventListener(`noAction:${timerType.OPERATE}:${OPERATE_TIME_1}`, this.openTitleAudio);

            // 提示按钮相关的监听
            // 正确答案计时器, 首次是97秒（重置一次之后是每隔61秒），就引导学生点击提示
            window.addEventListener(`noAction:${timerType.RIGHT_ANSWER}:${RIGHT_ANSWER_1}`, this.touchTip);
            // 正确答案计时器, 重置一次之后是每隔61秒，就引导学生点击提示
            window.addEventListener(`noAction:${timerType.RIGHT_ANSWER}:${RIGHT_ANSWER_2}`, this.touchTip);
            window.addEventListener('submitErrorCounter1', this.touchTip); // 第一次提交错误
            window.addEventListener('submitErrorCounter2', this.openAndAutoPlayTipVideo); // 第二次提交错误，自动播放视频
            window.addEventListener('jsonErrorCounterInRange', this.touchTip); // json自动批改错误，容错小范围内
            window.addEventListener('jsonErrorCounterOutRange', this.openAndAutoPlayTipVideo); // json自动批改错误，超过容错小范围

            // 监听暂停和播放事件
            bridge.on('pause', e => {
                this.videoRef?.pause();
            });
            bridge.on('resume', e => {
                this.videoRef?.play();
            });
            bridge.on('closeIntroVideoModal', this.closeIntroVideoModal);
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
            // 读题语音相关的监听
            window.removeEventListener('clickSubmit', this.closeAudio);
            window.removeEventListener('clickVideoTips', this.closeAudio);
            window.removeEventListener('handleGreenFlagClick', this.closeAudio);
            window.removeEventListener('saveToComputer', this.closeAudio);
            window.removeEventListener('projectRunning', this.closeAudio);
            window.removeEventListener(`noAction:${timerType.OPERATE}:${OPERATE_TIME_1}`, this.openTitleAudio);
            this.audio = null;

            // 提示按钮相关的监听
            window.removeEventListener('submitErrorCounter1', this.touchTip);
            window.removeEventListener('submitErrorCounter2', this.clickTips);
            window.removeEventListener('jsonErrorCounterInRange', this.touchTip);
            window.removeEventListener('jsonErrorCounterOutRange', this.clickTips);
            window.removeEventListener(`noAction:${timerType.RIGHT_ANSWER}:${RIGHT_ANSWER_1}`, this.touchTip);
            window.removeEventListener(`noAction:${timerType.RIGHT_ANSWER}:${RIGHT_ANSWER_2}`, this.touchTip);
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

    touchTip = () => {
        if (!this.state.isVideoContentOpen) {
            this.setState({
                tipsShow: true
            });
        }
        this.audio = playTipAudio(tipAudio);
        const timer = this.setTimeout(() => { // 如果一直没有点击展开视频提示，那么动效在播放10次后关闭
            if (this.state.tipsShow) {
                this.setState({
                    tipsShow: false
                });
            }
            clearTimeout(timer);
        }, 11000);
    }

    openAndAutoPlayTipVideo = () => {
        if (!this.tipVideos.length) { // 没有提示视频，无法自动播放
            return;
        }
        this.setState({
            isVideoContentOpen: true,
        });

        this.initVideoMove();
        if (this.audio) {
            this.audio.pause();
        }

        const {currentTipVideoIndex} = this.state;
        let count = currentTipVideoIndex + 1;
        if (count > this.tipVideos.length) { // 最多超过2次后的点击固定都是最后一个视频
            count = this.tipVideos.length;
        }

        this.setTipVideoAndPlay(count, count);

        dispatchEvent(new Event('clickTips')); // 更新声音停止不了的问题 author：hwh
        dispatchEvent(new Event('clickVideoTips')); // 点击视频提示
    }

    handleTouchStart = e => {
        if (!this.state.moreFuncShow) {
            // e.preventDefault();
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

    clickCourseMode = () => {
        if (window.ontouchstart !== undefined) {
            this.isDrag = false;
        }
        this.judgeIsShowVideoContent();
    }

    judgeIsShowVideoContent = () => {
        if (this.state.isVideoContentOpen) {
            if (this.isDrag) {
                this.isDrag = false;
                return;
            }
            this.setState({
                isVideoContentOpen: false
            });
            this.closeVideoContent();
            return;
        }
    }

    closeVideoContent = () => { // 复原 + 取消拖动事件
        this.setState({
            isVideoContentOpen: false
        });

        this.videoRef?.pause();

        this.setState({
            style: {
                left: '',
                top: '',
            }
        });
        this.courseTaskBarInnerEl.ontouchstart = undefined;
        this.courseTaskBarInnerEl.onmousedown = undefined;
        this.removeEventListener?.();
    }

    openTitleAudio = event => {
        event.preventDefault();
        event.stopPropagation();
        if (window.ontouchstart !== undefined) {
            this.isDrag = false;
        }
        this.judgeIsShowVideoContent();
        if (this.titleAudioSrc){
            this.setState({
                audioPlaying: true
            });
            this.audio = playTipAudio(this.titleAudioSrc);
            this.audio.removeEventListener('ended', this.stopAudioPlay);
            this.audio.addEventListener('ended', this.stopAudioPlay);
        }
    }

    handleToggleVideoContent = () => {
        if (this.state.nativePlayVideo){
            Promise.resolve().then(() => {
                const react = this.courseTaskBarInnerEl.getBoundingClientRect();
                window.bridge.emit('showIntroVideoModal', react);
            });
            this.setState({
                isPlayOnNative: true,
                isVideoContentOpen: true
            });
            this.initVideoMove();
            return;
        }
        if (!this.state.isVideoContentOpen) {
            this.setState({
                tipsShow: false
            });
            this.openAndAutoPlayTipVideo(); // 每次点击都播放提示视频，而且视频索引是当前的下一个
        }
        if (this.state.isVideoContentOpen) {
            this.closeVideoContent();
        }
    }

    videoPlayFunc = () => {
        this.videoRef.currentTime = 0;
        this.videoRef.play();
    }

    openIntroVideo = funcIndex => {
        if (!this.introVideoSrc) {
            // 提示没有介绍视频
            window.editorErrorTipText = '对不起，还没有介绍视频哦';
            dispatchEvent(new Event('openErrorTips'));
            this.setState({
                currentFuncIndex: funcIndex
            });
            return;
        }
        this.setState({
            currentFuncIndex: funcIndex,
            currentVideoSrc: this.introVideoSrc
        });
    }

    openBeginnerGuideVideo = funcIndex => {
        window.editorErrorTipText = '对不起，还没有新手指引视频哦';
        dispatchEvent(new Event('openErrorTips'));
        this.setState({
            currentFuncIndex: funcIndex,
        });
    }

    findTeacher = funcIndex => {
        window.editorErrorTipText = '对不起，该功能还未开放哦';
        dispatchEvent(new Event('openErrorTips'));
        this.setState({
            currentFuncIndex: funcIndex,
        });
    }

    setTipVideoAndPlay = (funcIndex, index) => {
        if (!this.tipVideos[index - 1]) {
            // 提示没有该提示视频
            window.editorErrorTipText = `对不起，没有该${this.isExplain ? '讲解' : '提示'}视频哦`;
            dispatchEvent(new Event('openErrorTips'));
            return;
        }
        const deviation = index - this.state.currentTipVideoIndex;
        if (!this.state.alreadyClickVideo.includes(index) && deviation > 1) {
            // 提示别着急哦，先自己试试吧
            window.editorErrorTipText = '别着急哦，先自己试试吧';
            dispatchEvent(new Event('openErrorTips'));
            return;
        }

        this.setState({
            currentVideoSrc: this.tipVideos[index - 1],
            currentTipVideoIndex: index,
            currentFuncIndex: funcIndex,
            alreadyClickVideo: this.state.alreadyClickVideo.concat([index]) // 收集已经点击过的视频，已经点过的就可以跳级点击视频
        }, e => {
            this.videoRef?.play();
        });

        dispatchEvent(new Event('clickVideoTips')); // 点击视频提示
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

    toTouchEvent = event => {
        let touchObj;
        if (event.touches) {
            touchObj = event.touches[0];
        } else {
            touchObj = event;
        }
        return touchObj;
    }

    initVideoMove = () => {
        this.initVideoContentOpenStyle();
        setTimeout(() => {
            this.removeEventListener = this.initTouchAndMove();
        }, 300);
    }

    initVideoContentOpenStyle = () => {
        // eslint-disable-next-line no-debugger
        // debugger;
        this.setState({
            oriLeft: window.getComputedStyle(this.courseTaskBarInnerEl, null).left,
            oriTop: window.getComputedStyle(this.courseTaskBarInnerEl, null).top,
            oriWidth: this.courseTaskBarInnerEl.clientWidth,
            oriHeight: this.courseTaskBarInnerEl.clientHeight
        });

        this.setState({
            style: {
                // position: 'fixed',
                // left: window.getComputedStyle(this.courseTaskBarInnerEl, null).left,
                // top: window.getComputedStyle(this.courseTaskBarInnerEl, null).top,
                width: this.courseTaskBarInnerEl.clientWidth,
            },
        });
    }

    closeIntroVideoModal = () => {
        this.setState({
            isPlayOnNative: false,
            isVideoContentOpen: false
        });
    }

    initTouchAndMove = () => { // 初始化缩放和拖拽事件
        const dragObj = this.courseTaskBarInnerEl;
        const scaleRef = this.scaleRef;
        const shieldList = [this.videoRef, this.closeIconRef]; // 不允许触发move的对象
        const noPreventDafualtShieldList = [this.audioTipsTextRef];
        let mouseX;
        let mouseY;
        let objX;
        let objY;
        let dragging = false;
        let diffX;
        let diffY;
        let isScale = false;
        let operateTarget;

        const judgeDomIsIn = dom => { // 判断当前点击的是目标拖拽对象
            if (dom === dragObj) {
                return true;
            }
            while (dom) {
                dom = dom.parentNode;
                if (dom === dragObj) {
                    return true;
                }
            }
            return false;
        };

        const handleStart = event => { // 拖动开始
            const e = this.toTouchEvent(event);
            operateTarget = e.target;
            if (shieldList.includes(e.target)) {
                return;
            }
            const testtimer = setTimeout(() => {
                event.preventDefault();
                clearTimeout(testtimer);
            }, 200);

            dragging = true;
            mouseX = e.clientX;// 初始位置时鼠标的坐标
            mouseY = e.clientY;
            objX = dragObj.offsetLeft; // 元素的初始位置
            objY = dragObj.offsetTop;
            diffX = mouseX - objX;// 相当于鼠标距物体左边的距离
            diffY = mouseY - objY;
        };
        const handleMove = event => { // 拖动中
            // event.preventDefault();
            if (!judgeDomIsIn(operateTarget)) {
                return;
            }
            const e = this.toTouchEvent(event);
            if (dragging) {
                if (isScale) {
                    const newStyle = {...this.state.oriPos};
                    const offsetX = e.clientX - this.state.oriPos.mouseX;
                    newStyle.width += offsetX;
                    if (
                        (newStyle.width < 200 && offsetX <= 0) ||
                         (newStyle.width > document.documentElement.clientWidth && offsetX >= 0)
                    ) return;
                    this.setState({
                        style: newStyle
                    });
                    return;
                }
                // 元素左边距等于鼠标移动的宽度加上元素本身的位置
                const leftOffset = e.clientX - mouseX + objX;
                const topOffset = e.clientY - mouseY + objY;
                if (leftOffset || topOffset) {
                    this.isDrag = true;
                }
                dragObj.style.left = `${leftOffset}px`;
                dragObj.style.top = `${topOffset}px`;

                // 设置边界
                if ((e.clientX - diffX) < 0) { // 鼠标到浏览器左边距小于鼠标到obj的左边距
                    dragObj.style.left = `${0}px`;
                } else if ((e.clientX - diffX) > (window.innerWidth - dragObj.offsetWidth)) {
                    // window.innerWidth浏览器显示区域的宽度，dragObj.offsetWidth物体宽度
                    dragObj.style.left = `${window.innerWidth - dragObj.offsetWidth}px`;
                }
                if ((e.clientY - diffY) < 0) {
                    dragObj.style.top = `0px`;
                } else if ((e.clientY - diffY) > (window.innerHeight - dragObj.offsetHeight)) {
                    dragObj.style.top = `${window.innerHeight - dragObj.offsetHeight}px`;
                }
            }
        };
        const handleEnd = event => { // 拖动结束
            dragging = false;
            isScale = false;
            operateTarget = undefined;
        };
        const handleScaleStart = event => { // 缩放开始
            const e = this.toTouchEvent(event);
            dragging = true;
            isScale = true;
            mouseX = e.clientX;// 初始位置时鼠标的坐标
            mouseY = e.clientY;
            this.setState({oriPos: {
                ...this.state.style, mouseX, mouseY
            }});
        };
        // 注册touch事件（移动端）
        dragObj.ontouchstart = handleStart;
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('touchend', handleEnd);
        document.body.style.overflow = 'hidden'; // 拖动提示视频禁止页面滚动
        // 注册move事件（pc端）
        dragObj.onmousedown = handleStart;
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);

        // 注册缩放事件（移动端）
        scaleRef.ontouchstart = handleScaleStart;

        // 注册缩放事件（pc端）
        scaleRef.onmousedown = handleScaleStart;

        return () => {
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.body.style.overflow = 'auto';
        };
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
            isVideoContentOpen,
            currentVideoSrc,
            currentFuncIndex,
            tipsShow,
            style,
            ...state
        } = this.state;

        return (
            <div className={classNames({[styles.container]: true})}>
                {mode === 'normal' && <div className={c.productionName}>
                    <div className="xs-hide">作品名：</div>
                    <input
                        type="text"
                        className={`${c.input}`}
                        placeholder="作品名称"
                        maxLength={20}
                        defaultValue={this.props.projectTitle}
                        onInput={this.handleInput}
                    />
                </div>}
                {mode === 'teacher' && <div className={classNames('play_audio', {[c.teacherMode]: true})}>
                    <div
                        className={c.moreFuncContainer}
                        ref={r => {
                            this.containerRef = r;
                        }}
                        onMouseLeave={this.hideMoreFunc}
                        onMouseEnter={this.showMoreFunc}
                    >
                        <div
                            className={classNames('play_audio', {
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
                    <section
                        className={classNames(c.courseTipsContainer, {[c.open]: isVideoContentOpen, [c.visibilityHidden]: this.state.nativePlayVideo && this.state.isPlayOnNative})}
                        ref={r => {
                            this.courseTaskBarInnerEl = r;
                        }}
                        style={style}
                        // hidden={this.state.nativePlayVideo && this.state.isPlayOnNative}
                    >
                        <div
                            className={classNames({[c.tipsBar]: true})}
                            onClick={this.clickCourseMode}
                        >
                            <div
                                className={classNames({[c.audioContent]: true, [c.blingBling]: audioPlaying})}
                                onClick={this.openTitleAudio}
                            >
                                <img
                                    className={classNames({[c.audioIcon]: true})}
                                    src={audio}
                                    alt="audio"
                                />
                                <span
                                    ref={r => {
                                        this.audioTipsTextRef = r;
                                    }}
                                >
                                    <span className="xs-hide">点击这里，会告诉你本次的任务哦</span>
                                    <span className="xs-show">点击语音读题</span>
                                </span>
                            </div>
                            <div className={classNames('play_audio', {[c.iconList]: true, [c.blingBling]: tipsShow})} >
                                <img
                                    className={
                                        classNames({
                                            [c.videoIcon]: !isVideoContentOpen,
                                            [c.closeIcon]: isVideoContentOpen,
                                        })
                                    }
                                    ref={r => {
                                        this.closeIconRef = r;
                                    }}
                                    draggable={false}
                                    src={isVideoContentOpen ? close : video}
                                    alt="video"
                                    onClick={this.handleToggleVideoContent}
                                />
                            </div>
                        </div>
                        <div
                            className={classNames({[c.videoContent]: true})}
                            ref={r => {
                                this.videoContentRef = r;
                            }}
                        >
                            <video
                                className={c.video}
                                src={currentVideoSrc}
                                controls={'controls'}
                                autoPlay
                                playsInline
                                ref={r => {
                                    this.videoRef = r;
                                }}
                                controlsList="nodownload"
                                disablePictureInPicture
                            ></video>
                            <div className={c.videoOptions}>
                                {this.videoFuncList.map((item, index) =>
                                    (
                                        <div
                                            key={index}
                                            hidden={!item.show()}
                                            className={
                                                classNames(
                                                    'play_audio',
                                                    {
                                                        [c.option]: true,
                                                        [c.active]: currentFuncIndex === index,

                                                    }
                                                )
                                            }
                                            onClick={() => item.func(index)}
                                        >{this.isExplain ? item.funcName.replace(/提示/, '讲解') : item.funcName}</div>
                                    )
                                )}
                            </div>
                            <img
                                className={c.pullSvg}
                                src={pullSvg}
                                ref={r => {
                                    this.scaleRef = r;
                                }}
                                draggable={false}
                            />
                        </div>
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
