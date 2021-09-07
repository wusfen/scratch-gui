import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import {setAutoClose, setVisible} from '../../reducers/auto-close';


import styles from './styles.css';
const c = styles;

class Component extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
        };

        bindAll(this, [
        ]);
    }
    render () {
        const {
            // eslint-disable-next-line no-unused-vars
            children,
            ...props
        } = this.props;

        const {
            // eslint-disable-next-line no-unused-vars
            ...state
        } = this.state;

        return (
            <button
                hidden={!(props.isVisible)}
                className={classNames(c.button, {[c.autoClose]: props.autoClose})}
                // eslint-disable-next-line no-unused-vars
                onClick={e => props.setAutoClose(!props.autoClose)}
            >
                {`pin`}
            </button>
        );
    }
}

Component.propTypes = {
    children: PropTypes.node,
    autoClose: PropTypes.bool,
    isVisible: PropTypes.bool,
    setAutoClose: PropTypes.func,
};

const mapStateToProps = state => ({
    autoClose: state.scratchGui.autoClose.autoClose,
    isVisible: state.scratchGui.autoClose.isVisible,
});
const mapDispatchToProps = dispatch => ({
    setAutoClose: autoClose => dispatch(setAutoClose(autoClose)),
    setVisible: autoClose => dispatch(setVisible(autoClose)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
