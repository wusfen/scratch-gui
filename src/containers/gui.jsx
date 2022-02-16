/* eslint-disable no-invalid-this */
import PropTypes from 'prop-types';
import React from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import ReactModal from 'react-modal';
import VM from 'scratch-vm';
import {injectIntl, intlShape} from 'react-intl';

import ErrorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import {
    getIsError,
    getIsShowingProject
} from '../reducers/project-state';
import {
    activateTab,
    BLOCKS_TAB_INDEX,
    COSTUMES_TAB_INDEX,
    SOUNDS_TAB_INDEX
} from '../reducers/editor-tab';

import {
    closeCostumeLibrary,
    closeBackdropLibrary,
    closeTelemetryModal,
    openExtensionLibrary
} from '../reducers/modals';

import FontLoaderHOC from '../lib/font-loader-hoc.jsx';
import LocalizationHOC from '../lib/localization-hoc.jsx';
import SBFileUploaderHOC from '../lib/sb-file-uploader-hoc.jsx';
import ProjectFetcherHOC from '../lib/project-fetcher-hoc.jsx';
import TitledHOC from '../lib/titled-hoc.jsx';
import ProjectSaverHOC from '../lib/project-saver-hoc.jsx';
import QueryParserHOC from '../lib/query-parser-hoc.jsx';
import storage from '../lib/storage';
import vmListenerHOC from '../lib/vm-listener-hoc.jsx';
import vmManagerHOC from '../lib/vm-manager-hoc.jsx';
import cloudManagerHOC from '../lib/cloud-manager-hoc.jsx';

import GUIComponent from '../components/gui/gui.jsx';
import {setIsScratchDesktop} from '../lib/isScratchDesktop.js';
import getTipParam from '../lib/courseTip/getTipParam';
import Timer from '../components/timer/index';
import {timerType} from '../components/timer/data';
import Counter from '../components/counter/index';
import {counterType} from '../components/counter/data';

import {param} from '../lib/param.js';
import {addStageCSSWidth} from '../reducers/stage-size';
import {IS_NATIVE_PLAY_VIDEO} from '@/lib/const';

