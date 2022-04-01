import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import Box from '../box/box.jsx';
import PeripheralTile from './peripheral-tile.jsx';
import Dots from './dots.jsx';

import radarIcon from './icons/searching.png';
import refreshIcon from './icons/refresh.svg';

import styles from './connection-modal.css';

const ScanningStep = props => (
    <Box className={styles.body}>
        <Box className={styles.activityArea}>

            {props.peripheralList.length ?
                <>
                    <div className={styles['scratch-link-help-title']}>
                        请选择连接设备
                    </div>
                    <div className={styles.scratchLinkHelp}></div>
                </> :
                <>
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
                </>
            }

            <div
                hidden={(props.scanning && props.peripheralList.length)}
                className={styles['peripheral-tile-item']}
            >
                <div
                    hidden={!(props.scanning)}
                    className={styles['peripheral-tile-status']}
                >
                    <img
                        className={classNames(styles.radarSmall, styles.radarSpin)}
                        src={radarIcon}
                    />
                    正在扫描，请靠近设备！
                </div>
                <div
                    hidden={!(!props.scanning && !props.peripheralList.length)}
                    className={classNames([styles['peripheral-tile-status'], styles.warn])}
                >
                    没有发现任何设备
                </div>
            </div>

            {props.scanning ? (
                props.peripheralList.length === 0 ? (
                    <div className={styles.activityAreaInfo}>
                        <div
                            hidden
                            className={styles.centeredRow}
                        >
                            <img
                                className={classNames(styles.radarSmall, styles.radarSpin)}
                                src={radarIcon}
                            />
                            <FormattedMessage
                                defaultMessage="Looking for devices"
                                description="Text shown while scanning for devices"
                                id="gui.connection.scanning.lookingforperipherals"
                            />
                        </div>
                    </div>
                ) : (
                    <div className={styles.peripheralTilePane}>
                        {props.peripheralList.map(peripheral =>
                            (<PeripheralTile
                                connectionSmallIconURL={props.connectionSmallIconURL}
                                key={peripheral.peripheralId}
                                name={peripheral.name}
                                peripheralId={peripheral.peripheralId}
                                rssi={peripheral.rssi}
                                onConnecting={props.onConnecting}
                            />)
                        )}
                    </div>
                )
            ) : (
                <Box
                    hidden
                    className={styles.instructions}
                >
                    <FormattedMessage
                        defaultMessage="No devices found"
                        description="Text shown when no devices could be found"
                        id="gui.connection.scanning.noPeripheralsFound"
                    />
                </Box>
            )}
        </Box>
        <Box className={styles.bottomArea}>
            <Box
                hidden
                className={classNames(styles.bottomAreaItem, styles.instructions)}
            >
                <FormattedMessage
                    defaultMessage="Select your device in the list above."
                    description="Prompt for choosing a device to connect to"
                    id="gui.connection.scanning.instructions"
                />
            </Box>
            <Dots
                className={styles.bottomAreaItem}
                counter={0}
                total={3}
            />
            <button
                disabled={(props.scanning && !props.peripheralList.length)}
                className={classNames(styles.bottomAreaItem, styles.connectionButton)}
                onClick={props.onRefresh}
            >
                <FormattedMessage
                    defaultMessage="Refresh"
                    description="Button in prompt for starting a search"
                    id="gui.connection.search"
                />
                <img
                    className={styles.buttonIconRight}
                    src={refreshIcon}
                />
            </button>
        </Box>
    </Box>
);

ScanningStep.propTypes = {
    connectionSmallIconURL: PropTypes.string,
    onConnecting: PropTypes.func,
    onRefresh: PropTypes.func,
    peripheralList: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        rssi: PropTypes.number,
        peripheralId: PropTypes.string
    })),
    scanning: PropTypes.bool.isRequired
};

ScanningStep.defaultProps = {
    peripheralList: [],
    scanning: true
};

export default ScanningStep;
