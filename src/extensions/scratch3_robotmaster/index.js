/* eslint-disable valid-jsdoc */
const formatMessage = require('format-message');
const {ArgumentType, BlockType, Cast, BLE, Base64Util, log, RateLimiter} = require('scratch-vm');
import Blockly from 'scratch-blocks';
/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const iconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAC4jAAAuIwF4pT92AAAF62lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMC0wMy0xOVQyMTowMzo1NyswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjAtMDMtMjFUMTc6MTU6NDMrMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjAtMDMtMjFUMTc6MTU6NDMrMDg6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZjQ3MThmZmItOWEwMy1iZjQ3LWIzZjctMDc3Y2MzNjkzZTkyIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YzA4NWRlMTctZWUwOS0xNTQ2LTg4NTgtMThiZjU0NjQyZTI5IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6OTRkMWE4YmQtNzljMy1lMzQ1LWE0NTAtOTYyODU4NDljODYzIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo5NGQxYThiZC03OWMzLWUzNDUtYTQ1MC05NjI4NTg0OWM4NjMiIHN0RXZ0OndoZW49IjIwMjAtMDMtMTlUMjE6MDM6NTcrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmY0NzE4ZmZiLTlhMDMtYmY0Ny1iM2Y3LTA3N2NjMzY5M2U5MiIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yMVQxNzoxNTo0MyswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7fD+sgAAAOs0lEQVR4nO2aeZQURZ6Av8isrDOrqhu6W6CxgeYSceQhInJ4uwoiio7gyqrruCgjOiKuyCI+xjc6o7uOMzqj44jKpVyjrqKrPK9RHO8DEZT7EEag6LqPriOrMmL/aGjBbhCt99ZZqe+9+qMzOqN++WVUxO8XmUIpRYXvj/ZDB/D/nYrAMqkILJOKwDKpCCyTisAyqQgsk4rAMqkILJOKwDKpCCyTisAyqQgsk4rAMqkILJOKwDKpCCyTisAyqQgsk4rAMqkILJOKwDKpCCwTxzcPnDZ8GACa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';
const iconURI = require('@/lib/libraries/extensions/robotmaster/robotmaster.svg');

/**
 * A list of Robotmaster Device BLE service UUIDs.
 * @enum
 */
const BLEService = {
    NAME_ESP32: 'TUDAO_MASTER',
    NAME_nRF51822: 'Nordic_TUDAO', // 旧版
    DEVICE_SERVICE: '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
};

/**
 * A list of Robotmaster Device BLE characteristic UUIDs.
 *
 * Characteristic for Controller to Device:
 * - INPUT_COMMAND
 *
 * Characteristic for Device to Controller:
 * - OUTPUT_COMMAND
 *
 * @enum
 */
const BLECharacteristic = {
    INPUT_COMMAND: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
    OUTPUT_COMMAND: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
};

/**
 * A time interval to wait (in milliseconds) while a block that sends a BLE message is running.
 * @type {number}
 */
const BLESendInterval = 50;

/**
 * A maximum number of BLE message sends per second, to be enforced by the rate limiter.
 * @type {number}
 */
const BLESendRateMax = 20;

/**
 * Enum for lights for LED lights on the Robotmaster Device.
 * @readonly
 * @enum {number}
 */
const RobotmasterLedLight = {
    LIGHT1: 'LIGHT1',
    LIGHT2: 'LIGHT2',
    ALLLIGHTS: 'ALLLIGHTS'
};

/**
 * Enum for hues for LED lights on the Robotmaster Device.
 * @readonly
 * @enum {number}
 */
const RobotmasterLedHue = {
    CLOSED: '0',
    RED: '1',
    ORANGE: '2',
    YELLOW: '3',
    GREEN: '4',
    CYAN: '5',
    BLUE: '6',
    PURPLE: '7'
};

/**
 * Enum for ports for motor on the Robotmaster Device.
 * @readonly
 * @enum {number}
 */
