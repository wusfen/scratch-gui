import {OPERATE_TIME_1, OPERATE_TIME_2, CODE_TIME_1, timerType} from './data'
class Timer {
    constructor (type) {
        this.state = ''
        this.codeTimer = null // 代码计时器
        this.operateTimer1 = null // 操作计时器1
        this.operateTimer2 = null // 操作计时器2
        this.type = type // 计时器类型
        window.addEventListener('click', this.resetTimer.bind(this), true);
    }
    createTimer = () => {
        this.state = 'exist'
        if(this.type === timerType.CODE) {
            this.codeTimer = setInterval(() => {
                window.dispatchEvent(new Event(`noAction:${this.type}:${CODE_TIME_1}`));
            }, CODE_TIME_1)
        } else if(this.type === timerType.OPERATE){
            this.operateTimer1 = setTimeout(() => {
                window.dispatchEvent(new Event(`noAction:${this.type}:${OPERATE_TIME_1}`));
                clearTimeout(this.operateTimer1)
                this.operateTimer2 = setTimeout(() => {
                    window.dispatchEvent(new Event(`noAction:${this.type}:${OPERATE_TIME_2}`));
                    clearTimeout(this.operateTimer2)
                    this.createTimer()
                }, OPERATE_TIME_2)
            }, OPERATE_TIME_1)
        }
    }
    resetTimer = () => {
        if(this.type === timerType.CODE) {
            this.codeTimer && clearInterval(this.codeTimer)
        }  else if(this.type === timerType.OPERATE){
            this.operateTimer1 && clearTimeout(this.operateTimer1)
            this.operateTimer2 && clearTimeout(this.operateTimer2)
        }
        if(this.state === '') return
        this.createTimer()
    }
    pauseTimer = () => {
        this.state = ''
        if(this.type === timerType.CODE) {
            this.codeTimer && clearInterval(this.codeTimer)
        }  else if(this.type === timerType.OPERATE){
            this.operateTimer1 && clearTimeout(this.operateTimer1)
            this.operateTimer2 && clearTimeout(this.operateTimer2)
        }
        window.removeEventListener('click', this.resetTimer, true);
    }
    render () {
        return ;
    }
}


export default Timer;
