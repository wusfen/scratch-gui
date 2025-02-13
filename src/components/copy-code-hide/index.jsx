/* eslint-disable no-shadow */
/* eslint-disable no-negated-condition */
/* eslint-disable prefer-const */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import styles from './styles.css';

const list = [
    {
        label: '事件',
        value: '%{BKY_CATEGORY_EVENTS}',
        checked: false,
        list: [
            {label: '当开始被点击', value: 'event_whenflagclicked', checked: false},
            {label: '当按下 (空格) 键', value: 'event_whenkeypressed', checked: false},
            {label: '当舞台被点击', value: 'event_whenstageclicked', checked: false},
            {label: '当角色被点击', value: 'event_whenthisspriteclicked', checked: false},
            {label: '当 (响度) > (10)', value: 'event_whengreaterthan', checked: false},
            {label: '当背景换成 (背景1)', value: 'event_whenbackdropswitchesto', checked: false},
            {label: '当接收到 (消息1)', value: 'event_whenbroadcastreceived', checked: false},
            {label: '广播 (消息1)', value: 'event_broadcast', checked: false},
            {label: '广播 (消息1) 并等待', value: 'event_broadcastandwait', checked: false},
        ],
    },
    {
        label: '控制',
        value: '%{BKY_CATEGORY_CONTROL}',
        checked: false,
        list: [
            {label: '等待 (1) 秒', value: 'control_wait', checked: false},
            {label: '重复执行 (10) 次', value: 'control_repeat', checked: false},
            {label: '重复执行', value: 'control_forever', checked: false},
            {label: '如果 ( ) 那么', value: 'control_if', checked: false},
            {label: '如果 ( ) 那么 否则', value: 'control_if_else', checked: false},
            {label: '等待 ( )', value: 'control_wait_until', checked: false},
            {label: '重复执行直到 ( )', value: 'control_repeat_until', checked: false},
            {label: '停止 (全部脚本)', value: 'control_stop', checked: false},
            {label: '当作为克隆体启动时', value: 'control_start_as_clone', checked: false},
            {label: '克隆 (自己)', value: 'control_create_clone_of', checked: false},
            {label: '删除此克隆体', value: 'control_delete_this_clone', checked: false},
        ],
    },
    {
        label: '运动',
        value: '%{BKY_CATEGORY_MOTION}',
        checked: false,
        list: [
            {label: '移动 (10) 步', value: 'motion_movesteps', checked: false},
            {label: '右转 (15) 度', value: 'motion_turnright', checked: false},
            {label: '左转 (15) 度', value: 'motion_turnleft', checked: false},
            {label: '移动到 (随机位置)', value: 'motion_goto', checked: false},
            {label: '移动到x:(10) y:(10)', value: 'motion_gotoxy', checked: false},
            {label: '在 (1) 秒内滑行到 (随机位置)', value: 'motion_glideto', checked: false},
            {label: '在 (1) 秒内滑行到x: (10) y: (10)', value: 'motion_glidesecstoxy', checked: false},
            {label: '面向 (90) 方向', value: 'motion_pointindirection', checked: false},
            {label: '面向 (鼠标指针)', value: 'motion_pointtowards', checked: false},
            {label: '将x坐标增加 (1)', value: 'motion_changexby', checked: false},
            {label: '将x坐标设为 (0)', value: 'motion_setx', checked: false},
            {label: '将y坐标增加 (1)', value: 'motion_changeyby', checked: false},
            {label: '将y坐标设为 (0)', value: 'motion_sety', checked: false},
            {label: '碰到边缘就反弹', value: 'motion_ifonedgebounce', checked: false},
            {label: '将旋转方式设为 (左右翻转)', value: 'motion_setrotationstyle', checked: false},
            {label: 'x坐标', value: 'motion_xposition', checked: false},
            {label: 'y坐标', value: 'motion_yposition', checked: false},
            {label: '方向', value: 'motion_direction', checked: false},
        ],
    },
    {
        label: '外观',
        value: '%{BKY_CATEGORY_LOOKS}',
        checked: false,
        list: [
            {label: '说 (你好！) (2) 秒', value: 'looks_sayforsecs', checked: false},
            {label: '说 (你好！)', value: 'looks_say', checked: false},
            {label: '思考 (嗯.....) (2) 秒', value: 'looks_thinkforsecs', checked: false},
            {label: '思考 (嗯.....)', value: 'looks_think', checked: false},
            {label: '换成 (背景1) 背景', value: 'looks_switchbackdropto', checked: false},
            {label: '换成 (背景1) 背景并等待', value: 'looks_switchbackdroptoandwait', checked: false},
            {label: '下一个背景', value: 'looks_nextbackdrop', checked: false},
            {label: '换成 (造型1) 造型', value: 'looks_switchcostumeto', checked: false},
            {label: '下一个造型', value: 'looks_nextcostume', checked: false},
            {label: '将大小增加 (10)', value: 'looks_changesizeby', checked: false},
            {label: '将大小设为 (100)', value: 'looks_setsizeto', checked: false},
            {label: '将 (颜色) 特效增加 (10)', value: 'looks_changeeffectby', checked: false},
            {label: '将 (颜色) 特效设定为 (0)', value: 'looks_seteffectto', checked: false},
            {label: '清除图形特效', value: 'looks_cleargraphiceffects', checked: false},
            {label: '显示', value: 'looks_show', checked: false},
            {label: '隐藏', value: 'looks_hide', checked: false},
            {label: '移动到最 (前面)', value: 'looks_gotofrontback', checked: false},
            {label: '(前移) (1) 层', value: 'looks_goforwardbackwardlayers', checked: false},
            {label: '造型 (编号)', value: 'looks_costumenumbername', checked: false},
            {label: '背景 (编号)', value: 'looks_backdropnumbername', checked: false},
            {label: '大小', value: 'looks_size', checked: false},
        ],
    },
    {
        label: '声音',
        value: '%{BKY_CATEGORY_SOUND}',
        checked: false,
        list: [
            {label: '播放声音 (pop) 等待播完', value: 'sound_playuntildone', checked: false},
            {label: '播放声音 (pop)', value: 'sound_play', checked: false},
            {label: '停止所有声音', value: 'sound_stopallsounds', checked: false},
            {label: '将 (音调) 音效增加 (10)', value: 'sound_changeeffectby', checked: false},
            {label: '将 (音调) 音效设为 (100)', value: 'sound_seteffectto', checked: false},
            {label: '清除音效', value: 'sound_cleareffects', checked: false},
            {label: '将音量增加 (-10)', value: 'sound_changevolumeby', checked: false},
            {label: '将音量设为 (100)%', value: 'sound_setvolumeto', checked: false},
            {label: '音量', value: 'sound_volume', checked: false},
        ],
    },
    {
        label: '侦测',
        value: '%{BKY_CATEGORY_SENSING}',
        checked: false,
        list: [
            {label: '碰到 (鼠标指针) ?', value: 'sensing_touchingobject', checked: false},
            {label: '碰到颜色 ( ) ?', value: 'sensing_touchingcolor', checked: false},
            {label: '颜色 ( ) 碰到 ( )', value: 'sensing_coloristouchingcolor', checked: false},
            {label: '到 (鼠标指针) 的距离', value: 'sensing_distanceto', checked: false},
            {label: '询问 (你叫什么名字) 并等待', value: 'sensing_askandwait', checked: false},
            {label: '回答', value: 'sensing_answer', checked: false},
            {label: '按下 (空格) 键?', value: 'sensing_keypressed', checked: false},
            {label: '按下鼠标?', value: 'sensing_mousedown', checked: false},
            {label: '鼠标的x坐标', value: 'sensing_mousex', checked: false},
            {label: '鼠标的y坐标', value: 'sensing_mousey', checked: false},
            {label: '将拖动模式设为 (可拖动)', value: 'sensing_setdragmode', checked: false},
            {label: '响度', value: 'sensing_loudness', checked: false},
            {label: '计时器', value: 'sensing_timer', checked: false},
            {label: '计时器归零', value: 'sensing_resettimer', checked: false},
            {label: '(舞台) 的 (背景编号)', value: 'sensing_of', checked: false},
            {label: '当前时间的 (年)', value: 'sensing_current', checked: false},
            {label: '2000年至今的天数', value: 'sensing_dayssince2000', checked: false},
            {label: '用户名', value: 'sensing_username', checked: false},
        ],
    },
    {
        label: '运算',
        value: '%{BKY_CATEGORY_OPERATORS}',
        checked: false,
        list: [
            {label: '( ) + ( )', value: 'operator_add', checked: false},
            {label: '( ) - ( )', value: 'operator_subtract', checked: false},
            {label: '( ) * ( )', value: 'operator_multiply', checked: false},
            {label: '( ) / ( )', value: 'operator_divide', checked: false},
            {label: '在 (1) 和 (10) 之间取随机数', value: 'operator_random', checked: false},
            {label: '( ) > ( )', value: 'operator_gt', checked: false},
            {label: '( ) < ( )', value: 'operator_lt', checked: false},
            {label: '( ) = ( )', value: 'operator_equals', checked: false},
            {label: '( ) 与 ( )', value: 'operator_and', checked: false},
            {label: '( ) 或 ( )', value: 'operator_or', checked: false},
            {label: '( ) 不成立', value: 'operator_not', checked: false},
            {label: '连接 ( ) 和 ( ) ', value: 'operator_join', checked: false},
            {label: '( ) 的第 ( ) 个字符', value: 'operator_letter_of', checked: false},
            {label: '( ) 的字符数', value: 'operator_length', checked: false},
            {label: '( ) 包含 ( ) ?', value: 'operator_contains', checked: false},
            {label: '( ) 除以 ( ) 的余数', value: 'operator_mod', checked: false},
            {label: '四舍五入 ( )', value: 'operator_round', checked: false},
            {label: '[绝对值] ( )', value: 'operator_mathop', checked: false},
        ],
    },
    {
        label: '变量',
        value: '%{BKY_CATEGORY_VARIABLES}',
        checked: false,
        list: [
        // 未处理
        // {label: '将( )设为( )', value: 'data_setvariableto', checked: false},
        // {label: '将( )增加( )', value: 'data_changevariableby', checked: false},
        // {label: '显示变量( )', value: 'data_showvariable', checked: false},
        // {label: '隐藏变量( )', value: 'data_hidevariable', checked: false},
        ],
    },
    {
        label: '自制积木',
        value: '%{BKY_CATEGORY_MYBLOCKS}',
        checked: false,
        list: [],
    },
    {
        label: '音乐',
        value: 'music',
        checked: false,
        list: [
            {label: '击打 ((1) 小军鼓) (0.25) 拍', value: 'music_playDrumForBeats', checked: false},
            {label: '休止 (0.25) 拍', value: 'music_restForBeats', checked: false},
            {label: '演奏音符 (60) (0.25) 拍', value: 'music_playNoteForBeats', checked: false},
            {label: '将乐器设为 ((1) 钢琴)', value: 'music_setInstrument', checked: false},
            {label: '将演奏速度设定为 (60)', value: 'music_setTempo', checked: false},
            {label: '将演奏速度增加 (20)', value: 'music_changeTempo', checked: false},
            {label: '演奏速度', value: 'music_getTempo', checked: false},
        ],
    },
    {
        label: '画笔',
        value: 'pen',
        checked: false,
        list: [
            {label: '全部擦除', value: 'pen_clear', checked: false},
            {label: '图章', value: 'pen_stamp', checked: false},
            {label: '落笔', value: 'pen_penDown', checked: false},
            {label: '抬笔', value: 'pen_penUp', checked: false},
            {label: '将笔的颜色设为 ( )', value: 'pen_setPenColorToColor', checked: false},
            {label: '将笔的 (颜色) 增加 (10)', value: 'pen_changePenColorParamBy', checked: false},
            {label: '将笔的 (颜色) 设为 (0)', value: 'pen_setPenColorParamTo', checked: false},
            {label: '将笔的粗细增加 (1)', value: 'pen_changePenSizeBy', checked: false},
            {label: '将笔的粗细设为 (1)', value: 'pen_setPenSizeTo', checked: false},
        ],
    },
    {
        label: '视频侦测',
        value: 'videoSensing',
        checked: false,
        list: [
            {label: '当视频运动 > (10)', value: 'videoSensing_whenMotionGreaterThan', checked: false},
            {label: '相对于 (角色) 的视频 (运动)', value: 'videoSensing_videoOn', checked: false},
            {label: '开启摄像头', value: 'videoSensing_videoToggle', checked: false},
            {label: '将视频透明度设为 (50)', value: 'videoSensing_setVideoTransparency', checked: false},
        ],
    },
    {
        label: '文字朗读',
        value: 'text2speech',
        checked: false,
        list: [
            {label: '朗读 (你好)', value: 'text2speech_speakAndWait', checked: false},
            {label: '使用 (中音) 嗓音', value: 'text2speech_setVoice', checked: false},
            {label: '将朗读语言设置为 (中文)', value: 'text2speech_setLanguage', checked: false},
        ],
    },
    {
        label: '翻译',
        value: 'translate',
        checked: false,
        list: [
            {label: '将 (你好) 译为 (英语)', value: 'translate_getTranslate', checked: false},
            {label: '访客语言', value: 'translate_getViewerLanguage', checked: false},
        ],
    },
];