const RobotmasterMotorPort = {
    ALLPORTS: 'ALLPORTS',
    PORT1: 'PORT1',
    PORT2: 'PORT2',
    PORT3: 'PORT3'
};

/**
 * Enum for directions for motor on the Robotmaster Device.
 * @readonly
 * @enum {number}
 */
const RobotmasterMotorDirection = {
    CLOCKWISE: 'CLOCKWISE',
    ANTICLOCKWISE: 'ANTICLOCKWISE'
};

/**
 * Enum for tilt sensor direction.
 * @readonly
 * @enum {string}
 */
const RobotmasterTiltDirection = {
    FRONT: 'front',
    BACK: 'back',
    LEFT: 'left',
    RIGHT: 'right',
    ANY: 'any'
};

/**
 * Manage communication with a Robotmaster Device peripheral over a Bluetooth Low Energy client socket.
 */
class Robotmaster {

    constructor (runtime, extensionId) {

        /**
         * The Scratch 3.0 runtime used to trigger the green flag button.
         * @type {Runtime}
         * @private
         */
        this._runtime = runtime;
        this._runtime.on('PROJECT_STOP_ALL', this.stopAll.bind(this));

        /**
         * The id of the extension this peripheral belongs to.
         */
        this._extensionId = extensionId;

        /**
         * The most recently received value for each sensor.
         * @type {Object.<string, number>}
         * @private
         */
        this._sensors = {
            distance: 0,
            distance2: 0,
            gyro_x_axis_angle: 0,
            gyro_y_axis_angle: 0,
            gyro_sum_acceleration: 0
        };

        /**
         * The Bluetooth connection socket for reading/writing peripheral data.
         * @type {BLE}
         * @private
         */
        this._ble = null;
        this._runtime.registerPeripheralExtension(extensionId, this);

        /**
         * A rate limiter utility, to help limit the rate at which we send BLE messages
         * over the socket to Scratch Link to a maximum number of sends per second.
         * @type {RateLimiter}
         * @private
         */
        this._rateLimiter = new RateLimiter(BLESendRateMax);

        this.reset = this.reset.bind(this);
        this._onConnect = this._onConnect.bind(this);
        this._onMessage = this._onMessage.bind(this);

        /**
         * 最近的一条指令
         * */
        this._lastCommand = Buffer.from([0xFF, 0xFE, 0x09, 0x01, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFD, 0xFC]);
    }

    /**
     * @return {number} - the latest value received from the distance sensor.
     */
    get distance () {
        return this._sensors.distance;
    }

    /**
     * @return {number} - the latest value received from the distance sensor.
     */
    get distance2 () {
        return this._sensors.distance2;
    }

    get gyro_x_axis_angle () {
        return this._sensors.gyro_x_axis_angle;
    }

    get gyro_y_axis_angle () {
        return this._sensors.gyro_y_axis_angle;
    }

    get gyro_sum_acceleration () {
        return this._sensors.gyro_sum_acceleration;
    }

    /**
     * Stop the tone playing and motors on the Robotmaster Device peripheral.
     */
    stopAll () {
        if (!this.isConnected()) return;
        this.stopAllMotors();
    }

    /**
     * Called by the runtime when user wants to scan for a Robotmaster Device peripheral.
     */
    scan () {
        if (this._ble) {
            this._ble.disconnect();
        }
        this._ble = new BLE(this._runtime, this._extensionId, {
            filters: [{
                name: BLEService.NAME_ESP32
            },
            {
                name: BLEService.NAME_nRF51822
            }
            ],
            optionalServices: [BLEService.DEVICE_SERVICE]
        }, this._onConnect, this.reset);
        window.scratchExtensions[this._extensionId].session = this;
    }

    /**
     * Called by the runtime when user wants to connect to a certain Robotmaster Device peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */
    connect (id) {
        if (this._ble) {
            this._ble.connectPeripheral(id);
        }
    }

