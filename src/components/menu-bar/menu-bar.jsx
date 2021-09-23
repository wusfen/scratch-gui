import classNames from 'classnames';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import bowser from 'bowser';
import React from 'react';

import VM from 'scratch-vm';

import Box from '../box/box.jsx';
import Button from '../button/button.jsx';
import CommunityButton from './community-button.jsx';
import ShareButton from './share-button.jsx';
import {ComingSoonTooltip} from '../coming-soon/coming-soon.jsx';
import Divider from '../divider/divider.jsx';
import LanguageSelector from '../../containers/language-selector.jsx';
import SaveStatus from './save-status.jsx';
import ProjectWatcher from '../../containers/project-watcher.jsx';
import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuItem, MenuSection} from '../menu/menu.jsx';
import ProjectTitleInput from './project-title-input.jsx';
import AuthorInfo from './author-info.jsx';
import AccountNav from '../../containers/account-nav.jsx';
import LoginDropdown from './login-dropdown.jsx';
import SB3Downloader from '../../containers/sb3-downloader.jsx';
import DeletionRestorer from '../../containers/deletion-restorer.jsx';
import TurboMode from '../../containers/turbo-mode.jsx';
import MenuBarHOC from '../../containers/menu-bar-hoc.jsx';
import Dialog from '../dialog/index.jsx';
import Loading from '../loading/index.jsx';

import {openTipsLibrary} from '../../reducers/modals';
import {setPlayer} from '../../reducers/mode';
import Audio from '../../lib/courseTip/TipAudio.js';
import {
    autoUpdateProject,
    getIsUpdating,
    getIsShowingProject,
    manualUpdateProject,
    requestNewProject,
    remixProject,
    saveProjectAsCopy
} from '../../reducers/project-state';
import {setProjectTitle} from '../../reducers/project-title';
import {setUploadingProgress} from '../../reducers/uploading';
import {
    openAboutMenu,
    closeAboutMenu,
    aboutMenuOpen,
    openAccountMenu,
    closeAccountMenu,
    accountMenuOpen,
    openFileMenu,
    closeFileMenu,
    fileMenuOpen,
    openEditMenu,
    closeEditMenu,
    editMenuOpen,
    openLanguageMenu,
    closeLanguageMenu,
    languageMenuOpen,
    openLoginMenu,
    closeLoginMenu,
    loginMenuOpen
} from '../../reducers/menus';

import collectMetadata from '../../lib/collect-metadata';
import saveProjectDifferenceSb3 from './diff-sb3';
import styles from './menu-bar.css';
const c = styles;
Object.assign(
    c,
    require('../../css/common.css'),
    require('../../css/animate.css'),
);

import helpIcon from '../../lib/assets/icon--tutorials.svg';
import mystuffIcon from './icon--mystuff.png';
import profileIcon from './icon--profile.png';
import remixIcon from './icon--remix.svg';
import dropdownCaret from './dropdown-caret.svg';
import languageIcon from '../language-selector/language-icon.svg';
import aboutIcon from './icon--about.svg';

// import scratchLogo from './scratch-logo.svg';
import scratchLogo from '../../assets/logo.png';

import sharedMessages from '../../lib/shared-messages';

import folderIcon from '../../assets/icons/folder.svg';
import setupIcon from '../../assets/icons/set up.svg';
import resetIcon from '../../assets/icons/redo.svg';

import {ajax} from '../../lib/ajax.js';
import {param} from '../../lib/param.js';

const ariaMessages = defineMessages({
    language: {
        id: 'gui.menuBar.LanguageSelector',
        defaultMessage: 'language selector',
        description: 'accessibility text for the language selection menu'
    },
    tutorials: {
        id: 'gui.menuBar.tutorialsLibrary',
        defaultMessage: 'Tutorials',
        description: 'accessibility text for the tutorials button'
    }
});

const MenuBarItemTooltip = ({
    children,
    className,
    enable,
    id,
    place = 'bottom'
}) => {
    if (enable) {
        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
    return (
        <ComingSoonTooltip
            className={classNames(styles.comingSoon, className)}
            place={place}
            tooltipClassName={styles.comingSoonTooltip}
            tooltipId={id}
        >
            {children}
        </ComingSoonTooltip>
    );
};


MenuBarItemTooltip.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    enable: PropTypes.bool,
    id: PropTypes.string,
    place: PropTypes.oneOf(['top', 'bottom', 'left', 'right'])
};

const MenuItemTooltip = ({id, isRtl, children, className}) => (
    <ComingSoonTooltip
        className={classNames(styles.comingSoon, className)}
        isRtl={isRtl}
        place={isRtl ? 'left' : 'right'}
        tooltipClassName={styles.comingSoonTooltip}
        tooltipId={id}
    >
        {children}
    </ComingSoonTooltip>
);

MenuItemTooltip.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    id: PropTypes.string,
    isRtl: PropTypes.bool
};

const AboutButton = props => (
    <Button
        className={classNames(styles.menuBarItem, styles.hoverable)}
        iconClassName={styles.aboutIcon}
        iconSrc={aboutIcon}
        onClick={props.onClick}
    />
);

AboutButton.propTypes = {
    onClick: PropTypes.func.isRequired
};

