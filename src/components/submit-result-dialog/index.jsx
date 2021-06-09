import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';


import styles from './styles.css';

const statusMap = {
    提交: `作品已提交！\n老师正在批改，请稍候！`,
    轮询: `作品已提交！\n老师正在批改，请稍候！`,
    已提交正确: `答案还差一点点\n再改一下试试吧！`,
    已提交错误: `恭喜你答对了！\n马上继续上课了哦`,
    已提交人工: `作品已提交！\n需班主任二次批改确认！`,
    已提交未知: `作品已提交！\n老师正在批改，请稍候！`,
    已提交异常: `异常`
};

// quitCondition: (1: 答对才能关闭, 2: 作答就可以关闭, 3: 不答也可以关闭)
const quitCondition = (new URL(location)).searchParams.get('quitCondition');

class Component extends React.Component{
    constructor (props) {
        super(props);

        for (const status in statusMap) {
            addEventListener(`submit:${status}`, e => {
                this.setState({
                    isShow: true,
                    status: status
                });

                if (!quitCondition && /已提交/.test(status)) {
                    this.setState({
                        isShowExitButton: true
                    });
                }
                if (quitCondition === '1' && /已提交正确/.test(status)) {
                    this.setState({
                        isShowExitButton: true
                    });
                }
                if (quitCondition === '2' && /已提交/.test(status)) {
                    this.setState({
                        isShowExitButton: true
                    });
                }
                if (quitCondition === '3' && /已提交/.test(status)) {
                    this.setState({
                        isShowExitButton: true
                    });
                }
            });
        }

        this.state = {
            isShow: false,
            isShowExitButton: false
        };

        bindAll(this, [
            'handleClose'
        ]);
    }
    handleClose () {
        this.setState({
            isShow: false
        });

        dispatchEvent(new Event('exit'));
    }
    render () {
        const {
            isShow,
            isShowExitButton,
            status
        } = this.state;
        
        const text = statusMap[status];

        return (
            <div
                hidden={!isShow}
                className={classNames(styles.overlay, styles.submitYes)}
            >
                <div className={classNames(styles.container)} >
                    <div className={classNames(styles.bgImg)} />
                    <div className={classNames(styles.text)}>
                        {text}
                    </div>
                    <button
                        hidden={!isShowExitButton}
                        type="button"
                        className={classNames(styles.button)}
                        onClick={this.handleClose}
                    >
                        {'返回课程'}
                    </button>
                </div>
            </div>
        );
    }
}

Component.propTypes = {
};

export default Component;
