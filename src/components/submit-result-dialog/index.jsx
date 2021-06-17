import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';


import styles from './styles.css';

const statusMap = {
    提交中: {
        text: `作业提交中\n请稍候......`,
        style: styles.submit0
    },
    已提交正确: {
        text: `恭喜你答对了！\n马上继续上课了哦`,
        style: styles.submit1
    },
    已提交错误: {
        text: `答案还差一点点\n再改一下试试吧！`,
        style: styles.submit2
    },
    已提交人工: {
        text: `作品已提交！\n需班主任二次批改确认！`,
        style: styles.submit3
    },
    已提交未知: {
        text: `作品已提交！\n老师正在批改，请稍候！`,
        style: styles.submit3
    }
};


class Component extends React.Component{
    constructor (props) {
        super(props);

        for (const status in statusMap) {
            addEventListener(`submit:${status}`, e => {
                this.setState({
                    isShow: true,
                    status: status
                });

                if (/正确|未知/.test(status)) {
                    this.startBackTimer();
                }

            });
            addEventListener(`error`, e => {
                this.setState({
                    isShow: false
                });
            });
        }

        this.state = {
            status: '提交中',
            isShow: !false,
            backTimeRemain: 10
        };

        bindAll(this, [
            'handleClose',
            'handleOk',
            'startBackTimer'
        ]);
    }
    handleClose () {
        this.setState({
            isShow: false
        });

        if (/正确/.test(this.state.status)) {
            dispatchEvent(new Event('exit'));
        }
    }
    handleOk () {
        this.setState({
            isShow: false
        });
    }
    startBackTimer () {
        let backTimeRemain = this.state.backTimeRemain;
        const timer = setInterval(() => {
            if (backTimeRemain <= 0) {
                clearInterval(timer);
                this.setState({
                    isShow: false,
                    backTimeRemain: 10
                });
                
                dispatchEvent(new Event('exit'));
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
            backTimeRemain,
            status
        } = this.state;

        const text = statusMap[status].text;

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
                    </div>
                    <button
                        hidden={!(/正确|未知/.test(status))}
                        type="button"
                        className={classNames(styles.button)}
                        onClick={this.handleOk}
                    >
                        {`返回课程 (${backTimeRemain}s)`}
                    </button>
                    <button
                        hidden={!(/错误/.test(status))}
                        type="button"
                        className={classNames(styles.button)}
                        onClick={this.handleOk}
                    >
                        {`确定`}
                    </button>
                    <button
                        hidden={!(/已提交/.test(status))}
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
