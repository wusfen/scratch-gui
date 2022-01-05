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
        isSkipButtonShow,
        isPlayerOnly,
        ...componentProps
    } = props;

    const myRef = React.useRef();

    const onStopAllClickHandle = e => {
        myRef.current.blur();
        props.onStopAllClick(e);
    };

    const onGreenFlagClickHandle = e => {
        myRef.current.blur(); // 点击后失去焦点，解决键盘
        props.onGreenFlagClick(e);
    };

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
                onClick={onGreenFlagClickHandle}
            />
            <StopAll
                hidden
                active={active}
                title={intl.formatMessage(messages.stopTitle)}
                onClick={onStopAllClickHandle}
            />

            <button
                hidden={!(isSkipButtonShow)}
                className={classNames({
                    [styles.button]: true,
                    [styles.skipButton]: true,
                })}
                type="button"
                onClick={e => window.bridge.emit('exitEditor', {type: 'skip', interaction_passOrNot: window.subjectPassOrNot})}
            >
                {'跳过'}
            </button>
            <button
                className={classNames({
                    [styles.button]: true,
                    [styles.stop]: active,
                    [styles.blingBlingHigh]: guide,
                })}
                type="button"
                ref={myRef}
                onClick={active ? onStopAllClickHandle : onGreenFlagClickHandle}
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
    turbo: PropTypes.bool,
    isPlayerOnly: PropTypes.bool,
    isSkipButtonShow: PropTypes.bool
};

Controls.defaultProps = {
    active: false,
    turbo: false
};

export default injectIntl(Controls);
