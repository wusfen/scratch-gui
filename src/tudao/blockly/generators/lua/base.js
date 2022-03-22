/*
* 基础块
* */
export default function (Blockly){

    Blockly.Lua.math_integer = function (block) {
        // const order = code < 0 ? Blockly.Lua.ORDER_UNARY :
        //     Blockly.Lua.ORDER_ATOMIC;
        const order = Blockly.Lua.ORDER_ATOMIC;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var code = parseFloat(block.getFieldValue('NUM'));
        return [code, order];
    };

    Blockly.Lua.math_number = function (block) {
        // const order = code < 0 ? Blockly.Lua.ORDER_UNARY :
        //     Blockly.Lua.ORDER_ATOMIC;
        const order = Blockly.Lua.ORDER_ATOMIC;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var code = parseFloat(block.getFieldValue('NUM'));

        return [code, order];
    };

    Blockly.Lua.math_whole_number = function (block) {
        const order = Blockly.Lua.ORDER_ATOMIC;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var code = parseInt(block.getFieldValue('NUM'), 10);
        return [code, order];
    };

    Blockly.Lua.math_positive_number = function (block) {
        const order = Blockly.Lua.ORDER_ATOMIC;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var code = parseFloat(block.getFieldValue('NUM'));
        return [code, order];
    };

    Blockly.Lua.text = function (block) {
        const order = Blockly.Lua.ORDER_ATOMIC;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return [Blockly.Lua.quote_(''), order];
        }
        window.GeneratedBlocks.push(block.id);

        const re = /^-?\d+[.]?\d*$/;
        let code = block.getFieldValue('TEXT');
        if (!code) {
            return [Blockly.Lua.quote_(''), Blockly.Lua.ORDER_ATOMIC];
        }
        if (re.test(code) === false) {
            code = Blockly.Lua.quote_(code);
        }
        return [code, order];
    };
}