    /**
     * Disconnects from the current BLE socket.
     */
    disconnect () {
        if (this._ble) {
            this._ble.disconnect();
        }

        this.reset();
    }

    /**
     * Reset all the state and timeout/interval ids.
     */
    reset () {
        this._sensors = {
            distance: 0,
            distance2: 0,
            gyro_x_axis_angle: 0,
            gyro_y_axis_angle: 0,
            gyro_sum_acceleration: 0
        };
    }

    /**
     * Called by the runtime to detect whether the Robotmaster Device peripheral is connected.
     * @return {boolean} - the connected state.
     */
    isConnected () {
        let connected = false;
        if (this._ble) {
            connected = this._ble.isConnected();
        }
        return connected;
    }

    /**
     * Write a message to the Robotmaster Device peripheral BLE socket.
     * @param {number} uuid - the UUID of the characteristic to write to
     * @param {Array} message - the message to write.
     * @param {boolean} [useLimiter=true] - if true, use the rate limiter
     * @return {Promise} - a promise result of the write operation
     */
    send (uuid, message, useLimiter = true) {
        if (!this.isConnected()) return Promise.resolve();

        if (useLimiter) {
            if (!this._rateLimiter.okayToSend()) return Promise.resolve();
        }
        return this._ble.write(
            BLEService.DEVICE_SERVICE,
            uuid,
            Base64Util.uint8ArrayToBase64(message),
            'base64',
            false
        );
    }

    /**
     * Starts reading data from peripheral after BLE has connected.
     * @private
     */
    _onConnect () {
        this._ble.startNotifications(
            BLEService.DEVICE_SERVICE,
            BLECharacteristic.OUTPUT_COMMAND,
            this._onMessage
        );
    }

    /**
     * Process the sensor data from the incoming BLE characteristic.
     * @param {object} base64 - the incoming BLE data.
     * @private
     */
    _onMessage (base64) {
        const data = Base64Util.base64ToUint8Array(base64);
        // log.info("onMessage: "+data);

        if (data.length === 11){ // 旧版固件
            if (data[7] < 255){
                this._sensors.distance = data[7];
                if (this._sensors.distance > 6) {
                    this._sensors.distance = 6;
                }
            }
            if (data[8] < 255){
                this._sensors.distance2 = data[8];
                if (this._sensors.distance2 > 6) {
                    this._sensors.distance2 = 6;
                }
            }
        } else { // 新版固件返回值长度为19
            if (data[6] < 255){
                this._sensors.distance = data[6];
                if (this._sensors.distance > 6) {
                    this._sensors.distance = 6;
                }
            }
            if (data[7] < 255){
                this._sensors.distance2 = data[7];
                if (this._sensors.distance2 > 6) {
                    this._sensors.distance2 = 6;
                }
            }
            if (data[8] < 255) {
                this._sensors.gyro_x_axis_angle = data[8] - 90;
            }
            if (data[9] < 255) {
                this._sensors.gyro_y_axis_angle = data[9] - 90;
            }
            if (data[10] < 255) {
                this._sensors.gyro_sum_acceleration = data[10];
            }
        }
    }

    /**
     * 构造指令
     * @param index
     * @param value
     */
    _setCommand (index, value){
        this._lastCommand[index] = value;
        return this._lastCommand;
    }

    /**
     * 设置LED灯色
     * @param {*} light 灯的位置
     * @param {*} hue 灯的颜色代码
     */
    setLightHue (light, hue){
        switch (light) {
        case 'LIGHT1':
            this._setCommand(8, Number(hue));
            break;
        case 'LIGHT2':
            this._setCommand(9, Number(hue));
            break;
        case 'ALLLIGHTS':
            this._setCommand(8, Number(hue));
            this._setCommand(9, Number(hue));
            break;
        }
        return this.send(BLECharacteristic.INPUT_COMMAND, this._lastCommand);
    }

