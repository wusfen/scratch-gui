/* eslint-disable valid-jsdoc */
/**
 * procedures
 */
export default function (Blockly, blankfun){
    /**
     * 过程参数引用布尔值
     * @param {*} block
     */
    Blockly.Lua.argument_reporter_boolean = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        const code = block.getFieldValue('VALUE');
        return [code, Blockly.Lua.ORDER_ATOMIC];
    };

    /**
     * 过程参数引用字符串或数字
     * @param {*} block
     */
    Blockly.Lua.argument_reporter_string_number = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        const code = block.getFieldValue('VALUE');
        return [code, Blockly.Lua.ORDER_ATOMIC];
    };

    /**
     * 过程参数列表
     * @param {*} block
     */
    Blockly.Lua.procedures_prototype = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        let code = ''; let count = 0;
        for (var param in block.displayNames_){
            if (count > 0) {
                code += ',';
            }
            code += param;
            count++;
        }
        return code;
    };

    /**
     * 定义过程
     * @param {*} block
     */
    Blockly.Lua.procedures_definition = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);


        let code = '';
        const procname = `proc${btoa(unescape(encodeURIComponent(block.childBlocks_[0].procCode_))).replace(/\+/g, '')
            .replace(/\//g, '')
            .replace(new RegExp('=', 'g'), '')}`;
        code += `function ${procname}(`;
        code += block.childBlocks_[0].displayNames_.join(',');
        code += ')\n';
        if (block.childBlocks_.length > 1){
            code += Blockly.Lua.blockToCode(block.childBlocks_[1]);
        }
        code += 'end';
        Blockly.Lua.definitions_[procname] = code;
        return '';
    };

    /**
     * 调用过程
     * @param {*} block
     */
    Blockly.Lua.procedures_call = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        window.procedures_call = block;

        let code = ''; let argumentCount;
        var ids = block.argumentIds_;
        const procname = `proc${btoa(unescape(encodeURIComponent(block.procCode_))).replace(/\+/g, '')
            .replace(/\//g, '')
            .replace(new RegExp('=', 'g'), '')}`;
        code += `${procname}(`;
        argumentCount = 0;
        ids.forEach(id => {
            if (argumentCount > 0) {
                code += ',';
            }
            code += `(${Blockly.Lua.valueToCode(block, id, Blockly.Lua.ORDER_NONE) || ''})`;
            argumentCount++;
        });
        code += ')\n';
        return code;
    };
}
