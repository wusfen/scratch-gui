import {TIME_1, TIME_2, timerType} from './data'
class Timer {
    constructor (type, cb = () => {}) {
        this.timeStep1 = TIME_1
        this.timeStep2 = TIME_2
        this.timerStep1 = null // 计时器1
        this.timerStep2 = null // 计时器2
        this.type = type // 计时器类型
        this.cb = cb // 计时器到点回调
        addEventListener(`noAction:${type}:${this.timeStep1}`, () => {
            console.log(111111111111);
        })
        window.addEventListener('touchend', this.resetTimer.bind(this));
    }
    createTimer() {
        this.timerStep1 = setTimeout(() => {
            window.dispatchEvent(new Event(`noAction:${this.type}:${this.timeStep1}`));
            this.createTimer()
            this.cb && this.cb()
        }, this.timeStep1)
        if(this.type === timerType.OPERATE){
            this.timerStep2 = setTimeout(() => {
                window.dispatchEvent(new Event(`noAction:${this.type}:${this.timeStep2}`));
                this.createTimer()
                this.cb && this.cb()
            }, this.timeStep2)
        }
    }
    resetTimer() {
        this.timerStep1 && clearTimeout(this.timerStep1)
        this.timerStep2 && clearTimeout(this.timerStep2)
        this.createTimer()
    }
    pauseTimer() {
        this.timerStep1 && clearTimeout(this.timerStep1)
        this.timerStep2 && clearTimeout(this.timerStep2)
        window.removeEventListener('touchend', this.resetTimer.bind(this));
    }
    render () {
        return ;
    }
}


export default Timer;
