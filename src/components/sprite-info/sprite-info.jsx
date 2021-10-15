import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import Box from '../box/box.jsx';
import Label from '../forms/label.jsx';
import Input from '../forms/input.jsx';
import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import DirectionPicker from '../../containers/direction-picker.jsx';
import SB3Downloader from '../../containers/sb3-downloader.jsx';
import {injectIntl, intlShape, defineMessages, FormattedMessage} from 'react-intl';

import {STAGE_DISPLAY_SIZES} from '../../lib/layout-constants.js';
import {isWideLocale} from '../../lib/locale-utils.js';
import {
    manualUpdateProject
} from '../../reducers/project-state';
import {
    closeFileMenu,
    closeLanguageMenu
} from '../../reducers/menus';
import styles from './sprite-info.css';
import Icon from '../../assets/icons/icon.jsx';

import xIcon from './X.svg';
import yIcon from './Y.svg';
import showIcon from './icon--show.svg';
import hideIcon from './icon--hide.svg';

import rotateIcon from './rotate.svg';

import isometricIcon from './isometric.svg';
import omit from './omit.svg';
import bindAll from 'lodash.bindall';
import Dialog from '../dialog/index.jsx';
import VM from 'scratch-vm';
import resetIcon from '../../assets/icons/redo.svg';
import {param} from '../../lib/param.js';
import {ajax} from '../../lib/ajax.js';
import {project} from '../../lib/project.js';
import folderIcon from '../../assets/icons/folder.svg';
import fileUp from '../../assets/icons/fileUp.svg';
import MenuBarHOC from '../../containers/menu-bar-hoc.jsx';
import collectMetadata from '../../lib/collect-metadata';
import getParam from '../../lib/param';
import {selectLocale} from '../../reducers/locales';
const BufferedInput = BufferedInputHOC(Input);


const messages = defineMessages({
    spritePlaceholder: {
        id: 'gui.SpriteInfo.spritePlaceholder',
        defaultMessage: 'Name',
        description: 'Placeholder text for sprite name'
    }
});

