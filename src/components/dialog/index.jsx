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
    render () {
        const {
            ...props
        } = this.props;

        const {
            ...state
        } = this.state;

        return (
            <div
                className={classNames(c.container)}
            >
                <div className={classNames(c.dialog)} >
                    <button
                        hidden
                        type="button"
                        className={classNames(c.close)}
                        onClick={props.onClose}
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
                            onClick={props.onConfirm}
                        >
                            确认
                        </button>
                        <button
                            hidden={!props.isConfirm}
                            type="button"
                            onClick={props.onCancel}
                        >
                            取消
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

Component.alert = function (options, isConfirm) {
    if (typeof options !== 'object') {
        options = {
            title: options
        };
    }

    let rs;
    let rj;
    const promise = new Promise((s, j) => {
        rs = s; rj = j;
    });

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
            isConfirm={isConfirm}
            title={options.title}
            content={options.content}
            onClose={close}
            onCancel={cancel}
            onConfirm={confirm}
        />
    ), el);

    return promise;
};

Component.confirm = options => Component.alert(options, true);

Component.propTypes = {
    children: PropTypes.node,
    // eslint-disable-next-line react/forbid-prop-types
    title: PropTypes.any,
    content: PropTypes.string,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    onClose: PropTypes.func,
    isConfirm: PropTypes.bool,
};

export default Component;
