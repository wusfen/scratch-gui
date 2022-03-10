/*
 * operators
 * */
export default function (Blockly, blankfun){

    Blockly.Lua.operator_add = function (block) {
        var order = Blockly.Lua.ORDER_ADDITIVE;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var operator = '+';
        var argument0 = Blockly.Lua.valueToCode(block, 'NUM1', order) || '0';
        var argument1 = Blockly.Lua.valueToCode(block, 'NUM2', order) || '0';
        var code = argument0 + operator + argument1;
        return [code, order];
    };

    Blockly.Lua.operator_subtract = function (block) {
        var order = Blockly.Lua.ORDER_ADDITIVE;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var operator = '-';
        var argument0 = Blockly.Lua.valueToCode(block, 'NUM1', order) || '0';
        var argument1 = Blockly.Lua.valueToCode(block, 'NUM2', order) || '0';
        var code = argument0 + operator + argument1;
        return [code, order];
    };

    Blockly.Lua.operator_multiply = function (block) {
        var order = Blockly.Lua.ORDER_MULTIPLICATIVE;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var operator = '*';
        var argument0 = Blockly.Lua.valueToCode(block, 'NUM1', order) || '0';
        var argument1 = Blockly.Lua.valueToCode(block, 'NUM2', order) || '0';
        var code = argument0 + operator + argument1;
        return [code, order];
    };

    Blockly.Lua.operator_divide = function (block) {
        var order = Blockly.Lua.ORDER_MULTIPLICATIVE;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var operator = '/';
        var argument0 = Blockly.Lua.valueToCode(block, 'NUM1', order) || '0';
        var argument1 = Blockly.Lua.valueToCode(block, 'NUM2', order) || '0';
        var code = argument0 + operator + argument1;
        return [code, order];
    };

    Blockly.Lua.operator_random = function (block) {
        const order = Blockly.Lua.ORDER_HIGH;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var argument0 = Blockly.Lua.valueToCode(block, 'FROM',
            Blockly.Lua.ORDER_NONE) || '0';
        var argument1 = Blockly.Lua.valueToCode(block, 'TO',
            Blockly.Lua.ORDER_NONE) || '0';
        var code = `math.random(${argument0}, ${argument1})`;
        return [code, Blockly.Lua.ORDER_HIGH];
    };

    Blockly.Lua.operator_lt = function (block) {
        const order = Blockly.Lua.ORDER_RELATIONAL;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var operator = '<';
        var argument0 = Blockly.Lua.valueToCode(block, 'OPERAND1',
            Blockly.Lua.ORDER_RELATIONAL) || '0';
        var argument1 = Blockly.Lua.valueToCode(block, 'OPERAND2',
            Blockly.Lua.ORDER_RELATIONAL) || '0';
        var code = `${argument0} ${operator} ${argument1}`;
        return [code, Blockly.Lua.ORDER_RELATIONAL];
    };

    Blockly.Lua.operator_equals = function (block) {
        const order = Blockly.Lua.ORDER_RELATIONAL;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var operator = '==';
        var argument0 = Blockly.Lua.valueToCode(block, 'OPERAND1',
            Blockly.Lua.ORDER_RELATIONAL) || '0';
        var argument1 = Blockly.Lua.valueToCode(block, 'OPERAND2',
            Blockly.Lua.ORDER_RELATIONAL) || '0';
        var code = `${argument0} ${operator} ${argument1}`;
        return [code, Blockly.Lua.ORDER_RELATIONAL];
    };

    Blockly.Lua.operator_gt = function (block) {
        const order = Blockly.Lua.ORDER_RELATIONAL;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var operator = '>';
        var argument0 = Blockly.Lua.valueToCode(block, 'OPERAND1',
            Blockly.Lua.ORDER_RELATIONAL) || '0';
        var argument1 = Blockly.Lua.valueToCode(block, 'OPERAND2',
            Blockly.Lua.ORDER_RELATIONAL) || '0';
        var code = `${argument0} ${operator} ${argument1}`;
        return [code, Blockly.Lua.ORDER_RELATIONAL];
    };

    Blockly.Lua.operator_and = function (block) {
        var order = Blockly.Lua.ORDER_AND;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var operator = 'and';

        var argument0 = Blockly.Lua.valueToCode(block, 'OPERAND1', order) || '0';
        var argument1 = Blockly.Lua.valueToCode(block, 'OPERAND2', order) || '0';
        if (!argument0 && !argument1) {
            // If there are no arguments, then the return value is false.
            argument0 = 'false';
            argument1 = 'false';
        } else {
            // Single missing arguments have no effect on the return value.
            var defaultArgument = 'true';
            if (!argument0) {
                argument0 = defaultArgument;
            }
            if (!argument1) {
                argument1 = defaultArgument;
            }
        }
        var code = `${argument0} ${operator} ${argument1}`;
        return [code, order];
    };

    Blockly.Lua.operator_or = function (block) {
        var order = Blockly.Lua.ORDER_OR;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var operator = 'or';

        var argument0 = Blockly.Lua.valueToCode(block, 'OPERAND1', order) || '0';
        var argument1 = Blockly.Lua.valueToCode(block, 'OPERAND2', order) || '0';
        if (!argument0 && !argument1) {
            // If there are no arguments, then the return value is false.
            argument0 = 'false';
            argument1 = 'false';
        } else {
            // Single missing arguments have no effect on the return value.
            var defaultArgument = 'false';
            if (!argument0) {
                argument0 = defaultArgument;
            }
            if (!argument1) {
                argument1 = defaultArgument;
            }
        }
        var code = `${argument0} ${operator} ${argument1}`;
        return [code, order];
    };

    Blockly.Lua.operator_not = function (block) {
        var order = Blockly.Lua.ORDER_UNARY;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var argument0 = Blockly.Lua.valueToCode(block, 'OPERAND', order) || 'true';
        var code = `not ${argument0}`;
        return [code, order];
    };

    Blockly.Lua.operator_join = function (block) {
        const order = Blockly.Lua.ORDER_CONCATENATION;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var element0 = Blockly.Lua.valueToCode(block, 'STRING1',
            Blockly.Lua.ORDER_CONCATENATION) || '\'\'';
        var element1 = Blockly.Lua.valueToCode(block, 'STRING2',
            Blockly.Lua.ORDER_CONCATENATION) || '\'\'';
        var code = `${element0} .. ${element1}`;
        return [code, Blockly.Lua.ORDER_CONCATENATION];
    };

    Blockly.Lua.operator_letter_of = function (block) {
        const order = Blockly.Lua.ORDER_HIGH;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        // Get letter at index.
        var atOrder = Blockly.Lua.ORDER_NONE;
        var start = Blockly.Lua.valueToCode(block, 'LETTER', atOrder) || '1';
        var text = Blockly.Lua.valueToCode(block, 'STRING',
            Blockly.Lua.ORDER_NONE) || '\'\'';
        var code = `string.sub(${text}, ${start}, ${start})`;
        return [code, Blockly.Lua.ORDER_HIGH];
    };

    Blockly.Lua.operator_length = function (block) {
        const order = Blockly.Lua.ORDER_UNARY;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        // String or array length.
        var text = Blockly.Lua.valueToCode(block, 'STRING',
            Blockly.Lua.ORDER_UNARY) || '\'\'';
        return [`#${text}`, Blockly.Lua.ORDER_UNARY];
    };

    Blockly.Lua.operator_contains = function (block) {
        const order = Blockly.Lua.ORDER_RELATIONAL;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        // Search the text for a substring.
        var substring = Blockly.Lua.valueToCode(block, 'STRING2',
            Blockly.Lua.ORDER_NONE) || '\'\'';
        var text = Blockly.Lua.valueToCode(block, 'STRING1',
            Blockly.Lua.ORDER_NONE) || '\'\'';
        var functionName = Blockly.Lua.provideFunction_(
            'contains',
            [`function ${Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_
            }(str, substr) `,
            '  local i = string.find(str, substr, 1, true)',
            '  if i == nil then',
            '    return false',
            '  else',
            '    return true',
            '  end',
            'end']);

        var code = `${functionName}(${text}, ${substring})`;
        return [code, Blockly.Lua.ORDER_RELATIONAL];
    };

    Blockly.Lua.operator_mod = function (block) {
        const order = Blockly.Lua.ORDER_MULTIPLICATIVE;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        // Remainder computation.
        var argument0 = Blockly.Lua.valueToCode(block, 'NUM1',
            Blockly.Lua.ORDER_MULTIPLICATIVE) || '0';
        var argument1 = Blockly.Lua.valueToCode(block, 'NUM2',
            Blockly.Lua.ORDER_MULTIPLICATIVE) || '0';
        var code = `${argument0} % ${argument1}`;
        return [code, Blockly.Lua.ORDER_MULTIPLICATIVE];
    };

    Blockly.Lua.operator_round = function (block) {
        const order = Blockly.Lua.ORDER_HIGH;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        var code;
        var arg;
        arg = Blockly.Lua.valueToCode(block, 'NUM',
            Blockly.Lua.ORDER_ADDITIVE) || '0';
        code = `math.floor(${arg})`;
        return [code, Blockly.Lua.ORDER_HIGH];
    };

    Blockly.Lua.operator_mathop = function (block) {
        const order = Blockly.Lua.ORDER_HIGH;
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return ['', order];
        }
        window.GeneratedBlocks.push(block.id);

        // Math operators with single operand.
        var operator = block.getFieldValue('OPERATOR');
        var code;
        var arg;
        if (operator == '10 ^') {
            arg = Blockly.Lua.valueToCode(block, 'NUM',
                Blockly.Lua.ORDER_EXPONENTIATION) || '0';
            return [`10 ^ ${arg}`, Blockly.Lua.ORDER_EXPONENTIATION];
        }
        arg = Blockly.Lua.valueToCode(block, 'NUM',
            Blockly.Lua.ORDER_NONE) || '0';

        switch (operator) {
        case 'abs':
            code = `math.abs(${arg})`;
            break;
        case 'floor':
            code = `math.floor(${arg})`;
            break;
        case 'ceiling':
            code = `math.ceil(${arg})`;
            break;
        case 'sqrt':
            code = `math.sqrt(${arg})`;
            break;
        case 'sin':
            code = `math.sin(math.rad(${arg}))`;
            break;
        case 'cos':
            code = `math.cos(math.rad(${arg}))`;
            break;
        case 'tan':
            code = `math.tan(math.rad(${arg}))`;
            break;
        case 'asin':
            code = `math.deg(math.asin(${arg}))`;
            break;
        case 'acos':
            code = `math.deg(math.acos(${arg}))`;
            break;
        case 'atan':
            code = `math.deg(math.atan(${arg}))`;
            break;
        case 'ln':
            code = `math.log(${arg})`;
            break;
        case 'log':
            code = `math.log(${arg}, 10)`;
            break;
        case 'e ^':
            code = `math.exp(${arg})`;
            break;
        }
        return [code, Blockly.Lua.ORDER_HIGH];
    };

}
