/* eslint-disable no-invalid-this */
import React, {Children} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';

import styles from './styles.css';
const c = styles;
Object.assign(c, require('../../css/animate.css'));

class Scroll extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            slideUpImgShow: false,
            slideDownImgShow: false,
        };
        bindAll(this, [
        ]);
    }
    componentDidMount () {
        addEventListener('addSprite', this.computeHasScroll);
        this.scrollContentRef.addEventListener('scroll', this.computeIsScrollTop);
    }

    componentWillUnmount () {
        removeEventListener('addSprite', this.computeHasScroll);
        this.scrollContentRef.removeEventListener('scroll', this.computeIsScrollTop);
    }

    computeIsScrollTop = () => {
        if (this.scrollContentRef.scrollTop === 0){ // 判断是否滚动到顶部
            this.setState({
                slideUpImgShow: false
            });
        } else {
            this.setState({
                slideUpImgShow: true
            });
        }

        if (this.scrollContentRef.scrollTop + this.scrollContentRef.clientHeight ===
             this.scrollContentRef.scrollHeight){ // 判断是否滚动到底部
            this.setState({
                slideDownImgShow: false
            });
        } else {
            this.setState({
                slideDownImgShow: true
            });
        }
    }

    computeHasScroll = () => {
        if (!this.switch){
            this.switch = true;
            const timer = setTimeout(() => {
                if (this.scrollContentRef.scrollHeight > this.scrollContentRef.clientHeight){ // 计算出现滚动条
                    this.setState({
                        slideDownImgShow: true
                    });
                } else {
                    this.setState({
                        slideDownImgShow: false
                    });
                }
                this.switch = false;
                clearTimeout(timer);
            }, 300);
        }
    }

    slideUpFunc = () => {
        const nextScrollTop = this.scrollContentRef.scrollTop;
        const that = this;
        let timer = requestAnimationFrame(function fn (){
            if (nextScrollTop - that.scrollContentRef.scrollTop < 100){
                if (that.scrollContentRef.scrollTop === 0){
                    cancelAnimationFrame(timer);
                    return;
                }
                that.scrollContentRef.scrollTop -= 2;
                timer = requestAnimationFrame(fn);
            } else {
                cancelAnimationFrame(timer);
            }
        });
    }

    slideDownFunc = () => {
        const nextScrollTop = this.scrollContentRef.scrollTop;
        const scrollHeight = this.scrollContentRef.scrollHeight;
        const clientHeight = this.scrollContentRef.clientHeight;
        const that = this;
        let timer = requestAnimationFrame(function fn (){
            if (that.scrollContentRef.scrollTop - nextScrollTop < 100){
                if ((that.scrollContentRef.scrollTop + clientHeight) === scrollHeight){
                    cancelAnimationFrame(timer);
                    return;
                }
                that.scrollContentRef.scrollTop += 2;
                timer = requestAnimationFrame(fn);
            } else {
                cancelAnimationFrame(timer);
            }
        });
    }

    render () {
        const {
            children,
            ...props
        } = this.props;

        const {
            slideDownImgShow,
            slideUpImgShow,
            ...state
        } = this.state;

        return (
            <div className={styles.scroll}>
                {slideUpImgShow ? <div
                    className={styles.slideUp}
                    onClick={this.slideUpFunc}
                >
                    <img
                        className={styles.slideUpImg}
                        src={require('../../assets/icons/slide-up.svg')}
                    />
                </div> : <div className={styles.line}></div>}
                <div
                    className={styles.content}
                    ref={r => {
                        this.scrollContentRef = r;
                    }}
                >
                    {children}
                </div>
                {slideDownImgShow ? <div
                    className={styles.slideDown}
                    onClick={this.slideDownFunc}
                >
                    <img
                        className={styles.slideDownImg}
                        src={require('../../assets/icons/slide-down.svg')}
                    />
                </div> : <div className={styles.line}></div>}
            </div>
        );
    }
}

Scroll.propTypes = {
    children: PropTypes.node.isRequired,
};

const mapStateToProps = state => ({
});
const mapDispatchToProps = () => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Scroll);
