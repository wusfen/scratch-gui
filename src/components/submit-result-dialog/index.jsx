/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';


import styles from './styles.css';

const statusMap = {
    跳过: {
        text: `即将跳过本次挑战`,
        style: styles.submitX
    },
    提交中: {
        text1: '正在提交作业···',
        text2: '请稍等',
        style: styles.submitIng
    },
    提交中超时: {
        text1: '正在提交作业···',
        text2: '请稍等',
        style: styles.submitIng
    },
    已提交正确: {
        text: `恭喜你答对了！\n马上继续上课了哦`,
        style: styles.submitCorrect
    },
    已提交错误: {
        text: `答案还差一点点\n再改一下试试吧！`,
        style: styles.submitFault
    },
    已提交人工: {
        text: `作品已提交！\n需班主任二次批改确认！`,
        style: styles.submitEd
    },
    已提交未知: {
        text: `作品已提交！\n老师正在批改，请稍候！`,
        style: styles.submitEd
    }
};


class Component extends React.Component{
    constructor (props) {
        super(props);
        this.state = this.getInitState();

        bindAll(this, [
            'handleClose',
            'startBackTimer'
        ]);

        for (const status in statusMap) {
            addEventListener(`submit:${status}`, e => {
                this.setState({
                    isShow: true,
                    status: status
                });

                if (!/提交中|错误/.test(status)) {
                    this.startBackTimer();
                }

                if (/已提交/.test(status)) {
                    if (/正确/.test(status)) {
                        new Audio(require('./audio/批改正确.mp3')).play();
                    } else if (/错误/.test(status)) {
                        new Audio(require('./audio/批改错误.mp3')).play();
                    } else {
                        new Audio(require('./audio/没有批改结果.mp3')).play();
                    }
                }

            });
            addEventListener(`error`, e => {
                this.setState({
                    isShow: false
                });
            });
        }

    }
    getInitState () {
        return {
            status: '提交中',
            isShow: false,
            isShowBackButton: false,
            backTimeRemain: 10
        };
    }
    handleClose () {
        if (this.state.isShowBackButton) {
            window.bridge.emit('exitEditor');
        }

        this.props.vm.stopAll();
        this.setState(this.getInitState());
        clearInterval(this.timer);
    }
    startBackTimer () {
        this.setState({
            isShowBackButton: true
        });

        let backTimeRemain = this.state.backTimeRemain;
        this.timer = setInterval(() => {
            if (backTimeRemain <= 0) {
                this.handleClose();
                return;
            }

            backTimeRemain -= 1;
            this.setState({
                backTimeRemain
            });
        }, 1000);
    }
    render () {
        const {
            isShow,
            isShowBackButton,
            backTimeRemain,
            status
        } = this.state;

        const text = statusMap[status].text;
        const text1 = statusMap[status].text1;
        const text2 = statusMap[status].text2;

        return (
            <div
                hidden={!isShow}
                className={classNames(styles.overlay,
                    statusMap[status].style
                )}
            >
                <div className={classNames(styles.container)} >
                    <div className={classNames(styles.bgImg)} />

                    <div className={classNames(styles.text)}>
                        {text}
                        <div className={classNames(styles.text1)}>{text1}</div>
                        <div className={classNames(styles.text2)}>{text2}</div>
                    </div>

                    <button
                        hidden={!(isShowBackButton)}
                        type="button"
                        className={classNames(styles.button)}
                        onClick={this.handleClose}
                    >
                        {`返回课程 (${backTimeRemain}s)`}
                    </button>
                    <button
                        hidden={!(/错误/.test(status))}
                        type="button"
                        className={classNames(styles.button)}
                        onClick={this.handleClose}
                    >
                        {`确定`}
                    </button>

                    <button
                        hidden={!(/跳过|超时|已提交/.test(status))}
                        type="button"
                        className={classNames(styles.close)}
                        onClick={this.handleClose}
                    >
                        {'x'}
                    </button>
                </div>
            </div>
        );
    }
}

Component.propTypes = {
};

export default Component;
