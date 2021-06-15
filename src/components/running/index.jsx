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
                <div>
                    <div className={classNames(styles.iconWrap)}>
                        <span className={classNames(styles.icon, styles.icon1)}></span>
                        <span className={classNames(styles.icon, styles.icon2)}></span>
                        <span className={classNames(styles.icon, styles.icon3)}></span>
                    </div>
                    <p className={classNames(styles.text1)}>积木块运行中...</p>
                    <span className={classNames(styles.text2)}>点击停止</span>
                </div>
            </div>
        );
    }
}

Component.propTypes = {
    active: PropTypes.bool,
    onStopAllClick: PropTypes.func
};

export default Component;
