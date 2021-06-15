import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';

import styles from './styles.css';

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
            active,
            onStopAllClick,
            ...props
        } = this.props;
        
        const {
            ...state
        } = this.state;
        
        return (
            <div
                hidden={!active}
                className={classNames(styles.container)}
                onClick={onStopAllClick}
            >
                {'running'}
            </div>
        );
    }
}

Component.propTypes = {
    active: PropTypes.bool,
    onStopAllClick: PropTypes.func
};

export default Component;
