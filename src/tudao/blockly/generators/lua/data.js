/* eslint-disable valid-jsdoc */
/**
 * data
 */
export default function (Blockly, blankfun){

    Blockly.Lua.data_variable = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var code = Blockly.Lua.variableDB_.getName(block.getFieldValue('VARIABLE'),
            Blockly.Variables.NAME_TYPE);
        return [code, Blockly.Lua.ORDER_ATOMIC];
    };

    Blockly.Lua.data_setvariableto = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var argument0 = Blockly.Lua.valueToCode(block, 'VALUE',
            Blockly.Lua.ORDER_NONE) || '0';
        var varName = Blockly.Lua.variableDB_.getName(
            block.getFieldValue('VARIABLE'), Blockly.Variables.NAME_TYPE);

        return `${varName} = ${argument0}\n`;
    };

    Blockly.Lua.data_changevariableby = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var argument0 = Blockly.Lua.valueToCode(block, 'VALUE',
            Blockly.Lua.ORDER_NONE) || '0';
        var varName = Blockly.Lua.variableDB_.getName(
            block.getFieldValue('VARIABLE'), Blockly.Variables.NAME_TYPE);
        return `${varName} += ${argument0}\n`;
    };

    Blockly.Lua.data_showvariable = blankfun;

    Blockly.Lua.data_hidevariable = blankfun;

    Blockly.Lua.data_listcontents = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var code = Blockly.Lua.variableDB_.getName(block.getFieldValue('LIST'),
            Blockly.Variables.NAME_TYPE);
        return [code, Blockly.Lua.ORDER_ATOMIC];
    };

    Blockly.Lua.data_listindexall = blankfun;

    Blockly.Lua.data_listindexrandom = blankfun;

    Blockly.Lua.data_addtolist = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var list = block.inputList[1].fieldRow[1].text_ || '{}';
        var value = Blockly.Lua.valueToCode(block, 'ITEM',
            Blockly.Lua.ORDER_NONE) || 'None';

        var code = `table.insert(${list}, ` +
            `#${list} + 1` +
            `, ${value})`;
        return `${code}\n`;
    };

    Blockly.Lua.data_deleteoflist = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var list = block.inputList[1].fieldRow[1].text_ || '{}';
        var at = Blockly.Lua.valueToCode(block, 'INDEX', Blockly.Lua.ORDER_NONE) || '1';
        var code = `table.remove(${list}, ${at})`;
        return `${code}\n`;
    };

    Blockly.Lua.data_deletealloflist = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var list = block.inputList[0].fieldRow[1].text_ || '{}';
        var code = `while #${list} > 0 do table.remove(${list}, #${list}) end`;
        return `${code}\n`;
    };

    Blockly.Lua.data_insertatlist = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var list = block.inputList[2].fieldRow[1].text_ || '{}';
        var at = Blockly.Lua.valueToCode(block, 'INDEX',
            Blockly.Lua.ORDER_ADDITIVE) || '1';
        var value = Blockly.Lua.valueToCode(block, 'ITEM',
            Blockly.Lua.ORDER_NONE) || 'None';
        var code = `table.insert(${list}, ${
            at}, ${value})`;
        return `${code}\n`;
    };

    Blockly.Lua.data_replaceitemoflist = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var list = block.inputList[1].fieldRow[1].text_ || '{}';
        var at = Blockly.Lua.valueToCode(block, 'INDEX',
            Blockly.Lua.ORDER_ADDITIVE) || '1';
        var value = Blockly.Lua.valueToCode(block, 'ITEM',
            Blockly.Lua.ORDER_NONE) || 'None';
        return `${list}[${at}] = ${value}\n`;
    };

    Blockly.Lua.data_itemoflist = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        // block_data_itemoflist = block;
        var list = block.inputList[1].fieldRow[1].text_ || '{}';
        var at = Blockly.Lua.valueToCode(block, 'INDEX', Blockly.Lua.ORDER_NONE) || '1';
        var code = `${list}[${at}]`;
        return [code, Blockly.Lua.ORDER_HIGH];
    };

    Blockly.Lua.data_itemnumoflist = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var list = block.inputList[1].fieldRow[1].text_ || '{}';
        var item = Blockly.Lua.valueToCode(block, 'ITEM',
            Blockly.Lua.ORDER_NONE) || '\'\'';
        var functionName = Blockly.Lua.provideFunction_(
            'first_index',
            [`function ${Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_}(t, elem)`,
                '  for k, v in ipairs(t) do',
                '    if v == elem then',
                '      return k',
                '    end',
                '  end',
                '  return 0',
                'end']);
        var code = `${functionName}(${list}, ${item})`;
        return [code, Blockly.Lua.ORDER_HIGH];
    };

    Blockly.Lua.data_lengthoflist = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        // String or array length.
        var list = block.inputList[0].fieldRow[1].text_ || '{}';
        return [`#${list}`, Blockly.Lua.ORDER_UNARY];
    };

    Blockly.Lua.data_listcontainsitem = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var list = block.inputList[0].fieldRow[0].text_ || '{}';
        var item = Blockly.Lua.valueToCode(block, 'ITEM',
            Blockly.Lua.ORDER_NONE) || '\'\'';
        var functionName = Blockly.Lua.provideFunction_(
            'list_contains_item',
            [`function ${Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_}(t, elem)`,
                '  for k, v in ipairs(t) do',
                '    if v == elem then',
                '      return true',
                '    end',
                '  end',
                '  return false',
                'end']);
        var code = `${functionName}(${list}, ${item})`;
        return [code, Blockly.Lua.ORDER_RELATIONAL];
    };

    Blockly.Lua.data_showlist = blankfun;

    Blockly.Lua.data_hidelist = blankfun;

}
