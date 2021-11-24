/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {OPERATE_TIME_2, timerType} from './../timer/data';
import Audio from '../../lib/courseTip/TipAudio.js';

import styles from './styles.css';

const statusMap = {
    跳过: {
        text: `跳过成功，即将返回课程哦~`,
        style: styles.submitX
    },
    从未运行: {
        text: `我们先运行一下代码吧。\n点击确定则开始运行代码哦`,
        style: styles.noRunCode
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
        text: `作品任务完成，\n你太棒啦！`,
        style: styles.submitCorrect
    },
    已提交错误: {
        text: `作品差一点就完成啦，\n再去试试吧！`,
        style: styles.submitFault
    },
    已提交人工: {
        text: `作品已提交！\n需班主任二次批改确认！`,
        style: styles.submitEd
    },
    已提交未知: {
        text: `作品已提交！\n老师正在批改，请稍候！`,
        style: styles.submitEd
    },
};


class Component extends React.Component{
    constructor (props) {
        super(props);
        this.state = this.getInitState();

        bindAll(this, [
            'handleClose',
            'handleExit',
            'startBackTimer'
        ]);

        for (const status in statusMap) {
            addEventListener(`submit:${status}`, e => {
                this.setState({
                    isShow: true,
                    status: status
                });

                if (!/从未运行|提交中|错误/.test(status)) {
                    this.startBackTimer();
                }

                if (/已提交/.test(status)) {
                    if (/正确/.test(status)) {
                        new Audio(require('./audio/success.mp3')).play();
                    } else if (/错误/.test(status)) {
                        new Audio(require('./audio/error.mp3')).play();
                    } else {
                        new Audio(require('./audio/has-not-result.mp3')).play();
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
    handleClose (isHandle = true) {
        if (/从未运行/.test(this.state.status) && isHandle) { // 未运行代码的错误弹窗：点击确定，则自动开始运行代码
            window.dispatchEvent(new Event('runCode'));
            this.setState(this.getInitState());
            clearInterval(this.timer);
            return;
        }

        // TODO 这里已有 `submit:已提交错误` 事件
        if (/错误/.test(this.state.status)) {
            window.dispatchEvent(new Event('提交错误:关闭弹窗'));
        }

        this.props.vm.stopAll();
        this.setState(this.getInitState());
        clearInterval(this.timer);
    }
    handleExit () {
        const status = this.state.status;

        // reset
        this.props.vm.stopAll();
        this.setState(this.getInitState());
        clearInterval(this.timer);

        // exitEditor
        // to: menu-bar.jsx autoSave
        if (/跳过/.test(status)) {
            dispatchEvent(new Event('submit-result-dialog:跳过退出'));
            return;
        }
        if (/正确/.test(status)) {
            // dispatchEvent(new Event('submit-result-dialog:正确退出'));
            window.bridge.emit('exitEditor', {type: 'submit', interaction_passOrNot: window.subjectPassOrNot});
            return;
        }

    }
    startBackTimer () {
        this.setState({
            isShowBackButton: true
        });

        let backTimeRemain = this.state.backTimeRemain;
        this.timer = setInterval(() => {
            if (backTimeRemain <= 0) {
                this.handleExit();
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
                        onClick={this.handleExit}
                    >
                        {`好的 (${backTimeRemain}s)后自动跳转`}
                    </button>
                    <button
                        hidden={!(/从未运行|错误/.test(status))}
                        type="button"
                        className={classNames(styles.button)}
                        onClick={this.handleClose}
                    >
                        {`确定`}
                    </button>

                    <button
                        hidden={!(/从未运行|跳过|超时|已提交/.test(status))}
                        type="button"
                        className={classNames(styles.close)}
                        onClick={() => this.handleClose(false)}
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