class GUI extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            videoSrc: '',
            promptAreaShow: false,
            promptTitle: '提示',
            errorText: '',
            showErrorTips: false
        };
    }

    componentDidMount () {
        window.gui = this;
        setIsScratchDesktop(this.props.isScratchDesktop);
        this.props.onStorageInit(storage);
        this.props.onVmInit(this.props.vm);
        var mode = param('mode');

        this.initTimer(); // 初始化计时器
        this.initCounter(); // 初始化计数器

        if (/^(course|normal)$/.test(mode)) {
            this.handleVideoSrc(); // 获取引导video
        }
        window.addEventListener('openErrorTips', this.initErrorTipsListener); // 初始化错误提示的监听
        window.addEventListener('运行时判断不正确', this.tipsStartError); // 当学生点击开始的时候，会提交json进行判断（已有功能），如果收到的结果是错误的，则出现错误提示效果
        this.editorWrapperDom = document.querySelector('[class*="editor-wrapper"]');
        this.editorWrapperDom?.addEventListener('mousemove', this.handleMove.bind(this));
        this.editorWrapperDom?.addEventListener('touchmove', this.handleMove.bind(this));
        document.body.addEventListener('click', this.handleBtnClick.bind(this));
    }

    componentDidUpdate (prevProps) {
        if (this.props.projectId !== prevProps.projectId && this.props.projectId !== null) {
            this.props.onUpdateProjectId(this.props.projectId);
        }
        if (this.props.isShowingProject && !prevProps.isShowingProject) {
            // this only notifies container when a project changes from not yet loaded to loaded
            // At this time the project view in www doesn't need to know when a project is unloaded
            this.props.onProjectLoaded();
        }
    }

    componentWillUnmount () {
        window.operateTimer?.removeListener();
        window.codeTimer?.removeListener();
        window.rightAnswerTimer?.removeListener();
        window.jsonErrorCounter?.removeListener();
        window.submitErrorCounter?.removeListener();
        window.removeEventListener('openErrorTips', this.initErrorTipsListener);
        window.removeEventListener('运行时判断不正确', this.tipsStartError);
        this.editorWrapperDom?.removeEventListener('mousemove', this.handleMove.bind(this));
        this.editorWrapperDom?.removeEventListener('touchmove', this.handleMove.bind(this));

    }

    judgeTouchOrMoveReturnEvent = event => { // 兼容touch和move事件target的获取
        let touchObj;
        if (event.touches) {
            touchObj = event.touches[0];
        } else {
            touchObj = event;
        }
        return touchObj;
    }

    judgeIsNeedPlayAudio (dom) {
        let count = 4; // 性能考虑，一般向上寻找4级父节点就可以
        if (!dom) {
            return;
        }
        while (dom && count > 0) {
            if (dom.nodeName === 'BUTTON' ||
            (dom.className && (typeof dom.className === 'string' && dom.className?.indexOf('play_audio') !== -1))) {
                window.btnPlayAudioIng = true;
                this.btnPlayAudioIngTimer = setTimeout(() => {
                    window.btnPlayAudioIng = false;
                }, 1000);
                // playTipAudio(soundBtnClickMp3); 暂时隐藏掉按钮音效
                return;
            }
            dom = dom.parentNode;
            count--;
        }

    }

    handleBtnClick (event) { // 给所有的按钮、和需要有音效的dom，设置点击音效
        this.judgeIsNeedPlayAudio(event.target);
    }

    handleMove (event) {
        const e = this.judgeTouchOrMoveReturnEvent(event);
        window.dragBlockClientX = e.clientX;
        window.dragBlockClientY = e.clientY;
    }

    tipsStartError = () => {
        window.editorErrorTipText = '代码还有些问题哦，再修改一下吧';
        this.initErrorTipsListener();
    }

    initErrorTipsListener = () => {
        this.setState({
            errorText: window.editorErrorTipText || '',
            showErrorTips: true
        });
        this.timer = setTimeout(() => {
            this.setState({
                showErrorTips: false
            });
            clearTimeout(this.timer);
        }, 3000);
    }

    initTimer = () => {
        if (param('mode') === 'course') {
            window.operateTimer = new Timer(timerType.OPERATE); // 操作计时器
            window.codeTimer = new Timer(timerType.CODE); // 代码计时器
            window.rightAnswerTimer = new Timer(timerType.RIGHT_ANSWER); // 正确答案计时器
        }
        if (param('mode') === 'normal') {
            window.codeTimer = new Timer(timerType.CODE); // 代码计时器
        }
    }

    initCounter = () => {
        window.jsonErrorCounter = new Counter(counterType.JSON_ERROR);
        window.submitErrorCounter = new Counter(counterType.SUBMIT_ERROR);
    }

    handleVideoSrc = () => {
        const isExplain = getTipParam('tipVideo')?.includes('_explain');
        let videoSrc;
        if (isExplain) { // 讲解视频就取第一个讲解视频作为入口
            let tipVideos = getTipParam('tipVideo') || [];
            if (typeof tipVideos === 'string') {
                tipVideos = tipVideos.split('|');
            }
            videoSrc = tipVideos[0];
            this.setState({
                promptTitle: '讲解'
            });
        } else {
            videoSrc = getTipParam('introVideo');
            if (videoSrc?.includes('_task')) {
                this.setState({
                    promptTitle: '介绍'
                });
            }
        }
        console.log('videoSrc', videoSrc);
        if (videoSrc){ // 有初始引导
            this.addEventListener('loaderUnmount', () => { // 等待工程加载完毕
                if (!IS_NATIVE_PLAY_VIDEO) {
                    this.setState({promptAreaShow: true});
                }
            });
        } else {
            videoSrc = '';
            this.addEventListener('projectLoadSucceedLoaderUnmount', () => { // 等待工程加载完毕
                console.log('noVideoGuide');
                window.dispatchEvent(new Event('noVideoGuide'));
            });
        }
        this.setState({videoSrc: videoSrc});
    }

    closePromptArea = () => {
        this.setState({promptAreaShow: false});
        console.log('closeVideoGuide');
        window.dispatchEvent(new Event('closeVideoGuide'));
    }

    render () {
        if (this.props.isError) {
            throw new Error(
                `Error in Scratch GUI [location=${window.location}]: ${this.props.error}`);
        }
        const {
            /* eslint-disable no-unused-vars */
            assetHost,
            cloudHost,
            error,
            isError,
            isScratchDesktop,
            isShowingProject,
            onProjectLoaded,
            onStorageInit,
            onUpdateProjectId,
            onVmInit,
            projectHost,
            projectId,
            /* eslint-enable no-unused-vars */
            children,
            fetchingProject,
            isLoading,
            loadingStateVisible,
            ...componentProps
        } = this.props;
        const {videoSrc, promptAreaShow, promptTitle, errorText, showErrorTips} = this.state;
        return (
            <GUIComponent
                loading={fetchingProject || isLoading || loadingStateVisible}
                {...componentProps}
                videoSrc={videoSrc}
                promptAreaShow={promptAreaShow}
                promptTitle={promptTitle}
                closePromptArea={this.closePromptArea}
                errorText={errorText}
                showErrorTips={showErrorTips}
            >
                {children}
            </GUIComponent>
        );
    }
}

