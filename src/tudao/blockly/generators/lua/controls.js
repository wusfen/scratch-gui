/* eslint-disable valid-jsdoc */

/*
 * controls
 * */

/**
 * 增加循环延迟
 */
function addRepeatDelay (){
    if (window.RepeatDelay && window.RepeatDelay === true) {
        return 'D2()\n';
    }
    return '';
}

export default function (Blockly, blankfun){

    Blockly.Lua.control_forever = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var substack = Blockly.Lua.statementToCode(block, 'SUBSTACK') || '';

        // 循环时增加定制的延迟函数
        const delay = addRepeatDelay();

        return `while true do\n  ${substack}${delay}  end\n`;
    };

    Blockly.Lua.control_repeat = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        // Repeat n times (internal number).
        var repeats = Blockly.Lua.valueToCode(block, 'TIMES',
            Blockly.Lua.ORDER_NONE) || '10';
        var branch = Blockly.Lua.statementToCode(block, 'SUBSTACK') || '';
        branch = Blockly.Lua.addContinueLabel(branch);
        var loopVar = Blockly.Lua.variableDB_.getDistinctName(
            'count', Blockly.Variables.NAME_TYPE);

        // 循环时增加定制的延迟函数
        const delay = addRepeatDelay();

        var code = `for ${loopVar} = 1, ${repeats} do\n${branch}${delay}  end\n`;
        return code;
    };

    Blockly.Lua.control_if = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        // If/elseif/else condition.
        let code = '';
        let branchCode;
        const conditionCode = Blockly.Lua.valueToCode(block, 'CONDITION',
            Blockly.Lua.ORDER_NONE) || 'false';
        branchCode = Blockly.Lua.statementToCode(block, 'SUBSTACK');
        code +=
            `if ${conditionCode} then\n${branchCode}`;

        if (block.getInput('SUBSTACK2')) {
            branchCode = Blockly.Lua.statementToCode(block, 'SUBSTACK2');
            code += `else\n${branchCode}`;
        }
        return `${code}end\n`;
    };

    Blockly.Lua.control_if_else = Blockly.Lua.control_if;

    Blockly.Lua.control_stop = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        return 'break\n';
    };

    Blockly.Lua.control_wait = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        const duration = Blockly.Lua.valueToCode(block, 'DURATION',
            Blockly.Lua.ORDER_NONE);
        return `DS(${duration}*10)\n`; // 延时的秒数（单位0.1秒）
    };

    Blockly.Lua.control_wait_until = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        const conditionCode = Blockly.Lua.valueToCode(block, 'CONDITION',
            Blockly.Lua.ORDER_NONE) || 'false';

        // 循环时增加定制的延迟函数
        const delay = addRepeatDelay();

        const code = `while (${conditionCode})==false do\n  \n${delay}end\n`;
        return code;
    };

    Blockly.Lua.control_repeat_until = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var argument0 = Blockly.Lua.valueToCode(block, 'CONDITION',
            Blockly.Lua.ORDER_UNARY) || 'false';
        var branch = Blockly.Lua.statementToCode(block, 'SUBSTACK') || '\n';
        branch = Blockly.Lua.addLoopTrap(branch, block.id);
        branch = Blockly.Lua.addContinueLabel(branch);

        // 循环时增加定制的延迟函数
        const delay = addRepeatDelay();

        return `while not ${argument0} do\n${branch}${delay}end\n`;
    };

    Blockly.Lua.control_while = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var argument0 = Blockly.Lua.valueToCode(block, 'CONDITION',
            Blockly.Lua.ORDER_NONE) || 'false';
        var branch = Blockly.Lua.statementToCode(block, 'SUBSTACK') || '\n';
        branch = Blockly.Lua.addLoopTrap(branch, block.id);
        branch = Blockly.Lua.addContinueLabel(branch);

        // 循环时增加定制的延迟函数
        const delay = addRepeatDelay();

        return `while ${argument0} do\n${branch}${delay}end\n`;
    };

    Blockly.Lua.control_for_each = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        // For each loop.
        var variable0 = Blockly.Lua.variableDB_.getName(
            block.getFieldValue('VARIABLE'), Blockly.Variables.NAME_TYPE);
        var argument0 = Blockly.Lua.valueToCode(block, 'VALUE',
            Blockly.Lua.ORDER_NONE) || '{}';
        var branch = Blockly.Lua.statementToCode(block, 'SUBSTACK') || '\n';
        branch = Blockly.Lua.addContinueLabel(branch);

        // 循环时增加定制的延迟函数
        const delay = addRepeatDelay();

        var code = `for _, ${variable0} in ipairs(${argument0}) do \n${
            branch}${delay}  end\n`;
        return code;
    };

    Blockly.Lua.control_start_as_clone = blankfun;

    Blockly.Lua.control_create_clone_of_menu = blankfun;

    Blockly.Lua.control_create_clone_of = blankfun;

    Blockly.Lua.control_delete_this_clone = blankfun;

    Blockly.Lua.control_get_counter = blankfun;

    Blockly.Lua.control_incr_counter = blankfun;

    Blockly.Lua.control_clear_counter = blankfun;

    Blockly.Lua.control_all_at_once = blankfun;

}
