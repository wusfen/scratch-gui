import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import VM from 'scratch-vm';
import Keyboard from '../../components/keyboard/index.jsx';
import styles from './styles.css';

class Running extends React.Component{
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
            isPlayerOnly,
            isFullScreen,
            vm,
            ...props
        } = this.props;

        const {
            ...state
        } = this.state;

        if (isFullScreen) {
            return null;
        }

        return (
            <div
                hidden={!active}
                className={classNames(styles.container)}
                onClick={onStopAllClick}
            >
                <div>
                    <div className={classNames(styles.iconWrap)}>
                        <span className={classNames(styles.icon, styles.icon1)} />
                        <span className={classNames(styles.icon, styles.icon2)} />
                    </div>
                    <p className={classNames(styles.text1)}>{'积木运行中...'}</p>
                </div>

                <Keyboard
                    vm={vm}
                    isPlayerOnly={isPlayerOnly}
                />
            </div>
        );
    }
}

Running.propTypes = {
    active: PropTypes.bool,
    isPlayerOnly: PropTypes.bool,
    isFullScreen: PropTypes.bool,
    onStopAllClick: PropTypes.func,
    vm: PropTypes.instanceOf(VM),
};

export default Running;