GUI.propTypes = {
    assetHost: PropTypes.string,
    children: PropTypes.node,
    cloudHost: PropTypes.string,
    error: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    fetchingProject: PropTypes.bool,
    intl: intlShape,
    isError: PropTypes.bool,
    isLoading: PropTypes.bool,
    isScratchDesktop: PropTypes.bool,
    isShowingProject: PropTypes.bool,
    loadingStateVisible: PropTypes.bool,
    onProjectLoaded: PropTypes.func,
    onSeeCommunity: PropTypes.func,
    onStorageInit: PropTypes.func,
    onUpdateProjectId: PropTypes.func,
    onVmInit: PropTypes.func,
    projectHost: PropTypes.string,
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    telemetryModalVisible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired
};

GUI.defaultProps = {
    isScratchDesktop: false,
    onStorageInit: storageInstance => storageInstance.addOfficialScratchWebStores(),
    onProjectLoaded: () => {},
    onUpdateProjectId: () => {},
    onVmInit: (/* vm */) => {}
};

const mapStateToProps = state => {
    const loadingState = state.scratchGui.projectState.loadingState;
    return {
        activeTabIndex: state.scratchGui.editorTab.activeTabIndex,
        alertsVisible: state.scratchGui.alerts.visible,
        backdropLibraryVisible: state.scratchGui.modals.backdropLibrary,
        blocksTabVisible: state.scratchGui.editorTab.activeTabIndex === BLOCKS_TAB_INDEX,
        cardsVisible: state.scratchGui.cards.visible,
        connectionModalVisible: state.scratchGui.modals.connectionModal,
        costumeLibraryVisible: state.scratchGui.modals.costumeLibrary,
        costumesTabVisible: state.scratchGui.editorTab.activeTabIndex === COSTUMES_TAB_INDEX,
        error: state.scratchGui.projectState.error,
        isError: getIsError(loadingState),
        isFullScreen: state.scratchGui.mode.isFullScreen,
        isPlayerOnly: state.scratchGui.mode.isPlayerOnly,
        isStageHidden: state.scratchGui.mode.isStageHidden,
        isRtl: state.locales.isRtl,
        isShowingProject: getIsShowingProject(loadingState),
        loadingStateVisible: state.scratchGui.modals.loadingProject,
        projectId: state.scratchGui.projectState.projectId,
        soundsTabVisible: state.scratchGui.editorTab.activeTabIndex === SOUNDS_TAB_INDEX,
        targetIsStage: (
            state.scratchGui.targets.stage &&
            state.scratchGui.targets.stage.id === state.scratchGui.targets.editingTarget
        ),
        telemetryModalVisible: state.scratchGui.modals.telemetryModal,
        tipsLibraryVisible: state.scratchGui.modals.tipsLibrary,
        vm: state.scratchGui.vm
    };
};

const mapDispatchToProps = dispatch => ({
    onExtensionButtonClick: () => dispatch(openExtensionLibrary()),
    onActivateTab: tab => dispatch(activateTab(tab)),
    onActivateCostumesTab: () => dispatch(activateTab(COSTUMES_TAB_INDEX)),
    onActivateSoundsTab: () => dispatch(activateTab(SOUNDS_TAB_INDEX)),
    onRequestCloseBackdropLibrary: () => dispatch(closeBackdropLibrary()),
    onRequestCloseCostumeLibrary: () => dispatch(closeCostumeLibrary()),
    onRequestCloseTelemetryModal: () => dispatch(closeTelemetryModal()),
    onResizeStage: offsetX => dispatch(addStageCSSWidth(offsetX))
});

const ConnectedGUI = injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps,
)(GUI));

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedGui = compose(
    LocalizationHOC,
    ErrorBoundaryHOC('Top Level App'),
    FontLoaderHOC,
    QueryParserHOC,
    ProjectFetcherHOC,
    TitledHOC,
    ProjectSaverHOC,
    vmListenerHOC,
    vmManagerHOC,
    SBFileUploaderHOC,
    cloudManagerHOC
)(ConnectedGUI);

WrappedGui.setAppElement = ReactModal.setAppElement;
export default WrappedGui;
