import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';

import styles from './styles.css';

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
                {children}
            </div>
        );
    }
}

Component.propTypes = {
    children: PropTypes.node
};

export default Component;