    /**
     * 关灯
     * @param {*} light 灯的位置
     */
    turnOffLight (light) {
        switch (light) {
        case 'LIGHT1':
            this._setCommand(8, Number(RobotmasterLedHue.CLOSED));
            break;
        case 'LIGHT2':
            this._setCommand(9, Number(RobotmasterLedHue.CLOSED));
            break;
        case 'ALLLIGHTS':
            this._setCommand(8, Number(RobotmasterLedHue.CLOSED));
            this._setCommand(9, Number(RobotmasterLedHue.CLOSED));
            break;
        }
        return this.send(BLECharacteristic.INPUT_COMMAND, this._lastCommand);
    }

    /**
     * 设置电机速度
     * @param {*} port 端口
     * @param {*} speed 速度
     * @param {*} direction 方向
     */
    setMotorSpeed (port, speed, direction){
        var sign = (direction === 'CLOCKWISE') ? 1 : -1;
        switch (port) {
        case 'PORT1':
            this._setCommand(5, Number(speed) * sign);
            break;
        case 'PORT2':
            this._setCommand(6, Number(speed) * sign);
            break;
        case 'PORT3':
            this._setCommand(7, Number(speed) * sign);
            break;
        case 'ALLPORTS':
            this._setCommand(5, Number(speed) * sign);
            this._setCommand(6, Number(speed) * sign);
            this._setCommand(7, Number(speed) * sign);
            break;
        }
        return this.send(BLECharacteristic.INPUT_COMMAND, this._lastCommand);
    }

    /**
     * 停止电机
     * @param {*} port 端口
     */
    stopMotor (port){
        switch (port) {
        case 'PORT1':
            this._setCommand(5, 0);
            break;
        case 'PORT2':
            this._setCommand(6, 0);
            break;
        case 'PORT3':
            this._setCommand(7, 0);
            break;
        case 'ALLPORTS':
            this._setCommand(5, 0);
            this._setCommand(6, 0);
            this._setCommand(7, 0);
            break;
        }
        return this.send(BLECharacteristic.INPUT_COMMAND, this._lastCommand);
    }

    /**
     * Stop all the motors that are currently running.
     */
    stopAllMotors () {
        this.stopMotor('ALLPORTS');
    }

    /**
     * 上传代码
     * @param {*} code
     */
    uploadCode (){
        const code = Blockly.Lua.workspaceToCode(Blockly.getMainWorkspace());
        const content = (new TextEncoder()).encode(code);
        if (content.length > (256 * 256)) {
            alert('离线程序过大，无法传入机器人！');
            return;
        }
        const queue = [0xFF, 0xFE, 0x09, 0x02,
            Math.floor(content.length / 256), Math.floor(content.length % 256),
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFD, 0xFC];
        // console.log(`写入下载模式帧:${JSON.stringify(queue)}`);
        this.send(BLECharacteristic.INPUT_COMMAND, queue, false);

        // 写入程序文本
        let buf;
        let offset = 0;
        const _frame_length = 14;

        setTimeout(() => {
            while (offset < content.length) {
                if ((content.length - offset) <= _frame_length) { // 最后一帧
                    buf = content.slice(offset, content.length);
                    setTimeout(() => {
                        alert('下载成功');
                    }, 200);
                } else {
                    buf = content.slice(offset, offset + _frame_length);
                }
                offset += _frame_length;

                // 发出
                this.send(BLECharacteristic.INPUT_COMMAND, buf, false);
            }
        }, 150);

    }
}

/**
 * Scratch 3.0 blocks to interact with a Robotmaster Device peripheral.
 */
class Scratch3RobotmasterBlocks {


    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID () {
        return 'robotmaster';
    }

    /**
     * @return {number} - the tilt sensor counts as "tilted" if its tilt angle meets or exceeds this threshold.
     */
    static get TILT_THRESHOLD () {
        return 15;
    }

