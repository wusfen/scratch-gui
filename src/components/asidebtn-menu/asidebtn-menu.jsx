import React from 'react';
import classNames from 'classnames';
import styles from './asidebtn-menu.css';
const c = styles;

class Component extends React.Component{
    constructor (props) {
        super(props);
        this.state = {
            undoStack: !false,
            redoStack: !false
        };
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
                    className={undoStack ? classNames(styles.undo) : classNames(styles.undo, styles.disable)}
                    onClick={this.undo.bind(this, false)}
                >
                </button>
                <button
                    type="button"
                    className={redoStack ? classNames(styles.redo) : classNames(styles.redo, styles.disable)}
                    onClick={this.undo.bind(this, true)}
                >
                </button>
                <button
                    type="button"
                    className={classNames(c.zoomIn)}
                    onClick={e => {
                        this.click(document.querySelector('.blocklyZoom image:nth-child(2)'));
                    }}
                ></button>
                <button
                    type="button"
                    className={classNames(c.zoomOut)}
                    onClick={e => {
                        this.click(document.querySelector('.blocklyZoom image:nth-child(1)'));
                    }}
                ></button>
                <button
                    onClick={e => {
                        this.click(document.querySelector('.blocklyZoom image:nth-child(3)'));
                    }}
                    type="button"
                    className={classNames(c.align)}
                ></button>
            </div>
        );
    }
}

Component.propTypes = {
};

export default Component;
