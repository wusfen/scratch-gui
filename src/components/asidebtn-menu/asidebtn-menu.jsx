import React from 'react';
import classNames from 'classnames';
import styles from './asidebtn-menu.css';
import ReactTooltip from 'react-tooltip';
import bindAll from 'lodash.bindall';

const c = styles;

class Component extends React.Component{
    constructor (props) {
        super(props);
        bindAll(this, ['initState', 'mouseUp', 'undo', 'click']);
        this.state = {
            undoStack: false,
            redoStack: false
        };
    }

    componentDidMount (){
        this.addEventListener(document, 'mouseup', this.mouseUp, true);
        this.addEventListener('submit:已提交错误', e => {
            document.querySelector('#cleanUpButton').click();
        });
    }

    mouseUp (){
        this.initState();
    }

    undo (type) {
        Blockly.getMainWorkspace().undo(type);
        this.initState();
    }

    initState () {
        const getUndoStack = Blockly.getMainWorkspace().hasUndoStack();
        const getRedoStack = Blockly.getMainWorkspace().hasRedoStack();
        this.setState({
            undoStack: getUndoStack,
            redoStack: getRedoStack
        });
    }

    click (node) {
        node.dispatchEvent(new UIEvent('mousedown'));
    }

    render () {
        const {
            undoStack,
            redoStack
        } = this.state;

        return (
            <div className={classNames(styles.asideBtnWrapper)}>
                <button
                    type="button"
                    data-tip="上一步"
                    data-for="pre"
                    className={undoStack ? classNames(styles.undo) : classNames(styles.undo, styles.disable)}
                    onClick={this.undo.bind(this, false)}
                >
                </button>
                <ReactTooltip
                    place="bottom"
                    id="pre"
                    className={classNames(styles.tooltip)}
                ></ReactTooltip>
                <button
                    type="button"
                    data-tip="下一步"
                    data-for="next"
                    className={redoStack ? classNames(styles.redo) : classNames(styles.redo, styles.disable)}
                    onClick={this.undo.bind(this, true)}
                >
                </button>
                <ReactTooltip
                    place="bottom"
                    id="next"
                    className={classNames(styles.tooltip)}
                ></ReactTooltip>
                <button
                    type="button"
                    data-tip="放大代码块"
                    data-for="enlarge"
                    className={classNames(c.zoomIn)}
                    onClick={e => {
                        this.click(document.querySelector('.blocklyZoom image:nth-child(2)'));
                    }}
                ></button>
                <ReactTooltip
                    place="bottom"
                    id="enlarge"
                    className={classNames(styles.tooltip)}
                ></ReactTooltip>
                <button
                    type="button"
                    data-tip="缩小代码块"
                    data-for="narrow"
                    className={classNames(c.zoomOut)}
                    onClick={e => {
                        this.click(document.querySelector('.blocklyZoom image:nth-child(1)'));
                    }}
                ></button>
                <ReactTooltip
                    place="bottom"
                    id="narrow"
                    className={classNames(styles.tooltip)}
                ></ReactTooltip>
                <button
                    id="cleanUpButton"
                    onClick={e => {
                        const workspace = Blockly.getMainWorkspace();
                        workspace.cleanUp();
                        workspace.setScale(workspace.options.zoomOptions.startScale);
                        workspace.topOnBlock(workspace.topBlocks_.filter(e => e.rendered).sort((a, b) => {
                            return a.getRelativeToSurfaceXY().y - b.getRelativeToSurfaceXY().y;
                        })[0]?.id);
                    }}
                    type="button"
                    data-tip="整理代码"
                    data-for="arrange"
                    className={classNames(c.align)}
                ></button>
                <ReactTooltip
                    place="bottom"
                    id="arrange"
                    className={classNames(styles.tooltip)}
                ></ReactTooltip>
            </div>
        );
    }
}

Component.propTypes = {
};

export default Component;
