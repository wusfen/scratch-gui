/* eslint-disable no-invalid-this */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import styles from './prompt-area.css';
import scaleIcon from './scale.svg';
import {scale} from 'twgl.js';
const c = styles;

class PromptArea extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            rate: 0, // 缩放比例
            isScale: false, // 是否缩放操作
            style: {
                left: 0,
                top: 0,
                width: '49rem',
                height: '30rem'
            },
            editStyle: { // 可移动区域
                left: 0,
                top: 0,
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            },
            oriPos: { // 开始状态
                top: 0, // 元素的坐标
                left: 0,
                cX: 0, // 鼠标的坐标
                cY: 0
            },
            isDown: false,
            title: '提示',
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
        this.videoRef && this.videoRef.addEventListener('pause', this.videoPause);
    }

    componentWillUnmount (){
        window.removeEventListener('resize', this.initStyle);
        this.videoRef && this.videoRef.removeEventListener('pause', this.videoPause);
    }

    // 手指按下
    handleTouchStart = (handleName, e) => {
        if (handleName === 'scale'){
            this.setState({isScale: true});
        }
        const {style} = this.state;
        // 阻止事件冒泡
        e.stopPropagation();
        this.setState({isDown: true});
        // 鼠标坐标
        const cY = e.targetTouches[0].clientY; // clientX 相对于可视化区域
        const cX = e.targetTouches[0].clientX;
        this.setState({oriPos: {
            ...style, cX, cY
        }});
    }
    // 手指移动
    handleTouchMove = e => {
        e.stopPropagation();
        const {isDown, oriPos, editStyle, style, isScale, rate} = this.state;
        let newStyle;
        // 判断鼠标是否按住
        if (isDown) {
            newStyle = {...oriPos};
            const offsetY = e.targetTouches[0].clientY - oriPos.cY;
            const offsetX = e.targetTouches[0].clientX - oriPos.cX;
            if (isScale){ // 是否是缩放操作
                newStyle.width += offsetX;
                newStyle.height += offsetX / rate; // 根据width和缩放比例算出height
                if (
                    (newStyle.width < 200 && offsetX <= 0) ||
                     (newStyle.width > document.documentElement.clientWidth && offsetX >= 0)
                ) return;
                // if((newStyle.width/newStyle.height) !== rate) return
            } else {
                // 元素当前位置 + 偏移量
                const top = oriPos.top + offsetY;
                const left = oriPos.left + offsetX;
                // 限制必须在这个范围内移动 画板的高度-元素的高度
                newStyle.top = Math.max(0, Math.min(top, editStyle.height - style.height));
                newStyle.left = Math.max(0, Math.min(left, editStyle.width - style.width));
            }
            this.setState({style: newStyle});
        }
    }
    
    // 手指抬起
    handleTouchEnd = e => {
        this.setState({isDown: false});
        this.state.isScale && this.setState({isScale: !this.state.isScale});
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
        // setTimeout(() => {
        //     this.props.closePromptArea();
        // }, 1000);
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
                onTouchStart={this.handleTouchStart.bind(this, '')}
                onTouchEnd={this.handleTouchEnd}
                onTouchMove={this.handleTouchMove}
            >
                <div
                    className={c.title}
                    onTouchStart={e => e.stopPropagation()}
                >{title}</div>
                <img
                    className={c.closeIcon}
                    src={require('./close.svg')}
                    alt=""
                    onClick={closePromptArea}
                />
                <div
                    ref={r => {
                        this.showRef = r;
                    }}
                    className={c.showContent}
                    onTouchStart={e => e.stopPropagation()}
                    onTouchEnd={e => e.stopPropagation()}
                >
                    {type === '视频' ? (<video
                        ref={r => {
                            this.videoRef = r;
                        }}
                        className={c.video}
                        src={videoSrc}
                        controls="controls"
                        autoPlay
                    >
                    </video>) : <div
                        className={c.imageTextContent}
                    >
                        <div
                            className={c.imageTextContain}
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
                        onTouchStart={e => e.stopPropagation()}
                        onTouchEnd={e => e.stopPropagation()}
                    >
                        <img
                            className={c.bigIcon}
                            src={require('./big.svg')}
                            alt=""
                            onClick={this.handleBig}
                        />
                        <img
                            className={c.smallIcon}
                            src={require('./small.svg')}
                            alt=""
                            onClick={this.handleSmall}
                        />
                    </div>
                }
                <img
                    className={c.scale}
                    onTouchStart={this.handleTouchStart.bind(this, 'scale')}
                    src={scaleIcon}
                    alt=""
                />
                {/* <div className={c.scale} onTouchStart={this.onTouchStart.bind(this,'scale')}>
                </div> */}
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
};

const mapStateToProps = state => ({
});
const mapDispatchToProps = () => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(PromptArea);
