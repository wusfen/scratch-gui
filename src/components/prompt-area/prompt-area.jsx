/* eslint-disable no-invalid-this */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import styles from './prompt-area.css';
import scaleIcon from './scale.svg';
import {scale} from 'twgl.js';
import * as bridge from '../../playground/bridge.js';
import getTipParam from '../../lib/courseTip/getTipParam';
const c = styles;

class PromptArea extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            rate: 0, // 缩放比例
            style: {
                left: 0,
                top: 0,
                // width: '49rem',
                // height: '30rem'
            },
            oriPos: { // 开始状态
                top: 0, // 元素的坐标
                left: 0,
                cX: 0, // 鼠标的坐标
                cY: 0
            },
            title: props.title,
            imageTextScale: 1,
            imageTextScaleRate: 0.25,
            transformOrigin: 'center center'
        };

        if (props.type){
            this.state.title = `${this.state.title}${props.type}`;
        }
        bindAll(this, [
        ]);
    }

    componentDidMount () {
        this.initStyle();
        window.addEventListener('resize', this.initStyle);
        this.videoRef && this.videoRef.addEventListener('ended', this.videoPause);
        // 监听暂停和播放事件
        bridge.on('pause', e => {
            this.videoRef?.pause();
        });
        bridge.on('resume', e => {
            this.videoRef?.play();
        });
        this.initTouchAndMove(); // 初始化缩放和拖拽事件
        this.removeTouchAndMove = this.initTouchAndMove(); // 初始化缩放和拖拽事件
    }

    componentWillUnmount (){
        window.removeEventListener('resize', this.initStyle);
        this.videoRef && this.videoRef.removeEventListener('ended', this.videoPause);
        this.removeTouchAndMove();
    }

    judgeTouchOrMoveReturnEvent = event => {
        let touchObj;
        if (event.touches) {
            touchObj = event.touches[0];
        } else {
            touchObj = event;
        }
        return touchObj;
    }

    initStyle = () => {
        const rate = this.showRef.clientWidth / this.showRef.clientHeight; // 计算展示区的缩放比例
        this.setState({style: { // 将展示区定位到屏幕中心
            left: (document.documentElement.clientWidth - this.myRef.clientWidth) / 2,
            top: (document.documentElement.clientHeight - this.myRef.clientHeight) / 2,
            width: this.myRef.clientWidth,
            height: this.myRef.clientHeight
        },
        rate: rate});
    }

    videoPause = () => {
        setTimeout(() => {
            this.props.closePromptArea();
        }, 1000);
    }

    handleBig = () => {
        const {imageTextScale, imageTextScaleRate, transformOrigin} = this.state;
        if (imageTextScale >= 1 && transformOrigin === 'center center'){
            this.setState({
                transformOrigin: 'left top'
            });
        }
        this.setState({
            imageTextScale: imageTextScale + imageTextScaleRate
        });
    }

    handleSmall = () => {
        const {imageTextScale, imageTextScaleRate, transformOrigin} = this.state;
        if (imageTextScale === imageTextScaleRate) return;
        if (imageTextScale <= 1 && transformOrigin === 'left top'){
            this.setState({
                transformOrigin: 'center center'
            });
        }
        this.setState({
            imageTextScale: imageTextScale - imageTextScaleRate
        });
    }

    handleStopPropagation = e => {
        if (!event.touches) {
            e.preventDefault();
        }
        e.stopPropagation();
    }


    initTouchAndMove = () => { // 初始化缩放和拖拽事件
        const dragObj = this.myRef;
        const scaleRef = this.scaleRef;
        const shieldList = [this.videoRef, this.imageTextRef, this.imageScaleRef]; // 不允许触发move的对象
        dragObj.style.left = '0px';
        dragObj.style.top = '0px';
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
            const e = this.judgeTouchOrMoveReturnEvent(event);
            operateTarget = e.target;
            if (shieldList.includes(e.target)) {
                return;
            }
            dragging = true;
            mouseX = e.clientX;// 初始位置时鼠标的坐标
            mouseY = e.clientY;
            objX = dragObj.offsetLeft; // 元素的初始位置
            objY = dragObj.offsetTop;
            diffX = mouseX - objX;// 相当于鼠标距物体左边的距离
            diffY = mouseY - objY;
        };
        const handleMove = event => { // 拖动中
            event.preventDefault();
            if (!judgeDomIsIn(operateTarget)) {
                return;
            }
            const e = this.judgeTouchOrMoveReturnEvent(event);
            if (dragging) {
                if (isScale) {
                    const newStyle = {...this.state.oriPos};
                    const offsetX = e.clientX - this.state.oriPos.mouseX;
                    newStyle.width += offsetX;
                    newStyle.height += offsetX / this.state.rate; // 根据width和缩放比例算出height
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
                dragObj.style.left = `${e.clientX - mouseX + objX}px`;
                dragObj.style.top = `${e.clientY - mouseY + objY}px`;

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
        const handleEnd = () => { // 拖动结束
            dragging = false;
            isScale = false;
            operateTarget = undefined;
        };
        const handleScaleStart = event => { // 缩放开始
            const e = this.judgeTouchOrMoveReturnEvent(event);
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
        document.addEventListener('touchmove', handleMove, {passive: false});
        document.addEventListener('touchend', handleEnd);

        // 注册move事件（pc端）
        dragObj.onmousedown = handleStart;
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);

        // 注册缩放事件（移动端）
        scaleRef.ontouchstart = handleScaleStart;

        // 注册缩放事件（pc端）
        scaleRef.onmousedown = handleScaleStart;

        return () => {
            document.removeEventListener('touchmove', handleMove, {passive: false});
            document.removeEventListener('touchend', handleEnd);
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
        };
    }

    render () {
        const {
            videoSrc,
            imageSrc,
            closePromptArea,
            type,
            ...props
        } = this.props;

        const {
            style,
            title,
            imageTextScale,
            transformOrigin,
            ...state
        } = this.state;
        const styleImg = {
            backgroundImage: `url(${imageSrc})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain', // contain的优点是会保留背景图片的宽高比，不会被拉伸变形，所以适用于保留背景图片宽高比的需求
            backgroundPositionX: 'center',
            backgroundPositionY: 'center'
        };
        return (
            <div
                ref={r => {
                    this.myRef = r;
                }}
                style={style}
                className={c.drawingItem}
            >
                <div
                    className={c.title}
                >{title}</div>
                <img
                    className={
                        classNames('play_audio', {
                            [c.closeIcon]: true
                        })
                    }
                    src={require('./close.svg')}
                    alt={''}
                    onClick={closePromptArea}
                />
                <div
                    ref={r => {
                        this.showRef = r;
                    }}
                    className={c.showContent}
                >
                    {type === '视频' ? (<video
                        ref={r => {
                            this.videoRef = r;
                        }}
                        className={c.video}
                        src={videoSrc}
                        controls={'controls'}
                        autoPlay={title?.includes('介绍') ? null : 'autoplay'}
                        controlsList="nodownload"
                        disablePictureInPicture
                    >
                    </video>) : <div
                        className={c.imageTextContent}
                    >
                        <div
                            className={c.imageTextContain}
                            ref={r => {
                                this.imageTextRef = r;
                            }}
                            style={
                                {
                                    ...styleImg,
                                    transformOrigin: `${transformOrigin}`,
                                    transform: `scale(${imageTextScale})`
                                }
                            }
                        >
                        </div>
                    </div>}
                </div>
                {
                    type === '图文' &&
                    <div
                        className={c.imageScale}
                        ref={r => {
                            this.imageScaleRef = r;
                        }}
                    >
                        <img
                            className={c.bigIcon}
                            src={require('./big.svg')}
                            alt={''}
                            onClick={this.handleBig}
                        />
                        <img
                            className={c.smallIcon}
                            src={require('./small.svg')}
                            alt={''}
                            onClick={this.handleSmall}
                        />
                    </div>
                }
                <div>
                    <img
                        ref={r => {
                            this.scaleRef = r;
                        }}
                        className={c.scale}
                        draggable={false}
                        src={scaleIcon}
                        alt={''}
                    />
                </div>

            </div>
        );
    }
}

PromptArea.propTypes = {
    children: PropTypes.node,
    videoSrc: PropTypes.string,
    closePromptArea: PropTypes.func,
    type: PropTypes.string,
    imageSrc: PropTypes.string,
    title: PropTypes.string
};

const mapStateToProps = state => ({
});
const mapDispatchToProps = () => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(PromptArea);
