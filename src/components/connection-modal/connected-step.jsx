import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';

import Box from '../box/box.jsx';
import Dots from './dots.jsx';
import bluetoothIcon from './icons/bluetooth-white.svg';
import styles from './connection-modal.css';
import classNames from 'classnames';
import {LAST_PERIPHERAL_ID_KEY} from './peripheral-tile.jsx';

const ConnectedStep = props => (
    <Box className={styles.body}>
        <Box className={styles.activityArea}>
            <Box className={styles.peripheralTileName}>
                <Box className={styles.peripheralTileNameWrapper}>
                    <Box className={styles.peripheralTileNameText}>
                        {window._currentPeripheralName}
                    </Box>
                </Box>
            </Box>
            <div className={styles['peripheral-tile-item']}>
                <div
                    className={classNames([styles['peripheral-tile-status'], styles.success])}
                >
                    已连接
                </div>
            </div>

            <Box
                hidden
                className={styles.centeredRow}
            >
                <div className={styles.peripheralActivity}>
                    <img
                        className={styles.peripheralActivityIcon}
                        src={props.connectionIconURL}
                    />
                    <img
                        className={styles.bluetoothConnectedIcon}
                        src={bluetoothIcon}
                    />
                </div>
            </Box>
        </Box>
        <Box className={styles.bottomArea}>
            <Box
                hidden
                className={classNames(styles.bottomAreaItem, styles.instructions)}
            >
                <FormattedMessage
                    defaultMessage="Connected"
                    description="Message indicating that a device was connected"
                    id="gui.connection.connected"
                />
            </Box>
            <Dots
                success
                className={styles.bottomAreaItem}
                total={3}
            />
            <div className={classNames(styles.bottomAreaItem, styles.cornerButtons)}>
                <button
                    className={classNames(styles.redButton, styles.connectionButton)}
                    onClick={function (e){
                        // eslint-disable-next-line no-invalid-this
                        props.onDisconnect.apply(this, arguments);
                        delete localStorage[LAST_PERIPHERAL_ID_KEY];
                    }}
                >
                    <FormattedMessage
                        defaultMessage="Disconnect"
                        description="Button to disconnect the device"
                        id="gui.connection.disconnect"
                    />
                </button>
                <button
                    className={styles.connectionButton}
                    onClick={props.onCancel}
                >
                    <FormattedMessage
                        defaultMessage="Go to Editor"
                        description="Button to return to the editor"
                        id="gui.connection.go-to-editor"
                    />
                </button>
            </div>
        </Box>
    </Box>
);

ConnectedStep.propTypes = {
    connectionIconURL: PropTypes.string.isRequired,
    onCancel: PropTypes.func,
    onDisconnect: PropTypes.func
};

export default ConnectedStep;
