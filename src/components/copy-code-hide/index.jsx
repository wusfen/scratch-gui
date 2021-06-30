import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import styles from './styles.css';

const codeBlocks = [
    {
        label: "运动",
        value: "%{BKY_CATEGORY_MOTION}",
        checked: false,
        list: [
            { label: "移动(--)步", value: "motion_movesteps", checked: false },
            { label: "右转(--)度", value: "motion_turnright", checked: false },
            { label: "左转(--)度", value: "motion_turnleft", checked: false },
            { label: "移动到(--)位置", value: "motion_goto", checked: false },
            {
                label: "移动到x:(--) y:(--)",
                value: "motion_gotoxy",
                checked: false,
            },
            {
                label: "在(--)秒内滑行到(随机位置)",
                value: "motion_glideto",
                checked: false,
            },
            {
                label: "在(--)秒内滑行到x:(--) y:(--)",
                value: "motion_glidesecstoxy",
                checked: false,
            },
            {
                label: "面向(--)方向",
                value: "motion_pointindirection",
                checked: false,
            },
            {
                label: "面向(鼠标指针)",
                value: "motion_pointtowards",
                checked: false,
            },
            { label: "将x坐标增加(--)", value: "motion_changexby", checked: false },
            { label: "将y坐标增加(--)", value: "motion_changeyby", checked: false },
            { label: "将x坐标设为(--)", value: "motion_setx", checked: false },
            { label: "将y坐标设为(--)", value: "motion_sety", checked: false },
            {
                label: "碰到边缘就反弹",
                value: "motion_ifonedgebounce",
                checked: false,
            },
            {
                label: "将旋转方式设为(左右翻转)",
                value: "motion_setrotationstyle",
                checked: false,
            },
            { label: "x坐标", value: "motion_xposition", checked: false },
            { label: "y坐标", value: "motion_yposition", checked: false },
            { label: "方向", value: "motion_direction", checked: false },
        ],
    },
    {
        label: "外观",
        value: "%{BKY_CATEGORY_LOOKS}",
        checked: false,
        list: [
            { label: "说(xx)(x)秒", value: "looks_sayforsecs", checked: false },
            { label: "说(xx)", value: "looks_say", checked: false },
            {
                label: "思考(x...)(x)秒",
                value: "looks_thinkforsecs",
                checked: false,
            },
            { label: "思考(x...)", value: "looks_think", checked: false },
            {
                label: "换成(--)背景",
                value: "looks_switchbackdropto",
                checked: false,
            },
            { label: "下一个背景", value: "looks_nextbackdrop", checked: false },
            {
                label: "换成(xx)造型",
                value: "looks_switchcostumeto",
                checked: false,
            },
            { label: "下一个造型", value: "looks_nextcostume", checked: false },
            {
                label: "将大小增加(--)",
                value: "looks_changesizeby",
                checked: false,
            },
            { label: "将大小设为(--)", value: "looks_setsizeto", checked: false },
            {
                label: "将(--)特效增加(--)",
                value: "looks_changeeffectby",
                checked: false,
            },
            {
                label: "将(--)特效设定为(--)",
                value: "looks_seteffectto",
                checked: false,
            },
            {
                label: "清除图形特效",
                value: "looks_cleargraphiceffects",
                checked: false,
            },
            { label: "显示", value: "looks_show", checked: false },
            { label: "隐藏", value: "looks_hide", checked: false },
            {
                label: "移动到最(前面)",
                value: "looks_gotofrontback",
                checked: false,
            },
            {
                label: "前移(x)层",
                value: "looks_goforwardbackwardlayers",
                checked: false,
            },
            {
                label: "造型(编号)",
                value: "looks_costumenumbername",
                checked: false,
            },
            {
                label: "背景(编号)",
                value: "looks_backdropnumbername",
                checked: false,
            },
            { label: "大小", value: "looks_size", checked: false },
        ],
    },
    {
        label: "声音",
        value: "%{BKY_CATEGORY_SOUND}",
        checked: false,
        list: [
            {
                label: "播放声音(--)等待播完",
                value: "sound_playuntildone",
                checked: false,
            },
            { label: "播放声音(--)", value: "sound_play", checked: false },
            { label: "停止所有声音", value: "sound_stopallsounds", checked: false },
            {
                label: "将(--)音效增加(--)",
                value: "sound_changeeffectby",
                checked: false,
            },
            {
                label: "将(--)音效设为(--)",
                value: "sound_seteffectto",
                checked: false,
            },
            { label: "清除音效", value: "sound_cleareffects", checked: false },
            {
                label: "将音量增加(--)",
                value: "sound_changevolumeby",
                checked: false,
            },
            { label: "将音量设为(--)", value: "sound_setvolumeto", checked: false },
            { label: "音量", value: "sound_volume", checked: false },
        ],
    },
    {
        label: "事件",
        value: "%{BKY_CATEGORY_EVENTS}",
        checked: false,
        list: [
            {
                label: "当绿旗被点击",
                value: "event_whenflagclicked",
                checked: false,
            },
            {
                label: "当按下(--)键",
                value: "event_whenkeypressed",
                checked: false,
            },
            {
                label: "当舞台被点击",
                value: "event_whenstageclicked",
                checked: false,
            },
            {
                label: "当角色被点击",
                value: "event_whenthisspriteclicked",
                checked: false,
            },
            {
                label: "当(--)>(--)",
                value: "event_whengreaterthan",
                checked: false,
            },
            {
                label: "当背景换成(--)",
                value: "event_whenbackdropswitchesto",
                checked: false,
            },
            {
                label: "当接收到(--)",
                value: "event_whenbroadcastreceived",
                checked: false,
            },
            { label: "广播(--)", value: "event_broadcast", checked: false },
            {
                label: "广播(--)并等待",
                value: "event_broadcastandwait",
                checked: false,
            },
        ],
    },
    {
        label: "控制",
        value: "%{BKY_CATEGORY_CONTROL}",
        checked: false,
        value: '%{BKY_CATEGORY_CONTROL}',
        list: [
            { label: "等待(--)秒", value: "control_wait", checked: false },
            { label: "重复执行(--)次", value: "control_repeat", checked: false },
            { label: "重复执行", value: "control_forever", checked: false },
            { label: "如果()那么", value: "control_if", checked: false },
            { label: "如果()那么 否则", value: "control_if_else", checked: false },
            { label: "等待()", value: "control_wait_until", checked: false },
            {
                label: "重复执行直到",
                value: "control_repeat_until",
                checked: false,
            },
            { label: "停止(--)", value: "control_stop", checked: false },
            { label: "克隆(--)", value: "control_create_clone_of", checked: false },
            {
                label: "当作为克隆体启动时",
                value: "control_start_as_clone",
                checked: false,
            },
            {
                label: "删除此克隆体",
                value: "control_delete_this_clone",
                checked: false,
            },
        ],
    },
    {
        label: "侦测",
        value: "%{BKY_CATEGORY_SENSING}",
        checked: false,
        list: [
            { label: "碰到(--)?", value: "sensing_touchingobject", checked: false },
            {
                label: "碰到颜色(--)?",
                value: "sensing_touchingcolor",
                checked: false,
            },
            {
                label: "颜色(--)碰到(--)",
                value: "sensing_coloristouchingcolor",
                checked: false,
            },
            {
                label: "到(--)的距离",
                value: "sensing_distancetomenu",
                checked: false,
            },
            {
                label: "询问(--)并等待",
                value: "sensing_askandwait",
                checked: false,
            },
            { label: "回答", value: "sensing_answer", checked: false },
            { label: "按下(--)键?", value: "sensing_keypressed", checked: false },
            { label: "按下鼠标?", value: "sensing_mousedown", checked: false },
            { label: "鼠标的x坐标", value: "sensing_mousex", checked: false },
            { label: "鼠标的y坐标", value: "sensing_mousey", checked: false },
            {
                label: "将拖动模式设为(--)",
                value: "sensing_setdragmode",
                checked: false,
            },
            { label: "响度", value: "sensing_loudness", checked: false },
            { label: "计时器", value: "sensing_timer", checked: false },
            { label: "计时器归零", value: "sensing_resettimer", checked: false },
            { label: "(--)的(--)", value: "sensing_of", checked: false },
            { label: "当前时间的(--)", value: "sensing_current", checked: false },
            {
                label: "2000年至今的天数",
                value: "sensing_dayssince2000",
                checked: false,
            },
            { label: "用户名", value: "sensing_username", checked: false },
        ],
    },
    {
        label: "运算",
        value: "%{BKY_CATEGORY_OPERATORS}",
        checked: false,
        list: [
            { label: "加", value: "operator_add", checked: false },
            { label: "减", value: "operator_subtract", checked: false },
            { label: "乘", value: "operator_multiply", checked: false },
            { label: "除", value: "operator_divide", checked: false },
            {
                label: "在(--)和(--)之间取随机数",
                value: "operator_random",
                checked: false,
            },
            { label: "大于", value: "operator_gt", checked: false },
            { label: "小于", value: "operator_lt", checked: false },
            { label: "等于", value: "operator_equals", checked: false },
            { label: "与", value: "operator_and", checked: false },
            { label: "或", value: "operator_or", checked: false },
            { label: "不成立", value: "operator_not", checked: false },
            { label: "连接(--)和(--)", value: "operator_join", checked: false },
            {
                label: "(--)的第(--)个字符",
                value: "operator_letter_of",
                checked: false,
            },
            { label: "(--)的字符数", value: "operator_length", checked: false },
            { label: "(--)包含(--)?", value: "operator_contains", checked: false },
            { label: "(--)除以(--)的余数", value: "operator_mod", checked: false },
            { label: "四舍五入(--)", value: "operator_round", checked: false },
            { label: "绝对值(--)", value: "operator_mathop", checked: false },
        ],
    },
    {
        label: "变量",
        value: "%{BKY_CATEGORY_VARIABLES}",
        checked: false,
        list: [],
    },
    {
        label: "自制积木",
        value: "%{BKY_CATEGORY_MYBLOCKS}",
        checked: false,
        list: [],
    },
];

