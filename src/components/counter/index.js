/* eslint-disable no-invalid-this */
import {
    counterType,
    JSON_COUNT_RANGE_START, JSON_COUNT_RANGE_END, SUBMIT_COUNT_RANGE_1, SUBMIT_COUNT_RANGE_2} from './data';
class Counter {
    constructor (type) {
        this.count = 0;
        this.type = type; // 计数器类型
        this.initListener();
    }

    initListener = () => {
        switch (this.type) {
        case counterType.JSON_ERROR:
            addEventListener('运行时判断不正确', this.counterAdd);
            addEventListener('运行时判断正确', this.resetCounter);
            addEventListener('clickVideoTips', this.resetCounter); // 学生自己点击了提示视频
            break;
        case counterType.SUBMIT_ERROR:
            addEventListener('提交错误:关闭弹窗', this.counterAdd); // 提交错误后关闭弹窗
            break;
        default:
            break;
        }
    }

    counterAdd = () => {
        this.count++;
        this.judgeCount();
    }

    judgeCount = () => {
        if (this.type === counterType.JSON_ERROR) {
            if (JSON_COUNT_RANGE_START <= this.count && this.count < JSON_COUNT_RANGE_END) {
                dispatchEvent(new Event('jsonErrorCounterInRange'));
            } else if (this.count === JSON_COUNT_RANGE_END) {
                dispatchEvent(new Event('jsonErrorCounterOutRange'));
                this.resetCounter(); // 自动播放提示视频，则重置错误计数器为0
            }
        } else if (this.type === counterType.SUBMIT_ERROR) {
            if (this.count === SUBMIT_COUNT_RANGE_1) {
                dispatchEvent(new Event('submitErrorCounter1'));
            } else if (this.count >= SUBMIT_COUNT_RANGE_2) {
                dispatchEvent(new Event('submitErrorCounter2'));
            }
        }
    }

    resetCounter = () => {
        this.count = 0;
    }

    removeListener = () => {
        switch (this.type) {
        case counterType.JSON_ERROR:
            removeEventListener('运行时判断不正确', this.counterAdd);
            removeEventListener('clickVideoTips', this.resetCounter);
            break;
        case counterType.SUBMIT_ERROR:
            removeEventListener('submit:已提交错误', this.counterAdd);
            break;
        default:
            break;
        }
    }

}


export default Counter;
