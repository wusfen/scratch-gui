import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';

import styles from './styles.css';
const c = styles;

class Component extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            isShow: !false
        };

        bindAll(this, [
        ]);
    }
    render () {
        const {
            children,
            ...props
        } = this.props;

        const {
            isShow,
            ...state
        } = this.state;

        return (
            <div
                hidden={!isShow}
                className={classNames(styles.container)}
            >
                <div className={classNames(c.inner)}>
                    <img src="https://unsplash.it/300/200/?blur" />
                    <button
                        className={classNames(c.close)}
                        onClick={props.onClose}
                    >x</button>
                </div>
            </div>
        );
    }
}

Component.propTypes = {
    children: PropTypes.node,
    src: PropTypes.string,
    onClose: PropTypes.func,
};

Component.show = function (src) {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const unmount = function () {
        ReactDOM.unmountComponentAtNode(el);
        document.body.removeChild(el);
    };

    const close = function () {
        unmount();
    };

    ReactDOM.render((
        <Component
            src={src}
            onClose={close}
        />
    ), el);
};


export default Component;
