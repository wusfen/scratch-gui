/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/jsx-no-literals */
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';

import styles from './styles.css';
const c = styles;

class Component extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            hidden: props.hidden,
        };

        bindAll(this, [
            'handleConfirm',
            'handleCancel',
            'handleClose',
        ]);

        this.handleConfirm = props.onConfirm || this.handleConfirm;
        this.handleCancel = props.onCancel || this.handleCancel;
        this.handleClose = props.onClose || this.handleClose;
    }
    handleConfirm () {
        this.setState({
            hidden: true,
        });
    }
    handleCancel () {
        this.setState({
            hidden: true,
        });
    }
    handleClose () {
        this.setState({
            hidden: true,
        });
    }
    render () {
        const {
            children,
            ...props
        } = this.props;

        const {
            hidden,
            ...state
        } = this.state;
        
        return (
            <div
                hidden={hidden}
                className={classNames(c.container)}
                {...props}
            >
                <div className={classNames(c.dialog)} >
                    <button
                        type="button"
                        className={classNames(c.close)}
                        onClick={this.handleClose}
                    >x</button>
                    <h3 className={classNames(c.title)}>
                        {props.title || (props.content ? '' : '请确认')}
                    </h3>
                    <div className={classNames(c.content)}>
                        {props.content}
                    </div>
                    <div className={classNames(c.buttons)}>
                        <button
                            type="button"
                            className={classNames(c.primary)}
                            onClick={this.handleConfirm}
                        >
                            确认
                        </button>
                        <button
                            type="button"
                            onClick={this.handleCancel}
                        >
                            取消
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

Component.confirm = function (options) {
    let rs;
    const promise = new Promise(r => (rs = r));
    
    const el = document.createElement('div');
    document.body.appendChild(el);
    
    const unmount = function () {
        ReactDOM.unmountComponentAtNode(el);
        document.body.removeChild(el);
    };

    const close = function () {
        unmount();
        options.onClose && options.onClose(rs);
    };
    const cancel = function () {
        unmount();
        options.onCancel && options.onCancel(rs);
    };
    const confirm = function () {
        unmount();
        if (options.onConfirm) {
            options.onConfirm(rs);
        } else {
            rs();
        }
    };

    ReactDOM.render((
        <Component
            title={options.title}
            content={options.content}
            onClose={close}
            onCancel={cancel}
            onConfirm={confirm}
        />
    ), el);

    return promise;
};

Component.propTypes = {
    hidden: PropTypes.bool,
    children: PropTypes.node,
    title: PropTypes.string,
    content: PropTypes.string,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    onClose: PropTypes.func,
};

export default Component;
