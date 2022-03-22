/* eslint-disable valid-jsdoc */
/**
 * 彩灯接口菜单
 * @param {*} block
 * @returns
 */
export default function (Blockly, blankfun){

    Blockly.Lua.robotmaster_menu_LIGHT = function (block) {
        const order = Blockly.Lua.ORDER_NONE;
        var arg0 = block.getFieldValue('LIGHT');
        const code = arg0;
        return [code, order];
    };

    /**
     * 彩灯颜色菜单
     * @param {*} block
     * @returns
     */
    Blockly.Lua.robotmaster_menu_HUE = function (block) {
        const order = Blockly.Lua.ORDER_NONE;
        var arg0 = block.getFieldValue('HUE');
        const code = arg0;
        return [code, order];
    };

    /**
     * 速度菜单
     * @param {*} block
     * @returns
     */
    Blockly.Lua.robotmaster_menu_SPEED = function (block) {
        const order = Blockly.Lua.ORDER_NONE;
        var arg0 = block.getFieldValue('SPEED');
        const code = arg0;
        return [code, order];
    };

    /**
     * 电机接口菜单
     * @param {*} block
     * @returns
     */
    Blockly.Lua.robotmaster_menu_PORT = function (block) {
        const order = Blockly.Lua.ORDER_NONE;
        var arg0 = block.getFieldValue('PORT');
        const code = arg0;
        return [code, order];
    };

    /**
     * 电机转动方向菜单
     * @param {*} block
     * @returns
     */
    Blockly.Lua.robotmaster_menu_DIRECTION = function (block) {
        const order = Blockly.Lua.ORDER_NONE;
        var arg0 = block.getFieldValue('DIRECTION');
        const code = arg0;
        return [code, order];
    };

    /**
     * 陀螺仪倾斜菜单
     * @param {*} block
     * @returns
     */
    Blockly.Lua.robotmaster_menu_tiltDirectionAny = function (block) {
        const order = Blockly.Lua.ORDER_NONE;
        var arg0 = block.getFieldValue('tiltDirectionAny');
        const code = arg0;
        return [code, order];
    };

    /**
     * 设置内置灯的颜色
     * @param {*} block
     * @returns
     */
    Blockly.Lua.robotmaster_setLightHue = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var led;
        const order = Blockly.Lua.ORDER_NONE;
        const selled = Blockly.Lua.valueToCode(block, 'LIGHT', order) || 'ALLLIGHTS';
        switch (selled) {
        case 'LIGHT1':
            led = '1';
            break;
        case 'LIGHT2':
            led = '2';
            break;
        case 'ALLLIGHTS':
            led = '0';
            break;
        }
        const color = Blockly.Lua.valueToCode(block, 'HUE', order) || '0';
        return `L(${led},${color})\n`;
    };

    /**
     * 关掉内置灯
     * @param {*} block
     * @returns
     */
    Blockly.Lua.robotmaster_turnOffLight = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var led;
        const order = Blockly.Lua.ORDER_NONE;
        const selled = Blockly.Lua.valueToCode(block, 'LIGHT', order) || 'ALLLIGHTS';
        switch (selled) {
        case 'LIGHT1':
            led = '1';
            break;
        case 'LIGHT2':
            led = '2';
            break;
        case 'ALLLIGHTS':
            led = '0';
            break;
        }
        return `L(${led},0)\n`;
    };

    /**
     * 设置内置电机的速度
     * @param {*} block
     * @returns
     */
    Blockly.Lua.robotmaster_setMotorSpeedByNum = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        let code = '';
        const order = Blockly.Lua.ORDER_NONE;
        const _maxSpeed = 12;
        let speed = Number(Blockly.Lua.valueToCode(block, 'SPEED', order) || '0');
        speed = (speed < 0) ? 0 : speed;
        speed = (speed > _maxSpeed) ? _maxSpeed : speed;
        var sign;
        const seldirection = Blockly.Lua.valueToCode(block, 'DIRECTION', order) || 'CLOCKWISE';
        switch (seldirection) {
        case 'CLOCKWISE':
            sign = '1';
            break;
        case 'ANTICLOCKWISE':
            sign = '-1';
            break;
        }
        const selport = Blockly.Lua.valueToCode(block, 'PORT', order) || 'ALLPORTS';
        switch (selport) {
        case 'PORT1':
            code += `M(1,${speed.toString()},${sign})\n`;
            break;
        case 'PORT2':
            code += `M(2,${speed.toString()},${sign})\n`;
            break;
        case 'ALLPORTS':
            code += `M(1,${speed.toString()},${sign})\n`;
            code += `M(2,${speed.toString()},${sign})\n`;
            break;
        }
        return code;
    };

    /**
     * 停止内置电机
     * @param {*} block
     * @returns
     */
    Blockly.Lua.robotmaster_stopMotor = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        let code = '';
        const order = Blockly.Lua.ORDER_NONE;
        const selport = Blockly.Lua.valueToCode(block, 'PORT', order) || 'ALLPORTS';
        switch (selport) {
        case 'PORT1':
            code += 'MS(1)\n';
            break;
        case 'PORT2':
            code += 'MS(2)\n';
            break;
        case 'ALLPORTS':
            code += 'MS(1)\n';
            code += 'MS(2)\n';
            break;
        }
        return code;
    };

    /**
     * 获取距离传感器1的值
     * @param {*} block
     * @returns
     */
    Blockly.Lua.robotmaster_getDistance = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', Blockly.Lua.ORDER_NONE];
        }
        window.GeneratedBlocks.push(block.id);

        const code = 'GD(1)';
        return [code, Blockly.Lua.ORDER_NONE];
    };

    /**
     * 获取距离传感器2的值
     * @param {*} block
     * @returns
     */
    Blockly.Lua.robotmaster_getDistance2 = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', Blockly.Lua.ORDER_NONE];
        }
        window.GeneratedBlocks.push(block.id);

        const code = 'GD(2)';
        return [code, Blockly.Lua.ORDER_NONE];
    };

    /**
     * 获取陀螺仪X轴角度的值
     * @param {*} block
     * @returns
     */
    Blockly.Lua.robotmaster_getGyroXaxisAngle = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', Blockly.Lua.ORDER_NONE];
        }
        window.GeneratedBlocks.push(block.id);

        const code = 'RX()';
        return [code, Blockly.Lua.ORDER_NONE];
    };

    /**
     * 获取陀螺仪Y轴角度的值
     * @param {*} block
     * @returns
     */
    Blockly.Lua.robotmaster_getGyroYaxisAngle = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', Blockly.Lua.ORDER_NONE];
        }
        window.GeneratedBlocks.push(block.id);

        const code = 'RY()';
        return [code, Blockly.Lua.ORDER_NONE];
    };

    /**
     * 获取陀螺仪加速度矢量和
     * @param {*} block
     * @returns
     */
    Blockly.Lua.robotmaster_getGyroSumAcceleration = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', Blockly.Lua.ORDER_NONE];
        }
        window.GeneratedBlocks.push(block.id);

        const code = 'RA()';
        return [code, Blockly.Lua.ORDER_NONE];
    };

    /**
     * 当陀螺仪向某个方向倾斜
     */
    Blockly.Lua.robotmaster_whenTilted = blankfun;

    /**
     * 陀螺仪是否向某个方向倾斜
     * @param {*} block
     * @returns
     */
    Blockly.Lua.robotmaster_isTilted = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', Blockly.Lua.ORDER_NONE];
        }
        window.GeneratedBlocks.push(block.id);

        const TILT_THRESHOLD = '15';
        let code = '';
        const order = Blockly.Lua.ORDER_NONE;
        const seldirection = Blockly.Lua.valueToCode(block, 'DIRECTION', order) || 'any';
        switch (seldirection) {
        case 'front':
            code = `(RY()>=${TILT_THRESHOLD})`;
            break;
        case 'back':
            code = `(RY()<=-${TILT_THRESHOLD})`;
            break;
        case 'left':
            code = `(RX()<=-${TILT_THRESHOLD})`;
            break;
        case 'right':
            code = `(RX()>=${TILT_THRESHOLD})`;
            break;
        case 'any':
            code = `(math.abs(RX())>=${TILT_THRESHOLD} or math.abs(RY())>=${TILT_THRESHOLD})`;
            break;
        }
        return [code, Blockly.Lua.ORDER_NONE];
    };

}