class Component extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitState();
        bindAll(this, [
            'handleClose',
            'enterHandler'
        ]);

        addEventListener(`menu:hideCode`, e => {
            this.setState({
                isShow: true,
            });
        });
    }
    getInitState() {

        // window.vcode_toolbox = {
        //     "%{BKY_CATEGORY_LOOKS}": {
        //         "looks_sayforsecs": true,
        //     }
        // }
        console.log(" window.vcode_toolbox===>")
        console.log(window.vcode_toolbox)
       
        // for (var j = 0; j < codeBlocks.length; j++) {
        //     codeBlocks[j].checked = true;
        //     for (var m = 0; m < codeBlocks[j].list.length; m++) {
        //         codeBlocks[j].list[m].checked = true;
        //     }
        // }

        for (var i in window.vcode_toolbox) {
            for (var j = 0; j < codeBlocks.length; j++) {
                if (codeBlocks[j].value == i) {
                    codeBlocks[j].checked = true;
                    break;
                }
            }

        }
        for (i in window.vcode_toolbox) {
            for (var k in window.vcode_toolbox[i]) {
                var found = false;
                for (var j = 0; j < codeBlocks.length; j++) {
                    if(codeBlocks[j].value == i){
                        found = true;
                        for (var m = 0; m < codeBlocks[j].list.length; m++) {
                            if (codeBlocks[j].list[m].value == k) {
                                codeBlocks[j].list[m].checked = true;
                                break;
                            }
                        }
                        if(found) break;
                    }
                }
            }
        }

        return {
            isShow: false,
            allSelectCode: false,
            curSelTypeIndex: -1,
            codeBlocks: codeBlocks,
            curSelCodeList: [],
        };
    }
    handleClose() {
        //dispatchEvent(new Event('exit'));
        this.setState(this.getInitState());

    }
    clickTypeBtnHandler(selObj, clickIndex) {
        this.setState({
            curSelCodeList: selObj.list,
            curSelTypeIndex: clickIndex
        })
    }
    //全选&反选代码块
    clickAllSelCodeHandler() {
        this.state.allSelectCode = !this.state.allSelectCode;
        var totalCheckedNum = 0;
        this.state.curSelCodeList.map(e => {
            if (e.checked) {
                totalCheckedNum++;
            }

        })
        if (totalCheckedNum == this.state.curSelCodeList.length) {
            this.state.curSelCodeList.map(e => {
                e.checked = false;
                this.state.allSelectCode = false
            })
        }
        else {
            this.state.curSelCodeList.map(e => {
                e.checked = true;
                this.state.allSelectCode = true;
            })
        }



        this.setState({
            allSelectCode: this.state.allSelectCode,
            curSelCodeList: this.state.curSelCodeList,
        })
    }
    clickCodeBtnHandler(selObj) {
        selObj.checked = !selObj.checked;
        this.setState({
            curSelCodeList: this.state.curSelCodeList,
        })
    }
    enterHandler() {
        const {
            codeBlocks
        } = this.state;

        var configJson = this.getConfigJson();
        var canConfig = true;
        if (Object.getOwnPropertyNames(configJson).length == 0) {
            canConfig = false;
        }
        for (var i in configJson) {
            if (Object.getOwnPropertyNames(configJson[i]).length == 0) {
                canConfig = false;
            }
        }

        console.log(configJson);
        if (canConfig) {
            console.log("==>保存配置成功");
            window.vcode_toolbox = configJson;
            dispatchEvent(new Event('updateToolBox'));
            this.setState(this.getInitState());
        }
        else {
            alert("最少要保留一个模块。里面有一个代码块哦")
        }
    }

    getConfigJson() {
        const {
            codeBlocks
        } = this.state;


        var configJson = {};
        for (let i = 0; i < codeBlocks.length; i++) {
            if (codeBlocks[i].checked) {
                configJson[codeBlocks[i].value] = {};
                for (let j = 0; j < codeBlocks[i].list.length; j++) {
                    if (codeBlocks[i].list[j].checked) {
                        configJson[codeBlocks[i].value][codeBlocks[i].list[j].value] = true;
                    }

                }
            }
        }
        return configJson;
    }

    clickTypeChecked(selTypesBlock) {

        selTypesBlock.checked = !selTypesBlock.checked
        console.log(selTypesBlock.checked)
        this.setState({
            codeBlocks: this.state.codeBlocks
        })
    }

    render() {
        const {
            isShow,
            curSelTypeIndex,
            curSelCodeList,
            allSelectCode,
            codeBlocks
        } = this.state;

        const blocksTypeList = [];
        for (let i = 0; i < codeBlocks.length; i++) {
            blocksTypeList.push(<div key={i}><input type="checkbox" onChange={this.clickTypeChecked.bind(this, codeBlocks[i])} checked={codeBlocks[i].checked} /><div className={curSelTypeIndex == i ? classNames(styles.typeBtnSel) : classNames(styles.typeBtn)} onClick={this.clickTypeBtnHandler.bind(this, codeBlocks[i], i)} > {codeBlocks[i].label}</div></div>)
        }

        const blocksCodeList = [<div key={"j00"} className={classNames(styles.codeBtn)} ><input type="checkbox" checked={allSelectCode} onChange={this.clickAllSelCodeHandler.bind(this)} />反选</div>];

        for (let j = 0; j < curSelCodeList.length; j++) {
            blocksCodeList.push(<div key={j} className={classNames(styles.codeBtn)}><input type="checkbox" onChange={this.clickCodeBtnHandler.bind(this, curSelCodeList[j])} checked={curSelCodeList[j].checked} />{curSelCodeList[j].label}</div>)
        }
        return (
            <div
                hidden={!isShow}
                className={classNames(styles.overlay
                )}
            >
                <div className={classNames(styles.container)} >
                    <div className={classNames(styles.title)}>
                        隐藏代码区
                    </div>
                    <div className={classNames(styles.typeListContainer)}>
                        {blocksTypeList}
                    </div>
                    <div className={classNames(styles.codeListContainer)}>
                        {blocksCodeList.length != 1 ? blocksCodeList : ""}
                    </div>
                    <div className={classNames(styles.tips)}>
                    注意：不论是针对代码盒子，还是针对代码块，均为勾选是显示，不勾选是隐藏
                    </div>
                    <button
                        type="button"
                        className={classNames(styles.button)}
                        onClick={this.enterHandler}
                    >
                        确定隐藏
                    </button>
                    <button
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
