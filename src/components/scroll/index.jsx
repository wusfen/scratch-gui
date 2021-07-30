/* eslint-disable no-invalid-this */
import React, { Children } from 'react';
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
        // this.switch = false
        bindAll(this, [
        ]);
    }
    componentDidMount () {
        addEventListener('addSprite', this.computeHasScroll)
        this.scrollContentRef.addEventListener('scroll', this.computeIsScrollTop)
    }

    componentWillUnmount () {
        removeEventListener('addSprite', this.computeHasScroll)
        this.scrollContentRef.removeEventListener('scroll', this.computeIsScrollTop)
    }

    computeIsScrollTop = () => {
        if(this.scrollContentRef.scrollTop === 0){ // 判断是否滚动到顶部
            this.setState({
                slideUpImgShow: false
            })
        } else {
            this.setState({
                slideUpImgShow: true
            })
        }
    }

    computeHasScroll = () => {
        if(!this.switch){
            this.switch = true
            let timer = setTimeout(() => {
                if(this.scrollContentRef.scrollHeight > this.scrollContentRef.clientHeight){ // 计算出现滚动条
                    this.setState({
                        slideDownImgShow: true
                    })
                } else {
                    this.setState({
                        slideDownImgShow: false
                    })
                }
                this.switch = false
                clearTimeout(timer)
            }, 300)
        }
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
                {slideUpImgShow ? <div className={styles.slideUp}>
                    <img 
                        className={styles.slideUpImg}
                        src={require('../../assets/icons/slide-up.svg')}
                    />
                </div> : <div className={styles.line}></div>}
                <div className={styles.content} ref={r => {
                    this.scrollContentRef = r;
                }}>
                    {children}
                </div>
                {slideDownImgShow ? <div className={styles.slideDown}>
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