class Component extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            isShow: false,
            list,
            index: 0,
        };

        this.addEventListener(`menu:hideCode`, e => {
            this.initState();
            this.setState({
                isShow: true,
            });
        });

        bindAll(this, [
            'handleClose',
            'handleSave',
        ]);
    }
    initState () {

        // window.vcode_toolbox = {
        //     "%{BKY_CATEGORY_LOOKS}": {
        //         "looks_sayforsecs": true,
        //     }
        // }

        const vcode_toolbox = window.vcode_toolbox || {};
        console.log('vcode_toolbox', vcode_toolbox);

        for (const typeObj of list) {
            typeObj.checked = typeObj.value in vcode_toolbox;
            typeObj.list.forEach(item => {
                const typeConfig = vcode_toolbox[typeObj.value] || {};
                item.checked = item.value in typeConfig;
            });
        }

        this.setState({list});
    }
    // 分类选框
    handleCheckType (index) {
        this.setState({index}, e => {
            this.handleCurSelectAll();
        });
    }
    // 分类标签
    handleSelectType (index) {
        this.setState({index});
    }
    // 全选按钮（所有）
    handleSelectAll () {
        const isAllSelected = this.isAllSelected();

        list.forEach(e => {
            e.checked = !isAllSelected;
            e.list.forEach(ee => {
                ee.checked = !isAllSelected;
            });
        });
        this.setState({
            list
        });
    }
    // 当前分类全选
    handleCurSelectAll () {
        const curList = this.getCurList();
        const isCurAllSelected = this.isCurAllSelected();

        for (const blockItem of curList) {
            if (isCurAllSelected) {
                this.handleSelectBlock(blockItem);
            } else if (!blockItem.checked) {
                this.handleSelectBlock(blockItem);
            }
        }

        // !length
        if (!curList.length) {
            const index = this.state.index;
            list[index].checked = !list[index].checked;
            this.setState({list});
        }
    }
    // 勾选积木
    handleSelectBlock (selObj) {
        selObj.checked = !selObj.checked;

        list[this.state.index].checked = !this.isCurNoneSelected();

        this.setState({list});
    }
    getCurList () {
        return list[this.state.index].list;
    }
    isCurAllSelected () {
        const curList = this.getCurList();
        for (const blockItem of curList) {
            if (!blockItem.checked) {
                return false;
            }
        }
        return true;
    }
    isCurNoneSelected () {
        const curList = this.getCurList();
        for (const blockItem of curList) {
            if (blockItem.checked) {
                return false;
            }
        }
        return true;
    }
    isAllSelected () {
        for (const typeItem of list) {
            for (const blockItem of typeItem.list) {
                if (!blockItem.checked) {
                    return false;
                }
            }
        }
        return true;
    }
    isNodeSelected () {
        for (const typeItem of list) {
            for (const blockItem of typeItem.list) {
                if (blockItem.checked) {
                    return false;
                }
            }
        }
        return true;
    }
    handleClose () {
        this.setState({
            isShow: false
        });
    }
    handleSave () {
        const {
            // eslint-disable-next-line no-shadow
            list
        } = this.state;

        const config = this.toConfig();
        let canConfig = true;
        if (Object.getOwnPropertyNames(config).length == 0) {
            canConfig = false;
        }


        for (const typeValue in config) {
            if (typeValue != '%{BKY_CATEGORY_VARIABLES}' && typeValue != '%{BKY_CATEGORY_MYBLOCKS}') {
                if (Object.getOwnPropertyNames(config[typeValue]).length == 0) {
                    canConfig = false;
                }
            }

        }

        if (canConfig) {
            window.vcode_toolbox = config;
            console.log('vcode_toolbox save', window.vcode_toolbox);
            dispatchEvent(new Event('updateToolBox'));
            this.handleClose();
        } else {
            alert('最少要保留一个模块。里面有一个代码块哦');
        }
    }
    toConfig () {
        const {
            list
        } = this.state;

        const config = {};

        for (const typeItem of list) {
            if (typeItem.checked) {
                config[typeItem.value] = {};
                for (const blockItem of typeItem.list) {
                    if (blockItem.checked) {
                        config[typeItem.value][blockItem.value] = true;
                    }

                }
            }
        }
        return config;
    }
    render () {
        const {
            isShow,
            list,
            index,
        } = this.state;

        const curList = this.getCurList();

        // 左边分类列表
        const blocksTypeList = [];
        for (let i = 0; i < list.length; i++) {
            blocksTypeList.push(
                <div
                    className={styles.li}
                    key={i}
                >
                    <input
                        type="checkbox"
                        onChange={this.handleCheckType.bind(this, i)}
                        checked={list[i].checked}
                    />
                    <div
                        className={
                            classNames(styles.typeBtn, {
                                [styles.typeBtnSel]: index == i
                            })
                        }
                        onClick={this.handleSelectType.bind(this, i)}
                    >
                        {list[i].label}
                    </div>
                </div>
            );
        }

        // 右边当前分类积木列表
        const blocksCodeList = [
            <label
                key={'j00'}
                className={classNames(styles.codeBtn)}
            >
                <input
                    type="checkbox"
                    checked={this.isCurAllSelected()}
                    onChange={this.handleCurSelectAll.bind(this)}
                />
                全选
            </label>
        ];
        for (const blockItem of curList) {
            blocksCodeList.push(
                <label
                    key={blockItem.value}
                    className={classNames(styles.codeBtn)}
                >
                    <input
                        type="checkbox"
                        onChange={this.handleSelectBlock.bind(this, blockItem)}
                        checked={blockItem.checked}
                    />
                    {blockItem.label}
                </label>
            );
        }

        return (
            <div
                hidden={!isShow}
                className={classNames(styles.overlay)}
            >
                <div className={classNames(styles.container)}>
                    <div className={classNames(styles.title)}>
                        请勾选对学生显示的积木块
                    </div>
                    <div className={classNames(styles.typeListContainer)}>
                        {blocksTypeList}
                        <label
                            className={styles.selectAll}
                        >
                            <input
                                type="checkbox"
                                checked={this.isAllSelected()}
                                onChange={this.handleSelectAll.bind(this)}
                            />
                            全选
                        </label>
                    </div>
                    <div className={classNames(styles.codeListContainer)}>
                        {curList.length ? blocksCodeList : ''}
                    </div>
                    <div className={classNames(styles.tips)}>
                        注意：不论是针对代码盒子，还是针对代码块，均为勾选是显示，不勾选是隐藏
                    </div>
                    <button
                        type="button"
                        className={classNames(styles.button)}
                        onClick={this.handleSave}
                    >
                        保存配置
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
