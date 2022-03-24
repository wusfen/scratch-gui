import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import React from 'react';
import bindAll from 'lodash.bindall';
import Box from '../box/box.jsx';

import styles from './connection-modal.css';

const LAST_PERIPHERAL_ID_KEY = 'scratch/20220324/LAST_PERIPHERAL_ID_KEY';

class PeripheralTile extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleConnecting'
        ]);

        // 自动连接上次
        if (localStorage[LAST_PERIPHERAL_ID_KEY] == this.props.peripheralId) {
            this.handleConnecting();
        }
    }
    handleConnecting () {
        this.props.onConnecting(this.props.peripheralId);
        window._currentPeripheralName = this.props.name;
        localStorage[LAST_PERIPHERAL_ID_KEY] = this.props.peripheralId;
    }
    render () {
        return (
            <Box
                title={this.props.peripheralId}
                className={styles.peripheralTile}
                onClick={this.handleConnecting}
            >
                <Box className={styles.peripheralTileName}>
                    <img
                        hidden
                        className={styles.peripheralTileImage}
                        src={this.props.connectionSmallIconURL}
                    />
                    <Box className={styles.peripheralTileNameWrapper}>
                        <Box
                            hidden
                            className={styles.peripheralTileNameLabel}
                        >
                            <FormattedMessage
                                defaultMessage="Device name"
                                description="Label for field showing the device name"
                                id="gui.connection.peripheral-name-label"
                            />
                        </Box>
                        <Box className={styles.peripheralTileNameText}>
                            {this.props.name}
                        </Box>
                    </Box>
                </Box>
                <div className={styles['peripheral-tile-item']}>
                    <div
                        className={classNames([styles['peripheral-tile-status'], styles.warn])}
                    >
                        未连接
                    </div>
                </div>
                <Box className={styles.peripheralTileWidgets} >
                    <Box
                        hidden
                        className={styles.signalStrengthMeter}
                    >
                        <div
                            className={classNames(styles.signalBar, {
                                [styles.greenBar]: this.props.rssi > -80
                            })}
                        />
                        <div
                            className={classNames(styles.signalBar, {
                                [styles.greenBar]: this.props.rssi > -60
                            })}
                        />
                        <div
                            className={classNames(styles.signalBar, {
                                [styles.greenBar]: this.props.rssi > -40
                            })}
                        />
                        <div
                            className={classNames(styles.signalBar, {
                                [styles.greenBar]: this.props.rssi > -20
                            })}
                        />
                    </Box>
                    <button
                        hidden
                        onClick={this.handleConnecting}
                    >
                        <FormattedMessage
                            defaultMessage="Connect"
                            description="Button to start connecting to a specific device"
                            id="gui.connection.connect"
                        />
                    </button>
                </Box>
            </Box>
        );
    }
}

PeripheralTile.propTypes = {
    connectionSmallIconURL: PropTypes.string,
    name: PropTypes.string,
    onConnecting: PropTypes.func,
    peripheralId: PropTypes.string,
    rssi: PropTypes.number
};

export default PeripheralTile;