class SpriteInfo extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClickResetFile',
            'handleClickSave',
            'getSaveToComputerHandler',
            'showMoreFunc',
            'hideMoreFunc',
            'handleTouchStart',
            'handleTouchOutside',
            'handleLanguageChange'
        ]);
        this.state = {
            file: param('file'),
            moreFuncShow: false,
            mode: getParam('mode') || '',
            isUat: getParam('base') === 'uat' || window.location.pathname.includes('/uat/') || window.location.origin.includes('//uat-')
        };
    }

    componentDidMount () {
        this.moreFuncBtnRef?.addEventListener('touchstart', this.handleTouchStart);
        document.addEventListener('touchstart', this.handleTouchOutside);
        const blocklyWorkspaces = Array.from(document.getElementsByClassName('blocklyWorkspace'));
        blocklyWorkspaces.forEach(item => {
            item.addEventListener('touchstart', this.handleTouchOutside, true);
        });
    }

    shouldComponentUpdate (nextProps, nextState) {
        return (
            this.props.rotationStyle !== nextProps.rotationStyle ||
            this.props.disabled !== nextProps.disabled ||
            this.props.name !== nextProps.name ||
            this.props.stageSize !== nextProps.stageSize ||
            this.props.visible !== nextProps.visible ||
            // Only update these if rounded value has changed
            Math.round(this.props.direction) !== Math.round(nextProps.direction) ||
            Math.round(this.props.size) !== Math.round(nextProps.size) ||
            Math.round(this.props.x) !== Math.round(nextProps.x) ||
            Math.round(this.props.y) !== Math.round(nextProps.y) ||
            this.state.moreFuncShow !== nextState.moreFuncShow
        );
    }

    componentWillUnmount () {
        this.moreFuncBtnRef.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchstart', this.handleTouchOutside);
        const blocklyWorkspaces = Array.from(document.getElementsByClassName('blocklyWorkspace'));
        blocklyWorkspaces.forEach(item => {
            item.removeEventListener('touchstart', this.handleTouchOutside, true);
        });
    }

    handleTouchStart (e) {
        if (!this.state.moreFuncShow) {
            e.preventDefault();
            this.showMoreFunc();
        }
    }

    handleTouchOutside (e) {
        if (this.state.moreFuncShow && !this.containerRef.contains(e.target)) {
            this.setState({
                moreFuncShow: false
            });
        }
    }

    handleClickResetFile () {
        project.resetProjectByFileParam();
    }

    handleClickSave () {
        this.props.onClickSave();
        this.props.onRequestCloseFile();
    }

    getSaveToComputerHandler (downloadProjectCallback) {
        return () => {
            dispatchEvent(new Event('saveToComputer'));
            this.props.onRequestCloseFile();
            downloadProjectCallback();
            if (this.props.onProjectTelemetryEvent) {
                const metadata = collectMetadata(this.props.vm, this.props.projectTitle, this.props.locale);
                this.props.onProjectTelemetryEvent('projectDidSave', metadata);
            }
        };
    }

    showMoreFunc () {
        if (this.closeTimeoutId) {
            clearTimeout(this.closeTimeoutId);
        } else {
            this.setState({
                moreFuncShow: true
            });
        }
    }

    hideMoreFunc (e) {
        this.closeTimeoutId = setTimeout(() => {
            this.setState({
                moreFuncShow: false
            });
            this.closeTimeoutId = null;
            clearTimeout(this.closeTimeoutId);
        }, 200);
    }

    handleLanguageChange (e) {
        const newLocale = e.target.name;
        if (this.props.messagesByLocale[newLocale]) {
            this.props.onChangeLanguage(newLocale);
            document.documentElement.lang = newLocale;
        }
    }

    render () {
        const {
            stageSize,
            onStartSelectingFileUpload,
            locale
        } = this.props;

        const {moreFuncShow, mode, isUat} = this.state;

        const sprite = (
            <FormattedMessage
                defaultMessage="Sprite"
                description="Sprite info label"
                id="gui.SpriteInfo.sprite"
            />
        );
        const showLabel = (
            <FormattedMessage
                defaultMessage="Show"
                description="Sprite info show label"
                id="gui.SpriteInfo.show"
            />
        );
        const sizeLabel = (
            <FormattedMessage
                defaultMessage="Size"
                description="Sprite info size label"
                id="gui.SpriteInfo.size"
            />
        );

        const labelAbove = isWideLocale(this.props.intl.locale);

        return (
            <Box className={styles.spriteInfo}>
                <div
                    className={classNames(
                        styles.row
                    )}
                >
                    {/* 角色名 */}
                    <div className={styles.group}>
                        <div className={styles.title}>角色</div>
                        <Label
                            above={labelAbove}
                            // text={sprite}
                            text={''}
                        >
                            <BufferedInput

                                className={classNames(
                                    styles.spriteInput,
                                    {
                                        [styles.columnInput]: labelAbove
                                    },
                                    styles.newInput
                                )}
                                disabled={this.props.disabled || !(/^(normal|teacher)$/.test(mode))}
                                // placeholder={this.props.intl.formatMessage(messages.spritePlaceholder)}
                                tabIndex="0"
                                type="text"
                                value={this.props.disabled ? '' : this.props.name}
                                onSubmit={this.props.onChangeName}
                            />
                        </Label>
                    </div>
                    {/* 显示 */}
                    {/* 控制隐藏和显示（先注释） */}
                    <div className={styles.spriteShowOrHide}>
                        {
                            this.props.visible ?
                                <b
                                    className={classNames(styles.iconWrap)}
                                    name="show"
                                    onClick={this.props.onClickNotVisible}
                                >
                                    <Icon name="show" />
                                </b> :
                                <b
                                    className={classNames('play_audio', {[styles.iconWrap]: true})}
                                    name="hide"
                                    onClick={this.props.onClickVisible}
                                >
                                    <Icon name="hide" />
                                </b>
                        }
                    </div>


                    <div
                        hidden
                        className={labelAbove ? styles.column : styles.group}
                    >
                        <div className={styles.radioWrapper}>
                            <div
                                className={classNames(
                                    styles.radio,
                                    styles.radioFirst,
                                    styles.iconWrapper,
                                    {
                                        [styles.isActive]: this.props.visible && !this.props.disabled,
                                        [styles.isDisabled]: this.props.disabled
                                    }
                                )}
                                tabIndex="0"
                                onClick={this.props.onClickVisible}
                                onKeyPress={this.props.onPressVisible}
                            >
                                <img
                                    className={styles.icon}
                                    src={showIcon}
                                />
                            </div>
                            <div
                                className={classNames(
                                    styles.radio,
                                    styles.radioLast,
                                    styles.iconWrapper,
                                    {
                                        [styles.isActive]: !this.props.visible && !this.props.disabled,
                                        [styles.isDisabled]: this.props.disabled
                                    }
                                )}
                                tabIndex="0"
                                onClick={this.props.onClickNotVisible}
                                onKeyPress={this.props.onPressNotVisible}
                            >
                                <img
                                    className={styles.icon}
                                    src={hideIcon}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.group}>
                        <div className={styles.title}>X</div>
                        <Label
                            above={labelAbove}
                            text=""
                        >
                            {/* <img
                                className={styles.iconWrapperAbs}
                                src={xIcon}
                            /> */}
                            <BufferedInput
                                className={classNames(
                                    styles.smallInput,
                                    styles.newInput
                                )}
                                disabled={this.props.disabled}
                                tabIndex="0"
                                type="text"
                                value={this.props.disabled ? '' : Math.round(this.props.x)}
                                onSubmit={this.props.onChangeX}
                            />
                        </Label>
                    </div>
                    <div className={styles.group}>
                        <div className={styles.title}>Y</div>
                        <Label
                            above={labelAbove}
                            text=""
                        >
                            {/* <img
                                className={styles.iconWrapperAbs}
                                src={yIcon}
                            /> */}
                            <BufferedInput
                                className={classNames(
                                    styles.smallInput,
                                    styles.newInput
                                )}
                                disabled={this.props.disabled}
                                tabIndex="0"
                                type="text"
                                value={this.props.disabled ? '' : Math.round(this.props.y)}
                                onSubmit={this.props.onChangeY}
                            />
                        </Label>
                    </div>
                    <div className={classNames(styles.group)}>
                        <div className={styles.title}>大小</div>
                        <Label
                            secondary
                            above={labelAbove}
                            text=""
                        >
                            {/* <img
                                className={styles.iconWrapperAbs}
                                src={isometricIcon}
                            /> */}
                            <BufferedInput
                                className={classNames(
                                    styles.smallInput,
                                    styles.newInput
                                )}
                                disabled={this.props.disabled}
                                label={sizeLabel}
                                tabIndex="0"
                                type="text"
                                value={this.props.disabled ? '' : Math.round(this.props.size)}
                                onSubmit={this.props.onChangeSize}
                            />
                        </Label>
                    </div>

                    <div className={classNames(styles.group)}>
                        <div className={styles.title}>方向</div>
                        <DirectionPicker
                            direction={Math.round(this.props.direction)}
                            disabled={this.props.disabled}
                            labelAbove={labelAbove}
                            rotationStyle={this.props.rotationStyle}
                            onChangeDirection={this.props.onChangeDirection}
                            onChangeRotationStyle={this.props.onChangeRotationStyle}
                        />
                    </div>

                    <div
                        className={classNames(
                            styles.group,
                            styles.moreFunc)}
                        ref={r => {
                            this.containerRef = r;
                        }}
                    >
                        {moreFuncShow && <div
                            className={classNames(styles.moreContent)}
                            onMouseLeave={this.hideMoreFunc}
                            onMouseEnter={this.showMoreFunc}
                        >
                            <div className={classNames(styles.item)}>
                                <div className={classNames(styles.languageContent)}>
                                    <div className={styles.lanItem}>
                                        <button
                                            type="button"
                                            className={classNames(styles.lanFuncItem, {
                                                [styles.red]: locale === 'zh-cn'
                                            })}
                                            onClick={this.handleLanguageChange}
                                            name={'zh-cn'}
                                        >
                                            简
                                        </button>
                                    </div>
                                    <div className={styles.lanItem}>
                                        <button
                                            type="button"
                                            className={classNames(styles.lanFuncItem, {
                                                [styles.red]: locale === 'zh-tw'
                                            })}
                                            onClick={this.handleLanguageChange}
                                            name={'zh-tw'}
                                        >
                                            繁
                                        </button>
                                    </div>
                                    <div className={styles.lanItem}>
                                        <button
                                            type="button"
                                            className={classNames(styles.lanFuncItem, {
                                                [styles.red]: locale === 'en'
                                            })}
                                            onClick={this.handleLanguageChange}
                                            name={'en'}
                                        >
                                            En
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div
                                hidden={!(mode === 'teacher' || mode === 'normal' || isUat)}
                                className={classNames(styles.item)}
                            >
                                <button
                                    type="button"
                                    className={`${styles.funcItem}`}
                                >
                                    <img
                                        className={styles.funcIcon}
                                        src={folderIcon}
                                        alt="folder"
                                    />
                                    <SB3Downloader>{(className, downloadProjectCallback) => (
                                        <div
                                            className={className}
                                            onClick={this.getSaveToComputerHandler(downloadProjectCallback)}
                                        >
                                            保存到本地
                                        </div>
                                    )}</SB3Downloader>
                                </button>
                            </div>
                            <div
                                hidden={!(mode === 'teacher' || mode === 'normal' || isUat)}
                                className={classNames(styles.item)}
                            >
                                <button
                                    type="button"
                                    className={`${styles.funcItem}`}
                                    onClick={onStartSelectingFileUpload}
                                >
                                    <img
                                        className={styles.funcIcon}
                                        src={fileUp}
                                        alt="fileUp"
                                    />
                                    加载本地文件
                                </button>
                            </div>
                            {mode === 'course' && <div
                                hidden={!(this.state.file)}
                                className={classNames(styles.item)}
                            >
                                <button
                                    type="button"
                                    className={`${styles.funcItem}`}
                                    onClick={this.handleClickResetFile}
                                >
                                    <img
                                        className={styles.funcIcon}
                                        src={resetIcon}
                                        alt="reset"
                                    />
                                    重做
                                </button>
                            </div>}
                        </div>}
                        <div
                            className={classNames(styles.more)}
                            ref={r => {
                                this.moreFuncBtnRef = r;
                            }}
                            onMouseLeave={this.hideMoreFunc}
                            onMouseEnter={this.showMoreFunc}
                        >
                            <img src={omit} />
                        </div>

                    </div>
                </div>
            </Box>
        );
    }
}

