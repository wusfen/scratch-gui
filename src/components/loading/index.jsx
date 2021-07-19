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
                {children || 'loading...'}
            </div>
        );
    }
}

Component.propTypes = {
    children: PropTypes.node,
};

Component.count = 0;
Component.show = function () {
    if (!Component.count) {
        const el = document.createElement('div');
        document.body.appendChild(el);

        const unmount = function () {
            ReactDOM.unmountComponentAtNode(el);
            document.body.removeChild(el);
        };
        Component.unmount = unmount;

        ReactDOM.render((
            <Component />
        ), el);
    }

    Component.count++;
};
Component.hide = function () {
    Component.count--;
    if (Component.count < 0) {
        Component.count = 0;
    }
    if (!Component.count && Component.unmount) {
        Component.unmount();
        Component.unmount = null;
    }
};

window.Loading = Component;

const mapStateToProps = state => ({
});
const mapDispatchToProps = () => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