    /**
     * @return {array} - text and values for each tilt direction menu element
     */
    get TILT_DIRECTION_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'robotmaster.tiltDirectionMenu.front',
                    default: 'front',
                    description: 'label for front element in tilt direction picker for robotmaster extension'
                }),
                value: RobotmasterTiltDirection.FRONT
            },
            {
                text: formatMessage({
                    id: 'robotmaster.tiltDirectionMenu.back',
                    default: 'back',
                    description: 'label for back element in tilt direction picker for robotmaster extension'
                }),
                value: RobotmasterTiltDirection.BACK
            },
            {
                text: formatMessage({
                    id: 'robotmaster.tiltDirectionMenu.left',
                    default: 'left',
                    description: 'label for left element in tilt direction picker for robotmaster extension'
                }),
                value: RobotmasterTiltDirection.LEFT
            },
            {
                text: formatMessage({
                    id: 'robotmaster.tiltDirectionMenu.right',
                    default: 'right',
                    description: 'label for right element in tilt direction picker for robotmaster extension'
                }),
                value: RobotmasterTiltDirection.RIGHT
            },
            {
                text: formatMessage({
                    id: 'robotmaster.tiltDirectionMenu.any',
                    default: 'any',
                    description: 'label for any direction element in tilt direction picker for robotmaster extension'
                }),
                value: RobotmasterTiltDirection.ANY
            }
        ];
    }

    /**
     * Construct a set of Robotmaster Device blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // Create a new Robotmaster Device peripheral instance
        this._peripheral = new Robotmaster(this.runtime, Scratch3RobotmasterBlocks.EXTENSION_ID);
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: Scratch3RobotmasterBlocks.EXTENSION_ID,
            name: 'RobotMaster',
            blockIconURI: iconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'setLightHue',
                    text: formatMessage({
                        id: 'robotmaster.setLightHue',
                        default: 'set [LIGHT] color to [HUE]',
                        description: 'set the LED color'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LIGHT: {
                            type: ArgumentType.STRING,
                            menu: 'LIGHT',
                            defaultValue: RobotmasterLedLight.ALLLIGHTS
                        },
                        HUE: {
                            type: ArgumentType.STRING,
                            menu: 'HUE',
                            defaultValue: RobotmasterLedHue.RED
                        }
                    }
                },
                {
                    opcode: 'turnOffLight',
                    text: formatMessage({
                        id: 'robotmaster.turnOffLight',
                        default: 'turn the [LIGHT] off',
                        description: 'turn off the LED'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LIGHT: {
                            type: ArgumentType.STRING,
                            menu: 'LIGHT',
                            defaultValue: RobotmasterLedLight.ALLLIGHTS
                        }
                    }
                },
                {
                    opcode: 'setMotorSpeedByNum',
                    text: formatMessage({
                        id: 'robotmaster.setMotorSpeedByNum',
                        default: 'set [PORT] to speed [SPEED] on [DIRECTION] rotation',
                        description: "set motor(s)'s speed by num"
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'PORT',
                            defaultValue: RobotmasterMotorPort.PORT1
                        },
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '6'
                        },
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'DIRECTION',
                            defaultValue: RobotmasterMotorDirection.CLOCKWISE
                        }
                    }
                },
                {
                    opcode: 'stopMotor',
                    text: formatMessage({
                        id: 'robotmaster.stopMotor',
                        default: 'stop motor on [PORT]',
                        description: 'stop motor(s)'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'PORT',
                            defaultValue: RobotmasterMotorPort.ALLPORTS
                        }
                    }
                },
                {
                    opcode: 'getDistance',
                    text: formatMessage({
                        id: 'robotmaster.getDistance',
                        default: 'distance sensor 1',
                        description: 'the value returned by the distance sensor 1'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getDistance2',
                    text: formatMessage({
                        id: 'robotmaster.getDistance2',
                        default: 'distance sensor 2',
                        description: 'the value returned by the distance sensor 2'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getGyroXaxisAngle',
                    text: formatMessage({
                        id: 'robotmaster.getGyroXaxisAngle',
                        default: 'gyro\'s x-axis angle',
                        description: 'the value returned by the gyro\'s x-axis angle'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getGyroYaxisAngle',
                    text: formatMessage({
                        id: 'robotmaster.getGyroYaxisAngle',
                        default: 'gyro\'s y-axis angle',
                        description: 'the value returned by the gyro\'s y-axis angle'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getGyroSumAcceleration',
                    text: formatMessage({
                        id: 'robotmaster.getGyroSumAcceleration',
                        default: 'gyro\'s sum of acceleration',
                        description: 'the value returned by the gyro\'s sum of acceleration'
                    }),
                    blockType: BlockType.REPORTER
                },
                '---',
                {
                    opcode: 'whenDistance',
                    text: formatMessage({
                        id: 'robotmaster.whenDistance',
                        default: 'when distance [DEV] [OP] [REFERENCE]',
                        description: 'check for when distance is < or > than reference'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        DEV: {
                            type: ArgumentType.STRING,
                            menu: 'DISTANCE_DEVICE',
                            defaultValue: '1'
                        },
                        OP: {
                            type: ArgumentType.STRING,
                            menu: 'OP',
                            defaultValue: '<'
                        },
                        REFERENCE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 3
                        }
                    }
                },
                {
                    opcode: 'whenTilted',
                    text: formatMessage({
                        id: 'robotmaster.whenTilted',
                        default: 'when tilted [DIRECTION]',
                        description: 'when the Robotmaster is tilted in a direction'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'tiltDirectionAny',
                            defaultValue: RobotmasterTiltDirection.ANY
                        }
                    }
                },
                {
                    opcode: 'isTilted',
                    text: formatMessage({
                        id: 'robotmaster.isTilted',
                        default: 'tilted [DIRECTION]?',
                        description: 'is the Robotmaster is tilted in a direction?'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'tiltDirectionAny',
                            defaultValue: RobotmasterTiltDirection.ANY
                        }
                    }
                }
            ],
            menus: {
                LIGHT: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'robotmaster.LedLight.all',
                                default: 'all lights',
                                description:
                                    'label for all lights element in motor menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterLedLight.ALLLIGHTS
                        },
                        {
                            text: formatMessage({
                                id: 'robotmaster.LedLight.light1',
                                default: 'light1',
                                description:
                                    'label for light1 element in motor menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterLedLight.LIGHT1
                        },
                        {
                            text: formatMessage({
                                id: 'robotmaster.LedLight.light2',
                                default: 'light2',
                                description:
                                    'label for light2 element in motor menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterLedLight.LIGHT2
                        }
                    ]
                },
                HUE: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'robotmaster.LedHue.closed',
                                default: 'closed',
                                description:
                                    'label for closed element in led hue menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterLedHue.CLOSED
                        },
                        {
                            text: formatMessage({
                                id: 'robotmaster.LedHue.red',
                                default: 'red',
                                description:
                                    'label for red element in led hue menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterLedHue.RED
                        },
                        {
                            text: formatMessage({
                                id: 'robotmaster.LedHue.orange',
                                default: 'orange',
                                description:
                                    'label for orange element in led hue menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterLedHue.ORANGE
                        },
                        {
                            text: formatMessage({
                                id: 'robotmaster.LedHue.yellow',
                                default: 'yellow',
                                description:
                                    'label for yellow element in led hue menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterLedHue.YELLOW
                        },
                        {
                            text: formatMessage({
                                id: 'robotmaster.LedHue.green',
                                default: 'green',
                                description:
                                    'label for green element in led hue menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterLedHue.GREEN
                        },
                        {
                            text: formatMessage({
                                id: 'robotmaster.LedHue.cyan',
                                default: 'cyan',
                                description:
                                    'label for cyan element in led hue menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterLedHue.CYAN
                        },
                        {
                            text: formatMessage({
                                id: 'robotmaster.LedHue.blue',
                                default: 'blue',
                                description:
                                    'label for blue element in led hue menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterLedHue.BLUE
                        },
                        {
                            text: formatMessage({
                                id: 'robotmaster.LedHue.purple',
                                default: 'purple',
                                description:
                                    'label for purple element in led hue menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterLedHue.PURPLE
                        }
                    ]
                },
                PORT: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'robotmaster.MotorPort.all',
                                default: 'all ports',
                                description:
                                    'label for all element in motor menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterMotorPort.ALLPORTS
                        },
                        {
                            text: formatMessage({
                                id: 'robotmaster.MotorPort.port1',
                                default: 'port1',
                                description:
                                    'label for port1 element in motor menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterMotorPort.PORT1
                        },
                        {
                            text: formatMessage({
                                id: 'robotmaster.MotorPort.port2',
                                default: 'port2',
                                description:
                                    'label for port2 element in motor menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterMotorPort.PORT2
                        },
                        {
                            text: formatMessage({
                                id: 'robotmaster.MotorPort.port3',
                                default: 'port3',
                                description:
                                    'label for port3 element in motor menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterMotorPort.PORT3
                        }
                    ]
                },
                DIRECTION: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'robotmaster.MotorDirection.clockwise',
                                default: 'clockwise',
                                description:
                                    'label for clockwise element in motor menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterMotorDirection.CLOCKWISE
                        },
                        {
                            text: formatMessage({
                                id: 'robotmaster.MotorDirection.anticlockwise',
                                default: 'anticlockwise',
                                description:
                                    'label for anticlockwise element in motor menu for Tudao Robotmaster extension'
                            }),
                            value: RobotmasterMotorDirection.ANTICLOCKWISE
                        }
                    ]
                },
                tiltDirectionAny: {
                    acceptReporters: true,
                    items: this.TILT_DIRECTION_MENU
                },
                OP: {
                    acceptReporters: true,
                    items: ['<', '>']
                },
                DISTANCE_DEVICE: {
                    acceptReporters: true,
                    items: [
                        {
                            text: '1',
                            value: '1'
                        },
                        {
                            text: '2',
                            value: '2'
                        }
                    ]
                }
            }
        };
    }

    /**
     * Compare the distance sensor's value to a reference.
     * @param {object} args - the block's arguments.
     * @property {string} DEV - the distance sensor's device No.: '1' or '2'.
     * @property {string} OP - the comparison operation: '<' or '>'.
     * @property {number} REFERENCE - the value to compare against.
     * @return {boolean} - the result of the comparison, or false on error.
     */
    whenDistance (args) {
        let dist = 0;
        switch (args.DEV){
        case '1':
            dist = this._peripheral.distance;
            break;
        case '2':
            dist = this._peripheral.distance2;
            break;
        }
        switch (args.OP) {
        case '<':
            return dist < Cast.toNumber(args.REFERENCE);
        case '>':
            return dist > Cast.toNumber(args.REFERENCE);
        default:
            log.warn(`Unknown comparison operator in whenDistance: ${args.OP}`);
            return false;
        }
    }

    /**
     * @return {number} - the distance sensor1's value, scaled to the [0,6] range.
     */
    getDistance () {
        return this._peripheral.distance;
    }

    /**
     * @return {number} - the distance sensor2's value, scaled to the [0,6] range.
     */
    getDistance2 () {
        return this._peripheral.distance2;
    }

    getGyroXaxisAngle (){
        return this._peripheral.gyro_x_axis_angle;
    }

    getGyroYaxisAngle (){
        return this._peripheral.gyro_y_axis_angle;
    }

    getGyroSumAcceleration (){
        return this._peripheral.gyro_sum_acceleration;
    }

    /**
     * Set the LED's hue.
     * @param {object} args - the block's arguments.
     * @property {number} HUE - the hue to set, in the range [0,7].
     * @return {Promise} - a Promise that resolves after some delay.
     */
    setLightHue (args) {
        const inputLight = args.LIGHT;
        const inputHue = Cast.toNumber(args.HUE);

        this._peripheral.setLightHue(inputLight, inputHue);

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }

    /**
     * Turn off the LED.
     * @param {object} args - the block's arguments.
     * @property {number} LIGHT - the light to set.
     * @return {Promise} - a Promise that resolves after some delay.
     */
    turnOffLight (args) {
        const inputLight = args.LIGHT;

        this._peripheral.turnOffLight(inputLight);

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }

    /**
     * Set the Motor's speed by num.
     * @param {object} args - the block's arguments.
     * @return {Promise} - a Promise that resolves after some delay.
     */
    setMotorSpeedByNum (args) {
        const _maxSpeed = 12;

        const inputPort = args.PORT;
        let inputSpeed = Cast.toNumber(args.SPEED);
        inputSpeed = (inputSpeed > _maxSpeed) ? _maxSpeed : inputSpeed;
        inputSpeed = (inputSpeed < 0) ? 0 : inputSpeed;
        const inputDirection = args.DIRECTION;

        this._peripheral.setMotorSpeed(inputPort, inputSpeed, inputDirection);

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }

    /**
     * Stop the Motor's speed.
     * @param {object} args - the block's arguments.
     * @return {Promise} - a Promise that resolves after some delay.
     */
    stopMotor (args) {
        const inputPort = args.PORT;

        this._peripheral.stopMotor(inputPort);

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }

    /**
     * Test whether the tilt sensor is currently tilted.
     * @param {object} args - the block's arguments.
     * @property {TiltDirection} DIRECTION - the tilt direction to test (front, back, left, right, or any).
     * @return {boolean} - true if the tilt sensor is tilted past a threshold in the specified direction.
     */
    whenTilted (args) {
        return this._isTilted(args.DIRECTION);
    }

    /**
     * Test whether the tilt sensor is currently tilted.
     * @param {object} args - the block's arguments.
     * @property {TiltDirection} DIRECTION - the tilt direction to test (front, back, left, right, or any).
     * @return {boolean} - true if the tilt sensor is tilted past a threshold in the specified direction.
     */
    isTilted (args) {
        return this._isTilted(args.DIRECTION);
    }

    /**
     * Test whether the tilt sensor is currently tilted.
     * @param {TiltDirection} direction - the tilt direction to test (front, back, left, right, or any).
     * @return {boolean} - true if the tilt sensor is tilted past a threshold in the specified direction.
     * @private
     */
    _isTilted (direction) {
        switch (direction) {
        case RobotmasterTiltDirection.FRONT:
            return this._peripheral.gyro_y_axis_angle >= Scratch3RobotmasterBlocks.TILT_THRESHOLD;
        case RobotmasterTiltDirection.BACK:
            return this._peripheral.gyro_y_axis_angle <= (-1) * Scratch3RobotmasterBlocks.TILT_THRESHOLD;
        case RobotmasterTiltDirection.LEFT:
            return this._peripheral.gyro_x_axis_angle <= (-1) * Scratch3RobotmasterBlocks.TILT_THRESHOLD;
        case RobotmasterTiltDirection.RIGHT:
            return this._peripheral.gyro_x_axis_angle >= Scratch3RobotmasterBlocks.TILT_THRESHOLD;
        case RobotmasterTiltDirection.ANY:
            return (Math.abs(this._peripheral.gyro_x_axis_angle) >= Scratch3RobotmasterBlocks.TILT_THRESHOLD) ||
                    (Math.abs(this._peripheral.gyro_y_axis_angle) >= Scratch3RobotmasterBlocks.TILT_THRESHOLD);
        default:
            return false;
        }
    }
}

module.exports = Scratch3RobotmasterBlocks;
