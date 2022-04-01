import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import React from 'react';

import Box from '../box/box.jsx';
import Dots from './dots.jsx';
import helpIcon from './icons/help.svg';
import backIcon from './icons/back.svg';
import refreshIcon from './icons/refresh.svg';
import bluetoothIcon from './icons/bluetooth.svg';
import scratchLinkIcon from './icons/scratchlink.svg';

import styles from './connection-modal.css';

const UnavailableStep = props => (
    <Box className={styles.body}>
        <Box className={styles.activityArea}>
            <div className={styles['scratch-link-help-title']}>
                连接助手：请检查以下内容
            </div>
            <div className={styles.scratchLinkHelp}>
                <div className={styles.scratchLinkHelpStep}>
                    <div className={styles.helpStepNumber}> {'1'} </div>
                    <div className={styles.helpStepText}>当前设备蓝牙已开启</div>
                </div>
                <div className={styles.scratchLinkHelpStep}>
                    <div className={styles.helpStepNumber}> {'2'} </div>
                    <div className={styles.helpStepText}>硬件设备开关已开启，超过3分钟未连接请重启设备</div>
                </div>
            </div>
            <div className={styles['peripheral-tile-item']}>
                <div
                    className={classNames([styles['peripheral-tile-status'], styles.warn])}
                >
                    扫描失败
                </div>
            </div>


            <div
                hidden
                className={styles.scratchLinkHelp}
            >
                <div className={styles.scratchLinkHelpStep}>
                    <div className={styles.helpStepNumber}>
                        {'1'}
                    </div>
                    <div className={styles.helpStepImage}>
                        <img
                            className={styles.scratchLinkIcon}
                            src={scratchLinkIcon}
                        />
                    </div>
                    <div className={styles.helpStepText}>
                        <FormattedMessage
                            defaultMessage="Make sure you have Scratch Link installed and running"
                            description="Message for getting Scratch Link installed"
                            id="gui.connection.unavailable.installscratchlink"
                        />
                    </div>
                </div>
                <div className={styles.scratchLinkHelpStep}>
                    <div className={styles.helpStepNumber}>
                        {'2'}
                    </div>
                    <div className={styles.helpStepImage}>
                        <img
                            className={styles.scratchLinkIcon}
                            src={bluetoothIcon}
                        />
                    </div>
                    <div className={styles.helpStepText}>
                        <FormattedMessage
                            defaultMessage="Check that Bluetooth is enabled"
                            description="Message for making sure Bluetooth is enabled"
                            id="gui.connection.unavailable.enablebluetooth"
                        />
                    </div>
                </div>
            </div>
        </Box>
        <Box className={styles.bottomArea}>
            <Dots
                error
                className={styles.bottomAreaItem}
                total={3}
            />
            <Box className={classNames(styles.bottomAreaItem, styles.buttonRow)}>
                <button
                    className={styles.connectionButton}
                    onClick={props.onScanning}
                >
                    <img
                        className={classNames(styles.buttonIconLeft, styles.buttonIconBack)}
                        src={refreshIcon}
                    />
                    <FormattedMessage
                        defaultMessage="Try again"
                        description="Button to initiate trying the device connection again after an error"
                        id="gui.connection.unavailable.tryagainbutton"
                    />
                </button>
                <button
                    hidden
                    className={styles.connectionButton}
                    onClick={props.onHelp}
                >
                    <img
                        className={styles.buttonIconLeft}
                        src={helpIcon}
                    />
                    <FormattedMessage
                        defaultMessage="Help"
                        description="Button to view help content"
                        id="gui.connection.unavailable.helpbutton"
                    />
                </button>
            </Box>
        </Box>
    </Box>
);

UnavailableStep.propTypes = {
    onHelp: PropTypes.func,
    onScanning: PropTypes.func
};

export default UnavailableStep;
