/* eslint-disable no-negated-condition */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import GreenFlag from '../green-flag/green-flag.jsx';
import StopAll from '../stop-all/stop-all.jsx';
import TurboMode from '../turbo-mode/turbo-mode.jsx';

import styles from './controls.css';
var c = styles;
Object.assign(c, require('../../css/animate.css'));

const messages = defineMessages({
    goTitle: {
        id: 'gui.controls.go',
        defaultMessage: 'Go',
        description: 'Green flag button title'
    },
    stopTitle: {
        id: 'gui.controls.stop',
        defaultMessage: 'Stop',
        description: 'Stop button title'
    }
});

const Controls = function (props) {
    const {
        guide,
        active,
        className,
        intl,
        onGreenFlagClick,
        onStopAllClick,
        turbo,
        ...componentProps
    } = props;

    return (
        <div
            className={classNames(styles.controlsContainer, className)}
            {...componentProps}
        >
            {turbo ? (
                <TurboMode />
            ) : null}
            <GreenFlag
                hidden
                active={active}
                title={intl.formatMessage(messages.goTitle)}
                onClick={onGreenFlagClick}
            />
            <StopAll
                hidden
                active={active}
                title={intl.formatMessage(messages.stopTitle)}
                onClick={onStopAllClick}
            />
            <button
                className={classNames({
                    [styles.button]: !active,
                    [styles.stopButton]: active,
                    [styles.blingBlingHigh]: guide, // TODO 按钮动效，切换 true false
                })}
                type="button"
                onClick={active ? onStopAllClick : onGreenFlagClick}
            >
                <img
                    src={!active ? require('../../assets/icons/star.svg') : require('../../assets/icons/red_stop.png')}
                    alt=""
                />
                {active ? '停止' : '开始'}
            </button>
        </div>
    );
};

Controls.propTypes = {
    active: PropTypes.bool,
    guide: PropTypes.bool,
    className: PropTypes.string,
    intl: intlShape.isRequired,
    onGreenFlagClick: PropTypes.func.isRequired,
    onStopAllClick: PropTypes.func.isRequired,
    turbo: PropTypes.bool
};

Controls.defaultProps = {
    active: false,
    turbo: false
};

export default injectIntl(Controls);
