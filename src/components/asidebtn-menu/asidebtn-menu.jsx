import React from 'react';
import classNames from 'classnames';
import styles from './asidebtn-menu.css';

class Component extends React.Component{
    constructor (props) {
        super(props);
        this.state = {
            undoStack: false,
            redoStack: false
        }
    }
    
    undo (type) {
        Blockly.getMainWorkspace().undo(type);
        this.initState()
    }

    initState () {
        let getUndoStack = Blockly.getMainWorkspace().hasUndoStack();
        let getRedoStack = Blockly.getMainWorkspace().hasRedoStack();
        this.setState({
            undoStack: getUndoStack,
            redoStack: getRedoStack
        })
    }

    render () {
        const {
            undoStack,
            redoStack
        } = this.state;

        return (
            <div className={classNames(styles.asideBtnWrapper)}>
                <span 
                    className={undoStack?classNames(styles.undo):classNames(styles.undo, styles.disable)} 
                    onClick={this.undo.bind(this,false)}>
                </span>
                <span 
                    className={redoStack?classNames(styles.redo):classNames(styles.redo, styles.disable)} 
                    onClick={this.undo.bind(this,true)}>
                </span>
            </div>
        );
    }
}

Component.propTypes = {
};

export default Component;