SpriteInfo.propTypes = {
    direction: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    disabled: PropTypes.bool,
    intl: intlShape,
    name: PropTypes.string,
    onChangeDirection: PropTypes.func,
    onChangeName: PropTypes.func,
    onChangeRotationStyle: PropTypes.func,
    onChangeSize: PropTypes.func,
    onChangeX: PropTypes.func,
    onChangeY: PropTypes.func,
    onClickNotVisible: PropTypes.func,
    onClickVisible: PropTypes.func,
    onPressNotVisible: PropTypes.func,
    onPressVisible: PropTypes.func,
    rotationStyle: PropTypes.string,
    size: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    visible: PropTypes.bool,
    x: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    y: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    vm: PropTypes.instanceOf(VM).isRequired,
    onClickSave: PropTypes.func,
    onRequestCloseFile: PropTypes.func,
    projectTitle: PropTypes.string,
    locale: PropTypes.string.isRequired,
    onProjectTelemetryEvent: PropTypes.func,
    onStartSelectingFileUpload: PropTypes.func,
    messagesByLocale: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChangeLanguage: PropTypes.func.isRequired
};


const mapStateToProps = state => {
    const test = null;
    return {
        locale: state.locales.locale,
        projectTitle: state.scratchGui.projectTitle,
        currentLocale: state.locales.locale,
        messagesByLocale: state.locales.messagesByLocale
    };
};

const mapDispatchToProps = dispatch => ({
    onClickSave: () => dispatch(manualUpdateProject()),
    onRequestCloseFile: () => dispatch(closeFileMenu()),
    onChangeLanguage: locale => {
        dispatch(selectLocale(locale));
        dispatch(closeLanguageMenu());
    }
});

export default compose(
    injectIntl,
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(SpriteInfo);
