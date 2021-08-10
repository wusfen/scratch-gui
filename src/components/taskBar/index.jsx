/* eslint-disable no-invalid-this */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import {setProjectTitle} from '../../reducers/project-title';
import styles from './styles.css';
import {getParam} from '../../lib/param';
import folder from '../../assets/icons/folder.svg';
import hide from '../../assets/icons/hide.svg';
import blowUp from '../../assets/icons/blow-up.svg';
import fileUp from '../../assets/icons/fileUp.svg';
import SB3Downloader from '../../containers/sb3-downloader.jsx';
import collectMetadata from '../../lib/collect-metadata';
import VM from 'scratch-vm';
import {
    closeFileMenu
} from '../../reducers/menus';
const c = styles;
Object.assign(c, require('../../css/animate.css'));

class TaskBar extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            mode: getParam('mode') || '',
            isTeacherPreview: false, // true: 老师切学生
            moreFuncShow: false
        };
        bindAll(this, [
        ]);
    }

    componentDidMount () {
        this.moreFuncBtnRef?.addEventListener('touchstart', this.handleTouchStart);
        document.addEventListener('touchstart', this.handleTouchOutside);
    }

    componentWillUnmount () {
        this.moreFuncBtnRef?.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchstart', this.handleTouchOutside);
    }

    handleTouchStart = e => {
        if (!this.state.moreFuncShow) {
            e.preventDefault();
            this.showMoreFunc();
        }
    }

    handleTouchOutside = e => {
        if (this.state.moreFuncShow && !this.containerRef.contains(e.target)) {
            this.setState({
                moreFuncShow: false
            });
        }
    }

    handleHideCode = () => {
        window.dispatchEvent(new Event('menu:hideCode'));
    }

    handleTeacherPreview = () => {
        var isTeacherPreview = this.state.isTeacherPreview;
        this.setState({
            isTeacherPreview: !isTeacherPreview,
        });
        isTeacherPreview ? window.MODE = 'teacher' : window.MODE = undefined;
        dispatchEvent(new Event('updateWorkspace_'));
    }

    handleInput = e => {
        this.props.setProjectTitle(e.target.value);
    }

    getSaveToComputerHandler = downloadProjectCallback => () => {
        dispatchEvent(new Event('saveToComputer'));
        this.props.onRequestCloseFile();
        downloadProjectCallback();
        if (this.props.onProjectTelemetryEvent) {
            const metadata = collectMetadata(this.props.vm, this.props.projectTitle, this.props.locale);
            this.props.onProjectTelemetryEvent('projectDidSave', metadata);
        }
    };

    showMoreFunc = () => {
        if (this.closeTimeoutId) {
            clearTimeout(this.closeTimeoutId);
        } else {
            this.setState({
                moreFuncShow: true
            });
        }
    }

    hideMoreFunc = () => {
        this.closeTimeoutId = setTimeout(() => {
            this.setState({
                moreFuncShow: false
            });
            this.closeTimeoutId = null;
            clearTimeout(this.closeTimeoutId);
        }, 200);
    }


    render () {
        const {
            onStartSelectingFileUpload,
            ...props
        } = this.props;

        const {
            mode,
            isTeacherPreview,
            moreFuncShow,
            ...state
        } = this.state;

        return (
            <div
                className={classNames({
                    [styles.container]: true})}
            >
                {mode === 'normal' && <div className={c.productionName}>
                    <div>作品名：</div>
                    <input
                        type="text"
                        className={`${c.input}`}
                        placeholder="作品名称"
                        maxLength={20}
                        value={this.props.projectTitle}
                        onInput={this.handleInput}
                    />
                </div>}
                {mode === 'teacher' && <div className={c.teacherMode}>
                    <div
                        className={c.moreFuncContainer}
                        ref={r => {
                            this.containerRef = r;
                        }}
                        onMouseLeave={this.hideMoreFunc}
                        onMouseEnter={this.showMoreFunc}
                    >
                        <div
                            className={classNames({
                                [c.teacherModeItem]: true
                            })}
                            ref={r => {
                                this.moreFuncBtnRef = r;
                            }}
                        >
                            <img
                                src={folder}
                                alt="folder"
                            />
                            <span>保存与加载</span>
                        </div>
                        {moreFuncShow && <div
                            className={classNames(c.moreContent)}
                        >
                            <div className={classNames(c.item)}>
                                <button
                                    hidden={false}
                                    type="button"
                                    className={`${c.funcItem}`}
                                >
                                    <img
                                        className={c.funcIcon}
                                        src={folder}
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
                            <div className={classNames(styles.item)}>
                                <button
                                    hidden={false}
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
                        </div>}
                    </div>

                    <div className={c.line}></div>
                    <div
                        className={classNames({
                            [c.teacherModeItem]: true
                        })}
                        onClick={this.handleHideCode}
                    >
                        <img
                            src={hide}
                            alt="hide"
                        />
                        <span>隐藏设置</span>
                    </div>
                    <div className={c.line}></div>
                    <div
                        className={classNames({
                            [c.teacherModeItem]: true
                        })}
                        onClick={this.handleTeacherPreview}
                    >
                        <img
                            src={blowUp}
                            alt="blowUp"
                        />
                        <span>{isTeacherPreview ? '返回老师模式' : '预览学生模式'}</span>
                    </div>
                </div>}
            </div>
        );
    }
}

TaskBar.propTypes = {
    setProjectTitle: PropTypes.func,
    projectTitle: PropTypes.string,
    onRequestCloseFile: PropTypes.func,
    onProjectTelemetryEvent: PropTypes.func,
    locale: PropTypes.string,
    vm: PropTypes.instanceOf(VM).isRequired,
    onStartSelectingFileUpload: PropTypes.func
};

const mapStateToProps = state => ({
    projectTitle: state.scratchGui.projectTitle,
    locale: state.locales.locale,
    vm: state.scratchGui.vm
});
const mapDispatchToProps = dispatch => ({
    setProjectTitle: title => dispatch(setProjectTitle(title)),
    onRequestCloseFile: () => dispatch(closeFileMenu()),
});

export default connect(mapStateToProps, mapDispatchToProps)(TaskBar);