class MenuBar extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleInput',
            'handleSave',
            'handleSaveAs',
            'handleExit',
            'handleTeacherPreview',
            'handleSkip',
            'handleSubmit',
            'handleClickResetFile',
            'handleClickNew',
            'handleClickRemix',
            'handleClickSave',
            'handleClickSaveAsCopy',
            'handleClickSeeCommunity',
            'handleClickShare',
            'handleKeyPress',
            'handleLanguageMouseUp',
            'handleRestoreOption',
            'getSaveToComputerHandler',
            'restoreOptionMessage'
        ]);
        this.audio = null;

        this.state = {
            id: param('id'),
            token: param('token'),
            workName: '',
            isShowSkipButton: false,
            file: param('file'),
            isShowResetFileButton: !!param('file'),
            mode: param('mode'),
            isShowPublishButton: !false,
            isShowPublishButtonBling: false,
            isTeacherPreview: false, // true: 老师切学生
            isSaveAsChanged: false,
            workUserBlockNum: 0,
            _timeout: param('_timeout') || 30, // dev
        };
        var state = this.state;

        // 30秒显示跳过按钮
        setTimeout(() => {
            this.setState({
                isShowSkipButton: true,
            });
        }, state._timeout * 1000);
        // TODO 提交保存另存为逻辑单独文件
        addEventListener('submit-result-dialog:跳过退出', async e => {
            await this.autoSave();

            window.bridge.emit('exitEditor', {type: 'skip'});
        });

        addEventListener('运行时判断正确', e => {
            this.setState({
                isShowPublishButtonBling: true,
            });
            this.audio = new Audio(require('../../assets/sounds/ti-jiao-an-niu.mp3')).play();
        });
        addEventListener('clickTips', e => {
            console.log('clickTips');
            Audio.audio.pause();
        });
        addEventListener('运行时判断不正确', e => {
            this.setState({
                isShowPublishButtonBling: false,
            });
        });
        // 30秒自动保存一次
        // TODO 太耗资源
        addEventListener('projectLoadSucceed', e => {
            var timer = setInterval(() => {
                console.log(`每${state._timeout}秒检查是否要自动保存`);
                console.log('projectChanged:', this.props.projectChanged);
                console.log('projectRunning:', this.props.projectRunning);

                if (!(/^(course)$/.test(state.mode) && state.id && state.token)) {
                    console.warn('state.mode:', state.mode);
                    console.warn('state.id:', state.id);
                    console.warn('state.token:', state.token);
                    clearInterval(timer);
                    return;
                }

                if (this.props.projectRunning) {
                    return;
                }

                this.autoSave(true);
            }, state._timeout * 1000);
        });

        window.bridge.on('requireExitEditor', e => {
            this.handleExit('requireExitEditor');
        });
    }
    componentDidMount () {
        document.addEventListener('keydown', this.handleKeyPress);
        this.props.vm.addListener('workspaceUpdate', () => {
            this.setState({
                workUserBlockNum: this.getUserBlocks()
            });

        });

    }
    componentWillUnmount () {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    handleClickNew () {
        // if the project is dirty, and user owns the project, we will autosave.
        // but if they are not logged in and can't save, user should consider
        // downloading or logging in first.
        // Note that if user is logged in and editing someone else's project,
        // they'll lose their work.
        const readyToReplaceProject = this.props.confirmReadyToReplaceProject(
            this.props.intl.formatMessage(sharedMessages.replaceProjectWarning)
        );
        this.props.onRequestCloseFile();
        if (readyToReplaceProject) {
            this.props.onClickNew(this.props.canSave && this.props.canCreateNew);
        }
        this.props.onRequestCloseFile();
    }
    handleTeacherPreview () {
        var isTeacherPreview = this.state.isTeacherPreview;
        this.setState({
            isTeacherPreview: !isTeacherPreview,
        });
        isTeacherPreview ? window.MODE = 'teacher' : window.MODE = undefined;
        dispatchEvent(new Event('updateWorkspace_'));
    }
    handleClickRemix () {
        this.props.onClickRemix();
        this.props.onRequestCloseFile();
    }
    handleClickSave () {
        this.props.onClickSave();
        this.props.onRequestCloseFile();
    }
    handleClickSaveAsCopy () {
        this.props.onClickSaveAsCopy();
        this.props.onRequestCloseFile();
    }
    handleClickSeeCommunity (waitForUpdate) {
        if (this.props.shouldSaveBeforeTransition()) {
            this.props.autoUpdateProject(); // save before transitioning to project page
            waitForUpdate(true); // queue the transition to project page
        } else {
            waitForUpdate(false); // immediately transition to project page
        }
    }
    handleClickShare (waitForUpdate) {
        if (!this.props.isShared) {
            if (this.props.canShare) { // save before transitioning to project page
                this.props.onShare();
            }
            if (this.props.canSave) { // save before transitioning to project page
                this.props.autoUpdateProject();
                waitForUpdate(true); // queue the transition to project page
            } else {
                waitForUpdate(false); // immediately transition to project page
            }
        }
    }
    handleRestoreOption (restoreFun) {
        return () => {
            restoreFun();
            this.props.onRequestCloseEdit();
        };
    }
    handleKeyPress (event) {
        const modifier = bowser.mac ? event.metaKey : event.ctrlKey;
        if (modifier && event.key === 's') {
            this.props.onClickSave();
            event.preventDefault();
        }
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
    handleLanguageMouseUp (e) {
        if (!this.props.languageMenuOpen) {
            this.props.onClickLanguage(e);
        }
    }
    restoreOptionMessage (deletedItem) {
        switch (deletedItem) {
        case 'Sprite':
            return (<FormattedMessage
                defaultMessage="Restore Sprite"
                description="Menu bar item for restoring the last deleted sprite."
                id="gui.menuBar.restoreSprite"
            />);
        case 'Sound':
            return (<FormattedMessage
                defaultMessage="Restore Sound"
                description="Menu bar item for restoring the last deleted sound."
                id="gui.menuBar.restoreSound"
            />);
        case 'Costume':
            return (<FormattedMessage
                defaultMessage="Restore Costume"
                description="Menu bar item for restoring the last deleted costume."
                id="gui.menuBar.restoreCostume"
            />);
        default: {
            return (<FormattedMessage
                defaultMessage="Restore"
                description="Menu bar item for restoring the last deleted item in its disabled state." /* eslint-disable-line max-len */
                id="gui.menuBar.restore"
            />);
        }
        }
    }
    buildAboutMenu (onClickAbout) {
        if (!onClickAbout) {
            // hide the button
            return null;
        }
        if (typeof onClickAbout === 'function') {
            // make a button which calls a function
            return <AboutButton onClick={onClickAbout} />;
        }
        // assume it's an array of objects
        // each item must have a 'title' FormattedMessage and a 'handleClick' function
        // generate a menu with items for each object in the array
        return (
            <div
                className={classNames(styles.menuBarItem, styles.hoverable, {
                    [styles.active]: this.props.aboutMenuOpen
                })}
                onMouseUp={this.props.onRequestOpenAbout}
            >
                <img
                    className={styles.aboutIcon}
                    src={aboutIcon}
                />
                <MenuBarMenu
                    className={classNames(styles.menuBarMenu)}
                    open={this.props.aboutMenuOpen}
                    place={this.props.isRtl ? 'right' : 'left'}
                    onRequestClose={this.props.onRequestCloseAbout}
                >
                    {
                        onClickAbout.map(itemProps => (
                            <MenuItem
                                key={itemProps.title}
                                isRtl={this.props.isRtl}
                                onClick={this.wrapAboutMenuCallback(itemProps.onClick)}
                            >
                                {itemProps.title}
                            </MenuItem>
                        ))
                    }
                </MenuBarMenu>
            </div>
        );
    }
    wrapAboutMenuCallback (callback) {
        return () => {
            callback();
            this.props.onRequestCloseAbout();
        };
    }
    // TODO remove
    getProjectCover (silence) {
        if (silence) return;

        return new Promise(rs => {
            this.props.vm.renderer.requestSnapshot(async dataURL => {
                var blob = await (await fetch(dataURL)).blob();
                const formData = new FormData();
                formData.append('file', blob, `${this.props.projectTitle || 'project'}.png`);
                const {data} = await ajax.post('/file/upload', formData, {silence});

                // return `${data.domain}${data.path}`;
                // return data.path;
                rs(data.path);
            });
        });
    }
    async handleClickResetFile () {
        const fileUrl = this.state.file;

        if (fileUrl) {
            const bufferPromise = new Promise(async r => {
                const blob = await ajax.get(fileUrl, {}, {responseType: 'blob', base: ''});
                const buffer = await blob.arrayBuffer();
                r(buffer);
            });

            await Dialog.confirm({
                title: '重做确认',
                content: '将会清空当前作品记录，重新开始创作哦，是否确定重做？'
            });

            this.props.vm.loadProject(await bufferPromise);
        }
    }
    handleHideCode () {
        dispatchEvent(new Event('menu:hideCode'));
    }
    handleSiderBtn () {
        window.bridge.emit('showCourseSidebar');
    }
    // 获取用户新增代码块
    getUserBlocks () {
        var curBlocksNum = 0;
        for (let i = 0; i < this.props.vm.runtime.targets.length; i++) {
            for (const j in this.props.vm.runtime.targets[i].blocks._blocks) {
                if (this.props.vm.runtime.targets[i].blocks._blocks[j].shadow === false) {
                    curBlocksNum++;
                }
            }
        }

        return curBlocksNum;
    }
    getCover () {
        return new Promise(rs => {
            this.props.vm.renderer.requestSnapshot(async dataURL => {

                var blob = await (await fetch(dataURL)).blob();

                rs(blob);
            });
        });
    }
    getWorkName () {
        return this.props.projectTitle || param('workName') || '我的作品';
    }
    async uploadToOss (blob, name = 'test', ext = 'sb3', silence) {
        var self = this;
        silence || self.props.setUploadingProgress(10);

        var {data} = await ajax.get('file/getSign', {
            driver: 'aly_oss',
            name,
            ext,
        });
        var ossToken = JSON.parse(data.ossToken);

        const formData = new FormData();
        formData.append('OSSAccessKeyId', ossToken.accessid);
        formData.append('signature', ossToken.signature);
        formData.append('policy', ossToken.policy);
        formData.append('key', data.path);
        formData.append('success_action_status', 200);
        formData.append('file', blob, `${name}.${ext}`);

        silence || self.props.setUploadingProgress(20);
        await ajax.post(`https://${data.bucket}.${data.region}.aliyuncs.com`, formData, {
            silence: true,
            onprogress (e) {
                if (silence) return;
                var value = e.loaded * 100 / e.total;
                value = 20 + (value * .6);
                value = parseInt(value, 10);
                self.props.setUploadingProgress(value);
            },
            onload (){}
        });
        // silence || self.props.setUploadingProgress(false);

        console.info('uploadToOss:', `https://${data.bucket}.${data.region}.aliyuncs.com/${data.path}`);
        return data;
    }
    async uploadSb3 (silence) {
        const blob = await this.props.vm.saveProjectSb3();
        // 得到差异化的文件，打包成sb3
        const diffBlob = await saveProjectDifferenceSb3(window.originSb3List);
        console.log('差异文件blob------', diffBlob);
        const workName = this.getWorkName();

        return this.uploadToOss(blob, workName, 'sb3', silence);
    }
    async uploadCover () {
        var cover = await this.getCover();
        const workName = this.getWorkName();

        return this.uploadToOss(cover, workName, 'png', true);
    }
    handleInput (e) {
        this.props.setProjectTitle(e.target.value);
    }
    handleClickSaveButton (silence) {
        dispatchEvent(new Event('clickSave'));
        return this.handleSave(silence);
    }
    async handleSave (silence) {
        const id = this.state.id;
        const workName = this.getWorkName();

        silence || this.props.setUploadingProgress(true);
        const uploadCoverPromise = this.uploadCover();
        const uploadSb3Promise = this.uploadSb3(silence);
        await uploadSb3Promise;

        silence || this.props.setUploadingProgress(95, '正在保存...');
        var {data} = await ajax.put('/hwUserWork/submitIdeaWork', {
            id: id,
            workName: workName,
            // workCoverPath: await this.getProjectCover(silence),
            // workPath: sb3PathInfo.path,
            attachId: (await uploadSb3Promise).id,
            workCoverAttachId: (await uploadCoverPromise).id,
        }, {silence});
        silence || this.props.setUploadingProgress(100, '正在保存...');
        dispatchEvent(new Event('saveEnd'));

        this.state.id = data;
        param('id', this.state.id);

        this.props.onProjectSaved({
            title: workName
        });

        setTimeout(() => {
            silence || this.props.setUploadingProgress(false);
        }, 500);
        alert('保存成功');
    }
    async handleSaveAs () {
        await Dialog.confirm('是否将作品另存为自由创作？');

        this.state.id = null;
        await this.handleSave();
        param('id', this.state.id);
        this.setState({
            isSaveAsChanged: true,
        });
    }
    async autoSave (silence) {
        if (!this.props.projectChanged) return;

        var mode = this.state.mode;
        var workInfo = window._workInfo || {};

        if (mode === 'course') {
            await this.handleSubmit('noCheckResult', silence);
            return;
        }

        if (mode === 'normal' && workInfo.id && !/IDEA/i.test(workInfo.workType)) {
            await this.handleSaveAs();
            return;
        }

        // id || !id&&
        if (mode === 'normal') {
            await this.handleSave(silence);
            return;
        }

    }
    async handleExit (e = 'exitEditor') {
        var exitType = 'exit';
        if (e === 'requireExitEditor') exitType = 'sidebar';

        if (this.props.projectChanged) {
            await Dialog.confirm({
                title: '还未保存作品哦，是否保存作品？',
                onCancel () {
                    window.bridge.emit(e, {type: exitType});
                }
            });

            await this.autoSave();
        }

        window.bridge.emit(e, {type: exitType});
    }
    handleClickSubmitButton (isNoCheckResult, silence) {
        dispatchEvent(new Event('clickSubmit'));
        return this.handleSubmit(isNoCheckResult, silence);
    }
    async handleSubmit (isNoCheckResult, silence) {
        const workInfo = window._workInfo || {};

        if (!workInfo.id) {
            await Dialog.alert({
                title: 'id参数为空！',
            });
            console.f12 = 2;
            console.log(location);
            return;
        }

        this.setState({
            isShowPublishButtonBling: false,
        });

        var lastUserBlockNum = 0;
        if (workInfo.userBlockNum) {
            lastUserBlockNum = workInfo.userBlockNum;
        }


        var _userBlockNum = this.getUserBlocks() - this.state.workUserBlockNum + lastUserBlockNum;

        if (_userBlockNum < 0) {
            _userBlockNum = 0;
        }

        // 上传文件
        silence || this.props.setUploadingProgress(true);
        const uploadCoverPromise = this.uploadCover();
        const uploadSb3Promise = this.uploadSb3(silence);

        await uploadSb3Promise;
        silence || this.props.setUploadingProgress(90, '正在保存...');

        // 提交
        const {data: workId} = await ajax.put('/hwUserWork/submitWork', {
            id: workInfo.id,
            workId: workInfo.analystStatus === -1 ? workInfo.workId : '',
            submitType: silence ? 1 : 2,
            userBlockNum: _userBlockNum,
            // workCoverPath: await this.getProjectCover(silence),
            // workPath: fileData.path,
            // analystStatus: undefined,
            attachId: (await uploadSb3Promise).id,
            workCoverAttachId: (await uploadCoverPromise).id,
        }, {silence});
        dispatchEvent(new Event('submitEnd'));

        // 标记已保存
        this.props.onProjectSaved({
            title: this.props.projectTitle || param('workName') || ''
        });

        if (isNoCheckResult) {
            return;
        }

        silence || this.props.setUploadingProgress(95, '正在批改中...');
        var isRight = await this.checkWork();
        silence || this.props.setUploadingProgress(100, '正在批改中...');
        dispatchEvent(new Event('checkWorkEnd'));

        // TODO 目前只有正确错误，之前有规划有人工批改
        if (isRight) {
            dispatchEvent(new Event('submit:已提交正确'));
        } else {
            dispatchEvent(new Event('submit:已提交错误'));
        }

        setTimeout(() => {
            silence || this.props.setUploadingProgress(false);
        }, 500);
    }
    async checkWork () {
        var json = this.props.vm.toJSON();

        var {data} = await ajax.post('hwUserWork/autoAnalyst', {
            workCode: window._workInfo.workCode,
            projectJsonStr: json,
        });

        return data === 1;
    }
    handleSkip () {
        dispatchEvent(new Event('submit:跳过'));
    }
    render () {
        var state = this.state;
        var {mode} = state;
        var workInfo = window._workInfo || {};
        var isSaveAs = workInfo.id && !/IDEA/i.test(workInfo.workType);
        if (state.isSaveAsChanged) {
            isSaveAs = false;
        }

        const saveNowMessage = (
            <FormattedMessage
                defaultMessage="Save now"
                description="Menu bar item for saving now"
                id="gui.menuBar.saveNow"
            />
        );
        const createCopyMessage = (
            <FormattedMessage
                defaultMessage="Save as a copy"
                description="Menu bar item for saving as a copy"
                id="gui.menuBar.saveAsCopy"
            />
        );
        const remixMessage = (
            <FormattedMessage
                defaultMessage="Remix"
                description="Menu bar item for remixing"
                id="gui.menuBar.remix"
            />
        );
        const newProjectMessage = (
            <FormattedMessage
                defaultMessage="New"
                description="Menu bar item for creating a new project"
                id="gui.menuBar.new"
            />
        );
        const remixButton = (
            <Button
                className={classNames(
                    styles.menuBarButton,
                    styles.remixButton
                )}
                iconClassName={styles.remixButtonIcon}
                iconSrc={remixIcon}
                onClick={this.handleClickRemix}
            >
                {remixMessage}
            </Button>
        );
        // Show the About button only if we have a handler for it (like in the desktop app)
        const aboutButton = this.buildAboutMenu(this.props.onClickAbout);
        return (
            <Box
                className={classNames(
                    this.props.className,
                    styles.menuBar
                )}
            >
                <div
                    hidden
                    className={styles.mainMenu}
                >
                    <div className={styles.fileGroup}>
                        {/* logo */}
                        <div className={classNames(styles.menuBarItem)}>
                            <img
                                alt="Scratch"
                                className={classNames(styles.scratchLogo, {
                                    [styles.clickable]: typeof this.props.onClickLogo !== 'undefined'
                                })}
                                draggable={false}
                                src={this.props.logo}
                                onClick={this.props.onClickLogo}
                            />
                        </div>
                        {/* lang */}
                        {(this.props.canChangeLanguage) && (<div
                            hidden
                            className={classNames(styles.menuBarItem, styles.hoverable, styles.languageMenu)}
                        >
                            <div>
                                <img
                                    className={styles.languageIcon}
                                    src={languageIcon}
                                />
                                <img
                                    hidden
                                    className={styles.languageCaret}
                                    src={dropdownCaret}
                                />
                            </div>
                            <LanguageSelector label={this.props.intl.formatMessage(ariaMessages.language)} />
                        </div>)}
                        {/* file */}
                        {(this.props.canManageFiles) && (
                            <div
                                className={classNames(styles.menuBarItem, styles.hoverable, {
                                    [styles.active]: this.props.fileMenuOpen
                                })}
                                onMouseUp={this.props.onClickFile}
                            >
                                {/* <FormattedMessage
                                    defaultMessage="File"
                                    description="Text for file dropdown menu"
                                    id="gui.menuBar.file"
                                /> */}
                                <img
                                    className={styles.icon}
                                    src={folderIcon}
                                    alt="file"
                                />
                                <MenuBarMenu
                                    className={classNames(styles.menuBarMenu)}
                                    open={this.props.fileMenuOpen}
                                    place={this.props.isRtl ? 'left' : 'right'}
                                    onRequestClose={this.props.onRequestCloseFile}
                                >
                                    <MenuSection>
                                        <MenuItem
                                            isRtl={this.props.isRtl}
                                            onClick={this.handleClickNew}
                                        >
                                            {newProjectMessage}
                                        </MenuItem>
                                    </MenuSection>
                                    {(this.props.canSave || this.props.canCreateCopy || this.props.canRemix) && (
                                        <MenuSection>
                                            {this.props.canSave && (
                                                <MenuItem onClick={this.handleClickSave}>
                                                    {saveNowMessage}
                                                </MenuItem>
                                            )}
                                            {this.props.canCreateCopy && (
                                                <MenuItem onClick={this.handleClickSaveAsCopy}>
                                                    {createCopyMessage}
                                                </MenuItem>
                                            )}
                                            {this.props.canRemix && (
                                                <MenuItem onClick={this.handleClickRemix}>
                                                    {remixMessage}
                                                </MenuItem>
                                            )}
                                        </MenuSection>
                                    )}
                                    <MenuSection>
                                        <MenuItem
                                            onClick={this.props.onStartSelectingFileUpload}
                                        >
                                            {this.props.intl.formatMessage(sharedMessages.loadFromComputerTitle)}
                                        </MenuItem>
                                        <SB3Downloader>{(className, downloadProjectCallback) => (
                                            <MenuItem
                                                className={className}
                                                onClick={this.getSaveToComputerHandler(downloadProjectCallback)}
                                            >
                                                <FormattedMessage
                                                    defaultMessage="Save to your computer"
                                                    description="Menu bar item for downloading a project to your computer" // eslint-disable-line max-len
                                                    id="gui.menuBar.downloadToComputer"
                                                />
                                            </MenuItem>
                                        )}</SB3Downloader>
                                    </MenuSection>
                                </MenuBarMenu>
                            </div>
                        )}
                        {/* edit */}
                        <div
                            className={classNames(styles.menuBarItem, styles.hoverable, {
                                [styles.active]: this.props.editMenuOpen
                            })}
                            onMouseUp={this.props.onClickEdit}
                        >
                            <div className={classNames(styles.editMenu)}>
                                {/* <FormattedMessage
                                    defaultMessage="Edit"
                                    description="Text for edit dropdown menu"
                                    id="gui.menuBar.edit"
                                /> */}

                                <img
                                    className={styles.icon}
                                    src={setupIcon}
                                    alt="setting"
                                />
                            </div>
                            <MenuBarMenu
                                className={classNames(styles.menuBarMenu)}
                                open={this.props.editMenuOpen}
                                place={this.props.isRtl ? 'left' : 'right'}
                                onRequestClose={this.props.onRequestCloseEdit}
                            >
                                <DeletionRestorer>{(handleRestore, {restorable, deletedItem}) => (
                                    <MenuItem
                                        className={classNames({[styles.disabled]: !restorable})}
                                        onClick={this.handleRestoreOption(handleRestore)}
                                    >
                                        {this.restoreOptionMessage(deletedItem)}
                                    </MenuItem>
                                )}</DeletionRestorer>
                                <MenuSection>
                                    <TurboMode>{(toggleTurboMode, {turboMode}) => (
                                        <MenuItem onClick={toggleTurboMode}>
                                            {turboMode ? (
                                                <FormattedMessage
                                                    defaultMessage="Turn off Turbo Mode"
                                                    description="Menu bar item for turning off turbo mode"
                                                    id="gui.menuBar.turboModeOff"
                                                />
                                            ) : (
                                                <FormattedMessage
                                                    defaultMessage="Turn on Turbo Mode"
                                                    description="Menu bar item for turning on turbo mode"
                                                    id="gui.menuBar.turboModeOn"
                                                />
                                            )}
                                        </MenuItem>
                                    )}</TurboMode>
                                </MenuSection>
                            </MenuBarMenu>
                        </div>
                        {/* redo */}
                        <button
                            hidden={!(this.state.isShowResetFileButton)}
                            type="button"
                            className={`${c.menuBarItem}`}
                            onClick={this.handleClickResetFile}
                        >
                            <img
                                className={styles.icon}
                                src={resetIcon}
                                alt="reset"
                            />
                        </button>

                    </div>

                    {/* <Divider className={classNames(styles.divider)} /> */}

                    <div
                        hidden
                        aria-label={this.props.intl.formatMessage(ariaMessages.tutorials)}
                        className={classNames(styles.menuBarItem, styles.hoverable)}
                        onClick={this.props.onOpenTipLibrary}
                    >
                        <img
                            className={styles.helpIcon}
                            src={helpIcon}
                        />
                        <FormattedMessage {...ariaMessages.tutorials} />
                    </div>

                    {/* <Divider className={classNames(styles.divider)} /> */}

                    {this.props.canEditTitle ? (
                        <div
                            hidden
                            className={classNames(styles.menuBarItem, styles.growable)}
                        >
                            <MenuBarItemTooltip
                                enable
                                id="title-field"
                            >
                                <ProjectTitleInput
                                    className={classNames(styles.titleFieldGrowable)}
                                    projectTitle="fuck"
                                />
                            </MenuBarItemTooltip>
                        </div>
                    ) : ((this.props.authorUsername && this.props.authorUsername !== this.props.username) ? (
                        <AuthorInfo
                            className={styles.authorInfo}
                            imageUrl={this.props.authorThumbnailUrl}
                            projectTitle={this.props.projectTitle}
                            userId={this.props.authorId}
                            username={this.props.authorUsername}
                        />
                    ) : null)}
                    <div
                        hidden
                        className={classNames(styles.menuBarItem)}
                    >
                        {this.props.canShare ? (
                            (this.props.isShowingProject || this.props.isUpdating) && (
                                <ProjectWatcher onDoneUpdating={this.props.onSeeCommunity}>
                                    {
                                        waitForUpdate => (
                                            <ShareButton
                                                className={styles.menuBarButton}
                                                isShared={this.props.isShared}
                                                /* eslint-disable react/jsx-no-bind */
                                                onClick={() => {
                                                    this.handleClickShare(waitForUpdate);
                                                }}
                                            /* eslint-enable react/jsx-no-bind */
                                            />
                                        )
                                    }
                                </ProjectWatcher>
                            )
                        ) : (
                            this.props.showComingSoon ? (
                                <MenuBarItemTooltip id="share-button">
                                    <ShareButton className={styles.menuBarButton} />
                                </MenuBarItemTooltip>
                            ) : []
                        )}
                        {this.props.canRemix ? remixButton : []}
                    </div>
                    <div
                        hidden
                        className={classNames(styles.menuBarItem, styles.communityButtonWrapper)}
                    >
                        {this.props.enableCommunity ? (
                            (this.props.isShowingProject || this.props.isUpdating) && (
                                <ProjectWatcher onDoneUpdating={this.props.onSeeCommunity}>
                                    {
                                        waitForUpdate => (
                                            <CommunityButton
                                                className={styles.menuBarButton}
                                                /* eslint-disable react/jsx-no-bind */
                                                onClick={() => {
                                                    this.handleClickSeeCommunity(waitForUpdate);
                                                }}
                                            /* eslint-enable react/jsx-no-bind */
                                            />
                                        )
                                    }
                                </ProjectWatcher>
                            )
                        ) : (this.props.showComingSoon ? (
                            <MenuBarItemTooltip id="community-button">
                                <CommunityButton className={styles.menuBarButton} />
                            </MenuBarItemTooltip>
                        ) : [])}
                    </div>
                </div>

                {/* show the proper UI in the account menu, given whether the user is
                logged in, and whether a session is available to log in with */}
                <div
                    hidden
                    className={styles.accountInfoGroup}
                >
                    <div className={styles.menuBarItem}>
                        {this.props.canSave && (
                            <SaveStatus />
                        )}
                    </div>
                    {this.props.sessionExists ? (
                        this.props.username ? (
                            // ************ user is logged in ************
                            <React.Fragment>
                                <a href="/mystuff/">
                                    <div
                                        className={classNames(
                                            styles.menuBarItem,
                                            styles.hoverable,
                                            styles.mystuffButton
                                        )}
                                    >
                                        <img
                                            className={styles.mystuffIcon}
                                            src={mystuffIcon}
                                        />
                                    </div>
                                </a>
                                <AccountNav
                                    className={classNames(
                                        styles.menuBarItem,
                                        styles.hoverable,
                                        {[styles.active]: this.props.accountMenuOpen}
                                    )}
                                    isOpen={this.props.accountMenuOpen}
                                    isRtl={this.props.isRtl}
                                    menuBarMenuClassName={classNames(styles.menuBarMenu)}
                                    onClick={this.props.onClickAccount}
                                    onClose={this.props.onRequestCloseAccount}
                                    onLogOut={this.props.onLogOut}
                                />
                            </React.Fragment>
                        ) : (
                            // ********* user not logged in, but a session exists
                            // ********* so they can choose to log in
                            <React.Fragment>
                                <div
                                    className={classNames(
                                        styles.menuBarItem,
                                        styles.hoverable
                                    )}
                                    key="join"
                                    onMouseUp={this.props.onOpenRegistration}
                                >
                                    <FormattedMessage
                                        defaultMessage="Join Scratch"
                                        description="Link for creating a Scratch account"
                                        id="gui.menuBar.joinScratch"
                                    />
                                </div>
                                <div
                                    className={classNames(
                                        styles.menuBarItem,
                                        styles.hoverable
                                    )}
                                    key="login"
                                    onMouseUp={this.props.onClickLogin}
                                >
                                    <FormattedMessage
                                        defaultMessage="Sign in"
                                        description="Link for signing in to your Scratch account"
                                        id="gui.menuBar.signIn"
                                    />
                                    <LoginDropdown
                                        className={classNames(styles.menuBarMenu)}
                                        isOpen={this.props.loginMenuOpen}
                                        isRtl={this.props.isRtl}
                                        renderLogin={this.props.renderLogin}
                                        onClose={this.props.onRequestCloseLogin}
                                    />
                                </div>
                            </React.Fragment>
                        )
                    ) : (
                        // ******** no login session is available, so don't show login stuff
                        <React.Fragment>
                            {this.props.showComingSoon ? (
                                <React.Fragment>
                                    <MenuBarItemTooltip id="mystuff">
                                        <div
                                            hidden
                                            className={classNames(
                                                styles.menuBarItem,
                                                styles.hoverable,
                                                styles.mystuffButton
                                            )}
                                        >
                                            <img
                                                className={styles.mystuffIcon}
                                                src={mystuffIcon}
                                            />
                                        </div>
                                    </MenuBarItemTooltip>
                                    <MenuBarItemTooltip
                                        id="account-nav"
                                        place={this.props.isRtl ? 'right' : 'left'}
                                    >
                                        <div
                                            hidden
                                            className={classNames(
                                                styles.menuBarItem,
                                                styles.hoverable,
                                                styles.accountNavMenu
                                            )}
                                        >
                                            <img
                                                className={styles.profileIcon}
                                                src={profileIcon}
                                            />
                                            <span>
                                                {'scratch-cat'}
                                            </span>
                                            <img
                                                className={styles.dropdownCaretIcon}
                                                src={dropdownCaret}
                                            />
                                        </div>
                                    </MenuBarItemTooltip>
                                </React.Fragment>
                            ) : []}
                        </React.Fragment>
                    )}
                </div>

                {aboutButton}
                <div
                    className={classNames(styles.buttons)}
                >
                    {
                        mode === 'normal' ? (
                            <>
                                <div
                                    hidden
                                    className={`${c.withIconRight}`}
                                >
                                    <input
                                        type="text"
                                        className={`${c.input}`}
                                        placeholder="作品名称"
                                        maxLength={20}
                                        defaultValue={this.props.projectTitle}
                                        onInput={this.handleInput}
                                    />
                                    <i className={c.iEdit} />
                                </div>

                                {/* TODO 没有 token 不能保存和提交 */}

                                <button
                                    className={`${c.button}`}
                                    onClick={e => this.handleExit()}
                                >
                                    {'退出'}
                                </button>

                                <button
                                    hidden={!(isSaveAs)}
                                    className={`${c.button} ${c.yellow}`}
                                    onClick={e => this.handleSaveAs()}
                                >
                                    {'另存为'}
                                </button>

                                <button
                                    hidden={!(!isSaveAs)}
                                    className={`${c.button} ${c.pink}`}
                                    onClick={e => this.handleClickSaveButton()}
                                >
                                    <i className={`${c.iSave} ${c.iSizeL}`}></i>
                                    {'保存'}
                                </button>
                            </>
                        ) : null
                    }
                    {
                        mode === 'course' ? (
                            <>
                                <button
                                    hidden={!state.isShowSkipButton}
                                    className={`${c.button} ${c.blue}`}
                                    onClick={this.handleSkip}
                                >{'跳过'}</button>

                                <button
                                    className={classNames(c.button, c.pink, {
                                        [c.blingBling]: this.state.isShowPublishButtonBling,
                                    })}
                                    onClick={e => this.handleClickSubmitButton()}
                                >
                                    <i className={`${c.iCheck} ${c.iSizeL}`} />
                                    {'提交'}
                                </button>

                                <button
                                    hidden
                                    className={styles.siderButton}
                                    onClick={this.handleSiderBtn}
                                >
                                </button>
                            </>
                        ) : null
                    }
                    {
                        mode === 'teacher' ? (
                            <>
                                <button
                                    hidden
                                    className={`${c.button} ${c.pink}`}
                                    onClick={this.handleTeacherPreview}
                                >
                                    {this.state.isTeacherPreview ? '返回老师模式' : '切换学生模式'}
                                </button>

                                <button
                                    hidden
                                    className={c.button}
                                    onClick={this.handleHideCode}
                                >{'隐藏盒子'}</button>
                            </>
                        ) : null
                    }
                </div>

            </Box>
        );
    }
}

MenuBar.propTypes = {
    aboutMenuOpen: PropTypes.bool,
    accountMenuOpen: PropTypes.bool,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    authorThumbnailUrl: PropTypes.string,
    authorUsername: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    autoUpdateProject: PropTypes.func,
    canChangeLanguage: PropTypes.bool,
    canCreateCopy: PropTypes.bool,
    canCreateNew: PropTypes.bool,
    canEditTitle: PropTypes.bool,
    canManageFiles: PropTypes.bool,
    canRemix: PropTypes.bool,
    canSave: PropTypes.bool,
    canShare: PropTypes.bool,
    className: PropTypes.string,
    confirmReadyToReplaceProject: PropTypes.func,
    editMenuOpen: PropTypes.bool,
    enableCommunity: PropTypes.bool,
    fileMenuOpen: PropTypes.bool,
    intl: intlShape,
    isRtl: PropTypes.bool,
    isShared: PropTypes.bool,
    isShowingProject: PropTypes.bool,
    isUpdating: PropTypes.bool,
    languageMenuOpen: PropTypes.bool,
    locale: PropTypes.string.isRequired,
    loginMenuOpen: PropTypes.bool,
    logo: PropTypes.string,
    onClickAbout: PropTypes.oneOfType([
        PropTypes.func, // button mode: call this callback when the About button is clicked
        PropTypes.arrayOf( // menu mode: list of items in the About menu
            PropTypes.shape({
                title: PropTypes.string, // text for the menu item
                onClick: PropTypes.func // call this callback when the menu item is clicked
            })
        )
    ]),
    onClickAccount: PropTypes.func,
    onClickEdit: PropTypes.func,
    onClickFile: PropTypes.func,
    onClickLanguage: PropTypes.func,
    onClickLogin: PropTypes.func,
    onClickLogo: PropTypes.func,
    onClickNew: PropTypes.func,
    onClickRemix: PropTypes.func,
    onClickSave: PropTypes.func,
    onClickSaveAsCopy: PropTypes.func,
    onLogOut: PropTypes.func,
    onOpenRegistration: PropTypes.func,
    onOpenTipLibrary: PropTypes.func,
    onProjectTelemetryEvent: PropTypes.func,
    onRequestOpenAbout: PropTypes.func,
    onRequestCloseAbout: PropTypes.func,
    onRequestCloseAccount: PropTypes.func,
    onRequestCloseEdit: PropTypes.func,
    onRequestCloseFile: PropTypes.func,
    onRequestCloseLanguage: PropTypes.func,
    onRequestCloseLogin: PropTypes.func,
    onSeeCommunity: PropTypes.func,
    onShare: PropTypes.func,
    onStartSelectingFileUpload: PropTypes.func,
    onToggleLoginOpen: PropTypes.func,
    projectTitle: PropTypes.string,
    renderLogin: PropTypes.func,
    sessionExists: PropTypes.bool,
    shouldSaveBeforeTransition: PropTypes.func,
    showComingSoon: PropTypes.bool,
    userOwnsProject: PropTypes.bool,
    username: PropTypes.string,
    vm: PropTypes.instanceOf(VM).isRequired,
    projectChanged: PropTypes.bool,
    onProjectSaved: PropTypes.func,
    setProjectTitle: PropTypes.func,
    projectRunning: PropTypes.bool,
    setUploadingProgress: PropTypes.func,
};

MenuBar.defaultProps = {
    logo: scratchLogo,
    onShare: () => { }
};

const mapStateToProps = (state, ownProps) => {
    const loadingState = state.scratchGui.projectState.loadingState;
    const user = state.session && state.session.session && state.session.session.user;
    return {
        aboutMenuOpen: aboutMenuOpen(state),
        accountMenuOpen: accountMenuOpen(state),
        fileMenuOpen: fileMenuOpen(state),
        editMenuOpen: editMenuOpen(state),
        isRtl: state.locales.isRtl,
        isUpdating: getIsUpdating(loadingState),
        isShowingProject: getIsShowingProject(loadingState),
        languageMenuOpen: languageMenuOpen(state),
        locale: state.locales.locale,
        loginMenuOpen: loginMenuOpen(state),
        projectTitle: state.scratchGui.projectTitle,
        sessionExists: state.session && typeof state.session.session !== 'undefined',
        username: user ? user.username : null,
        userOwnsProject: ownProps.authorUsername && user &&
            (ownProps.authorUsername === user.username),
        vm: state.scratchGui.vm,
        projectRunning: state.scratchGui.vmStatus.running,
    };
};

const mapDispatchToProps = dispatch => ({
    autoUpdateProject: () => dispatch(autoUpdateProject()),
    onOpenTipLibrary: () => dispatch(openTipsLibrary()),
    onClickAccount: () => dispatch(openAccountMenu()),
    onRequestCloseAccount: () => dispatch(closeAccountMenu()),
    onClickFile: () => dispatch(openFileMenu()),
    onRequestCloseFile: () => dispatch(closeFileMenu()),
    onClickEdit: () => dispatch(openEditMenu()),
    onRequestCloseEdit: () => dispatch(closeEditMenu()),
    onClickLanguage: () => dispatch(openLanguageMenu()),
    onRequestCloseLanguage: () => dispatch(closeLanguageMenu()),
    onClickLogin: () => dispatch(openLoginMenu()),
    onRequestCloseLogin: () => dispatch(closeLoginMenu()),
    onRequestOpenAbout: () => dispatch(openAboutMenu()),
    onRequestCloseAbout: () => dispatch(closeAboutMenu()),
    onClickNew: needSave => dispatch(requestNewProject(needSave)),
    onClickRemix: () => dispatch(remixProject()),
    onClickSave: () => dispatch(manualUpdateProject()),
    onClickSaveAsCopy: () => dispatch(saveProjectAsCopy()),
    onSeeCommunity: () => dispatch(setPlayer(true)),
    setProjectTitle: title => dispatch(setProjectTitle(title)),
    setUploadingProgress: (progress, text) => dispatch(setUploadingProgress(progress, text)),
});

export default compose(
    injectIntl,
    MenuBarHOC,
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(MenuBar);
