import {OPERATE_TIME_1, OPERATE_TIME_2, CODE_TIME_1, timerType} from './data'
class Timer {
    constructor (type) {
        this.state = ''
        this.codeTimer = null // 代码计时器
        this.operateTimer1 = null // 操作计时器1
        this.operateTimer2 = null // 操作计时器2
        this.type = type // 计时器类型
        this.createOperateTimer = null
        this.createCodeTimer = null
        this.pauseOperateTimer = null
        this.pauseCodeTimer = null
        this.iniTimertListener() // 初始化计时器监听器
        this.initUserHandleListener() // 初始化用户点击事件的监听
    }
    static isHasUserHandleListener = false // 避免重复初始化用户点击的监听
    initUserHandleListener = () => {
        if(!Timer.isHasUserHandleListener){
            Timer.isHasUserHandleListener = true;
            window.addEventListener('click', this.resetTimer, true);
            console.log(document.getElementsByClassName('blocklyWorkspace')[0]);
            let blocklyWorkspaces = Array.from(document.getElementsByClassName('blocklyWorkspace'));
            blocklyWorkspaces.forEach(item => {
                item.addEventListener('touchstart', this.resetTimer, true);
            })
        }
    }

    iniTimertListener = () => {
        switch (this.type) {
            case timerType.CODE:
                this.createCodeTimer = () => { // 监听创建代码计时器事件
                    if(this.state === 'exist') return;
                    console.log('创建代码计时器');
                   this.createTimer(); // 开始计时
                }
                this.pauseCodeTimer = () => { // 监听终止代码计时器事件
                    if(this.state === '') return;
                    console.log('终止代码计时器');
                    this.pauseTimer(); // 终止计时器
                }
                window.addEventListener('createCodeTimer', this.createCodeTimer);
                window.addEventListener('pauseCodeTimer', this.pauseCodeTimer);
                break;
            case timerType.OPERATE:
                this.createOperateTimer = () => { // 监听创建操作计时器事件
                    if(this.state === 'exist') return;
                    console.log('创建操作计时器');
                    this.createTimer(); // 开始计时
                }
                this.pauseOperateTimer = () => { // 监听终止操作计时器事件
                    if(this.state === '') return;
                    console.log('终止操作计时器');
                    this.auseTimer(); // 终止计时器
                }
                window.addEventListener('createOperateTimer', this.createOperateTimer);
                window.addEventListener('pauseOperateTimer', this.pauseOperateTimer);
                break;
        }
    }
   
    createTimer = () => {
        this.state = 'exist';
        switch (this.type) {
            case timerType.CODE:
                this.codeTimer = setInterval(() => {
                    window.dispatchEvent(new Event(`noAction:${this.type}:${CODE_TIME_1}`));
                }, CODE_TIME_1)
                break;
            case timerType.OPERATE:
                this.operateTimer1 = setTimeout(() => {
                    window.dispatchEvent(new Event(`noAction:${this.type}:${OPERATE_TIME_1}`));
                    clearTimeout(this.operateTimer1);
                    this.operateTimer2 = setTimeout(() => { // OPERATE_TIME_1秒后再触发OPERATE_TIME_2后的事件
                        window.dispatchEvent(new Event(`noAction:${this.type}:${OPERATE_TIME_2}`));
                        clearTimeout(this.operateTimer2);
                        this.createTimer();
                    }, OPERATE_TIME_2)
                }, OPERATE_TIME_1)
                break;
            default:
                break;
        }
    }
    resetTimer = () => {
        switch (this.type) {
            case timerType.CODE:
                this.codeTimer && clearInterval(this.codeTimer);
                break;
            case timerType.OPERATE:
                this.operateTimer1 && clearTimeout(this.operateTimer1);
                this.operateTimer2 && clearTimeout(this.operateTimer2);
                break;
            default:
                break;
        }
        if(this.state === '') return;
        this.createTimer();
    }
    pauseTimer = () => {
        this.state = ''
        switch (this.type) {
            case timerType.CODE:
                this.codeTimer && clearInterval(this.codeTimer);
                break;
            case timerType.OPERATE:
                this.operateTimer1 && clearTimeout(this.operateTimer1);
                this.operateTimer2 && clearTimeout(this.operateTimer2);
                break;
            default:
                break;
        }
        window.removeEventListener('click', this.resetTimer, true);
    }

    removeListener = () => {
        switch (this.type) {
            case timerType.CODE:
                window.removeEventListener('createCodeTimer', this.createCodeTimer);
                window.removeEventListener('pauseCodeTimer', this.pauseCodeTimer);
                break;
            case timerType.OPERATE:
                window.removeEventListener('createOperateTimer', this.createOperateTimer);
                window.removeEventListener('pauseOperateTimer', this.pauseOperateTimer);
                break;
            default:
                break;
        }
        window.removeEventListener('click', this.resetTimer, true);
    }
}


export default Timer;
