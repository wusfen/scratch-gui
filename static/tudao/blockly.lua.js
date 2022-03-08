/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Helper functions for generating Lua for blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 * Based on Ellen Spertus's blocky-lua project.
 */
'use strict';

goog.provide('Blockly.Lua');

goog.require('Blockly.Generator');


/**
 * Lua code generator.
 * @type {!Blockly.Generator}
 */
Blockly.Lua = new Blockly.Generator('Lua');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Lua.addReservedWords(
    // Special character
    '_,' +
    // From theoriginalbit's script:
    // https://github.com/espertus/blockly-lua/issues/6
    '__inext,assert,bit,colors,colours,coroutine,disk,dofile,error,fs,' +
    'fetfenv,getmetatable,gps,help,io,ipairs,keys,loadfile,loadstring,math,' +
    'native,next,os,paintutils,pairs,parallel,pcall,peripheral,print,' +
    'printError,rawequal,rawget,rawset,read,rednet,redstone,rs,select,' +
    'setfenv,setmetatable,sleep,string,table,term,textutils,tonumber,' +
    'tostring,turtle,type,unpack,vector,write,xpcall,_VERSION,__indext,' +
    // Not included in the script, probably because it wasn't enabled:
    'HTTP,' +
    // Keywords (http://www.lua.org/pil/1.3.html).
    'and,break,do,else,elseif,end,false,for,function,if,in,local,nil,not,or,' +
    'repeat,return,then,true,until,while,' +
    // Metamethods (http://www.lua.org/manual/5.2/manual.html).
    'add,sub,mul,div,mod,pow,unm,concat,len,eq,lt,le,index,newindex,call,' +
    // Basic functions (http://www.lua.org/manual/5.2/manual.html, section 6.1).
    'assert,collectgarbage,dofile,error,_G,getmetatable,inpairs,load,' +
    'loadfile,next,pairs,pcall,print,rawequal,rawget,rawlen,rawset,select,' +
    'setmetatable,tonumber,tostring,type,_VERSION,xpcall,' +
    // Modules (http://www.lua.org/manual/5.2/manual.html, section 6.3).
    'require,package,string,table,math,bit32,io,file,os,debug'
);

/**
 * Order of operation ENUMs.
 * http://www.lua.org/manual/5.3/manual.html#3.4.8
 */
Blockly.Lua.ORDER_ATOMIC = 0;          // literals
// The next level was not explicit in documentation and inferred by Ellen.
Blockly.Lua.ORDER_HIGH = 1;            // Function calls, tables[]
Blockly.Lua.ORDER_EXPONENTIATION = 2;  // ^
Blockly.Lua.ORDER_UNARY = 3;           // not # - ~
Blockly.Lua.ORDER_MULTIPLICATIVE = 4;  // * / %
Blockly.Lua.ORDER_ADDITIVE = 5;        // + -
Blockly.Lua.ORDER_CONCATENATION = 6;   // ..
Blockly.Lua.ORDER_RELATIONAL = 7;      // < > <=  >= ~= ==
Blockly.Lua.ORDER_AND = 8;             // and
Blockly.Lua.ORDER_OR = 9;              // or
Blockly.Lua.ORDER_NONE = 99;

/**
 * Note: Lua is not supporting zero-indexing since the language itself is
 * one-indexed, so the generator does not repoct the oneBasedIndex configuration
 * option used for lists and text.
 */

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Lua.init = function(workspace) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.Lua.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.Lua.functionNames_ = Object.create(null);

  if (!Blockly.Lua.variableDB_) {
    Blockly.Lua.variableDB_ =
        new Blockly.Names(Blockly.Lua.RESERVED_WORDS_);
  } else {
    Blockly.Lua.variableDB_.reset();
  }
  Blockly.Lua.variableDB_.setVariableMap(workspace.getVariableMap());
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Lua.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var definitions = [];
  for (var name in Blockly.Lua.definitions_) {
    definitions.push(Blockly.Lua.definitions_[name]);
  }
  // Clean up temporary data.
  delete Blockly.Lua.definitions_;
  delete Blockly.Lua.functionNames_;
  Blockly.Lua.variableDB_.reset();
  return definitions.join('\n\n') + '\n\n\n' + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything. In Lua, an expression is not a legal statement, so we must assign
 * the value to the (conventionally ignored) _.
 * http://lua-users.org/wiki/ExpressionsAsStatements
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Lua.scrubNakedValue = function(line) {
  return 'local _ = ' + line + '\n';
};

/**
 * Encode a string as a properly escaped Lua string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} Lua string.
 * @private
 */
Blockly.Lua.quote_ = function(string) {
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/'/g, '\\\'');
  return '\'' + string + '\'';
};

/**
 * Common tasks for generating Lua from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Lua code created for this block.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string} Lua code with comments and subsequent blocks added.
 * @private
 */
Blockly.Lua.scrub_ = function(block, code, opt_thisOnly) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    comment = Blockly.utils.wrap(comment, Blockly.Lua.COMMENT_WRAP - 3);
    if (comment) {
      commentCode += Blockly.Lua.prefixLines(comment, '-- ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          comment = Blockly.Lua.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Lua.prefixLines(comment, '-- ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = opt_thisOnly ? '' : Blockly.Lua.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

Blockly.Lua.lists = {};
let blankfun = (block) => {
    if(window.GeneratedBlocks&&!window.GeneratedBlocks.includes(block.id))
        window.GeneratedBlocks.push(block.id); 
    return '';
}

let blankvalfun = (block) => {
    if(window.GeneratedBlocks&&!window.GeneratedBlocks.includes(block.id))
        window.GeneratedBlocks.push(block.id); 
    return ['', Blockly.Lua.ORDER_NONE];
}

/**
 * This is the text used to implement a <pre>continue</pre>.
 * It is also used to recognise <pre>continue</pre>s in generated code so that
 * the appropriate label can be put at the end of the loop body.
 * @const {string}
 */
Blockly.Lua.CONTINUE_STATEMENT = 'goto continue\n';

/**
 * If the loop body contains a "goto continue" statement, add a continue label
 * to the loop body. Slightly inefficient, as continue labels will be generated
 * in all outer loops, but this is safer than duplicating the logic of
 * blockToCode.
 *
 * @param {string} branch Generated code of the loop body
 * @return {string} Generated label or '' if unnecessary
 */
Blockly.Lua.addContinueLabel = function (branch) {
    if (branch.indexOf(Blockly.Lua.CONTINUE_STATEMENT) > -1) {
        return branch + Blockly.Lua.INDENT + '::continue::\n';
    } else {
        return branch;
    }
};

/**
 * Returns an expression calculating the index into a list.
 * @param {string} listName Name of the list, used to calculate length.
 * @param {string} where The method of indexing, selected by dropdown in Blockly
 * @param {string=} opt_at The optional offset when indexing from start/end.
 * @return {string} Index expression.
 * @private
 */
Blockly.Lua.lists.getIndex_ = function (listName, where, opt_at) {
    if (where == 'FIRST') {
        return '1';
    } else if (where == 'FROM_END') {
        return '#' + listName + ' + 1 - ' + opt_at;
    } else if (where == 'LAST') {
        return '#' + listName;
    } else if (where == 'RANDOM') {
        return 'math.random(#' + listName + ')';
    } else {
        return opt_at;
    }
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Lua.finish = function (code) {
    // Convert the definitions dictionary into a list.
    var definitions = [];
    for (var name in Blockly.Lua.definitions_) {
        definitions.push(Blockly.Lua.definitions_[name]);
    }
    // Clean up temporary data.
    delete Blockly.Lua.definitions_;
    delete Blockly.Lua.functionNames_;
    Blockly.Lua.variableDB_.reset();

    let init = '\n';
    let re = /^-?\d+[.]?\d*$/;
    var varmodels = Blockly.Variables.allUsedVarModels(Blockly.getMainWorkspace());
    let variables = window.ScratchGui.props.vm.runtime.getTargetForStage().variables;
    if (varmodels && varmodels.length > 0) {
        varmodels.forEach((ele) => {
            //变量定义并初始化
            var variable = variables[ele.getId()];
            if (variable.type === 'list') {
                var elements = [];
                variable.value.forEach((v) => {
                    if (re.test(v) === false)
                        elements.push(Blockly.Lua.quote_(v));
                    else
                        elements.push(v);
                });
                init += '\n' + Blockly.Lua.variableDB_.getName(ele.name, Blockly.Variables.NAME_TYPE) + '={' + elements.join(', ') + '}';
            }
            else {
                var v = variable.value;
                init += '\n' + Blockly.Lua.variableDB_.getName(ele.name, Blockly.Variables.NAME_TYPE) + '=';
                if (re.test(v) === false)
                    init += Blockly.Lua.quote_(v);
                else
                    init += v;
            }
        });
    }
    return definitions.join('\n\n') + init + '\n\n\n' + code;
};

/*
 * controls
 * */

/**
 * 增加循环延迟
 * @returns 
 */
function addRepeatDelay(){
    if(window.RepeatDelay&&window.RepeatDelay===true)
        return 'D2()\n';
    return '';
}

Blockly.Lua['control_forever'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var substack = Blockly.Lua.statementToCode(block, 'SUBSTACK') || '';

    //循环时增加定制的延迟函数
    let delay=addRepeatDelay();

    return 'while true do\n  ' + substack + delay + '  end\n';
}

Blockly.Lua['control_repeat'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    // Repeat n times (internal number).
    var repeats = Blockly.Lua.valueToCode(block, 'TIMES',
        Blockly.Lua.ORDER_NONE) || '10';
    var branch = Blockly.Lua.statementToCode(block, 'SUBSTACK') || '';
    branch = Blockly.Lua.addContinueLabel(branch);
    var loopVar = Blockly.Lua.variableDB_.getDistinctName(
        'count', Blockly.Variables.NAME_TYPE);

    //循环时增加定制的延迟函数
    let delay=addRepeatDelay();

    var code = 'for ' + loopVar + ' = 1, ' + repeats + ' do\n' + branch + delay +'  end\n';
    return code;
}

Blockly.Lua['control_if'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    // If/elseif/else condition.
    let code = '', branchCode, conditionCode;
    conditionCode = Blockly.Lua.valueToCode(block, 'CONDITION',
        Blockly.Lua.ORDER_NONE) || 'false';
    branchCode = Blockly.Lua.statementToCode(block, 'SUBSTACK');
    code +=
        'if ' + conditionCode + ' then\n' + branchCode;

    if (block.getInput('SUBSTACK2')) {
        branchCode = Blockly.Lua.statementToCode(block, 'SUBSTACK2');
        code += 'else\n' + branchCode;
    }
    return code + 'end\n';
}

Blockly.Lua['control_if_else'] = Blockly.Lua['control_if'];

Blockly.Lua['control_stop'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    return 'break\n';
}

Blockly.Lua['control_wait'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    let duration = Blockly.Lua.valueToCode(block, 'DURATION',
        Blockly.Lua.ORDER_NONE);
    return 'DS(' + duration + '*10)\n'; //延时的秒数（单位0.1秒）
}

Blockly.Lua['control_wait_until'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    let conditionCode = Blockly.Lua.valueToCode(block, 'CONDITION',
        Blockly.Lua.ORDER_NONE) || 'false';

    //循环时增加定制的延迟函数
    let delay=addRepeatDelay();

    let code = 'while (' + conditionCode + ')==false do\n  \n'+delay+'end\n';
    return code;
}

Blockly.Lua['control_repeat_until'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var argument0 = Blockly.Lua.valueToCode(block, 'CONDITION',
        Blockly.Lua.ORDER_UNARY) || 'false';
    var branch = Blockly.Lua.statementToCode(block, 'SUBSTACK') || '\n';
    branch = Blockly.Lua.addLoopTrap(branch, block.id);
    branch = Blockly.Lua.addContinueLabel(branch);

    //循环时增加定制的延迟函数
    let delay=addRepeatDelay();

    return 'while not ' + argument0 + ' do\n' + branch + delay + 'end\n';
}

Blockly.Lua['control_while'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var argument0 = Blockly.Lua.valueToCode(block, 'CONDITION',
        Blockly.Lua.ORDER_NONE) || 'false';
    var branch = Blockly.Lua.statementToCode(block, 'SUBSTACK') || '\n';
    branch = Blockly.Lua.addLoopTrap(branch, block.id);
    branch = Blockly.Lua.addContinueLabel(branch);

    //循环时增加定制的延迟函数
    let delay=addRepeatDelay();

    return 'while ' + argument0 + ' do\n' + branch + delay+ 'end\n';
}

Blockly.Lua['control_for_each'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    // For each loop.
    var variable0 = Blockly.Lua.variableDB_.getName(
        block.getFieldValue('VARIABLE'), Blockly.Variables.NAME_TYPE);
    var argument0 = Blockly.Lua.valueToCode(block, 'VALUE',
        Blockly.Lua.ORDER_NONE) || '{}';
    var branch = Blockly.Lua.statementToCode(block, 'SUBSTACK') || '\n';
    branch = Blockly.Lua.addContinueLabel(branch);

    //循环时增加定制的延迟函数
    let delay=addRepeatDelay();

    var code = 'for _, ' + variable0 + ' in ipairs(' + argument0 + ') do \n' +
        branch + delay +'  end\n';
    return code;
}

Blockly.Lua['control_start_as_clone'] = blankfun

Blockly.Lua['control_create_clone_of_menu'] = blankfun

Blockly.Lua['control_create_clone_of'] = blankfun

Blockly.Lua['control_delete_this_clone'] = blankfun

Blockly.Lua['control_get_counter'] = blankfun

Blockly.Lua['control_incr_counter'] = blankfun

Blockly.Lua['control_clear_counter'] = blankfun

Blockly.Lua['control_all_at_once'] = blankfun

/*
 * events
 * */

Blockly.Lua['event_whentouchingobject'] = blankfun

Blockly.Lua['event_touchingobjectmenu'] = blankfun

Blockly.Lua['event_whenflagclicked'] = blankfun

Blockly.Lua['event_whenthisspriteclicked'] = blankfun

Blockly.Lua['event_whenstageclicked'] = blankfun

Blockly.Lua['event_whenbroadcastreceived'] = blankfun

Blockly.Lua['event_whenbackdropswitchesto'] = blankfun

Blockly.Lua['event_whengreaterthan'] = blankfun

Blockly.Lua['event_broadcast_menu'] = blankfun

Blockly.Lua['event_broadcast'] = blankfun

Blockly.Lua['event_broadcastandwait'] = blankfun

Blockly.Lua['event_whenkeypressed'] = blankfun

/*
 * looks
 * */

Blockly.Lua['looks_sayforsecs'] = blankfun

Blockly.Lua['looks_say'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var msg = Blockly.Lua.valueToCode(block, 'MESSAGE',
        Blockly.Lua.ORDER_NONE) || '\'\'';
    return 'print(' + msg + ')\n';
}

Blockly.Lua['looks_thinkforsecs'] = blankfun

Blockly.Lua['looks_think'] = blankfun

Blockly.Lua['looks_show'] = blankfun

Blockly.Lua['looks_hide'] = blankfun

Blockly.Lua['looks_hideallsprites'] = blankfun

Blockly.Lua['looks_changeeffectby'] = blankfun

Blockly.Lua['looks_seteffectto'] = blankfun

Blockly.Lua['looks_cleargraphiceffects'] = blankfun

Blockly.Lua['looks_changesizeby'] = blankfun

Blockly.Lua['looks_setsizeto'] = blankfun

Blockly.Lua['looks_size'] = blankfun

Blockly.Lua['looks_changestretchby'] = blankfun

Blockly.Lua['looks_setstretchto'] = blankfun

Blockly.Lua['looks_costume'] = blankfun

Blockly.Lua['looks_switchcostumeto'] = blankfun

Blockly.Lua['looks_nextcostume'] = blankfun

Blockly.Lua['looks_switchbackdropto'] = blankfun

Blockly.Lua['looks_backdrops'] = blankfun

Blockly.Lua['looks_gotofrontback'] = blankfun

Blockly.Lua['looks_goforwardbackwardlayers'] = blankfun

Blockly.Lua['looks_backdropnumbername'] = blankfun

Blockly.Lua['looks_costumenumbername'] = blankfun

Blockly.Lua['looks_switchbackdroptoandwait'] = blankfun

Blockly.Lua['looks_nextbackdrop'] = blankfun

/*
 * motions
 * */

Blockly.Lua['motion_movesteps'] = blankfun

Blockly.Lua['motion_turnright'] = blankfun

Blockly.Lua['motion_turnleft'] = blankfun

Blockly.Lua['motion_pointindirection'] = blankfun

Blockly.Lua['motion_pointtowards_menu'] = blankfun

Blockly.Lua['motion_pointtowards'] = blankfun

Blockly.Lua['motion_goto_menu'] = blankfun

Blockly.Lua['motion_gotoxy'] = blankfun

Blockly.Lua['motion_goto'] = blankfun

Blockly.Lua['motion_glidesecstoxy'] = blankfun

Blockly.Lua['motion_glideto_menu'] = blankfun

Blockly.Lua['motion_glideto'] = blankfun

Blockly.Lua['motion_changexby'] = blankfun

Blockly.Lua['motion_setx'] = blankfun

Blockly.Lua['motion_changeyby'] = blankfun

Blockly.Lua['motion_sety'] = blankfun

Blockly.Lua['motion_ifonedgebounce'] = blankfun

Blockly.Lua['motion_setrotationstyle'] = blankfun

Blockly.Lua['motion_xposition'] = blankfun

Blockly.Lua['motion_yposition'] = blankfun

Blockly.Lua['motion_direction'] = blankfun

Blockly.Lua['motion_scroll_right'] = blankfun

Blockly.Lua['motion_scroll_up'] = blankfun

Blockly.Lua['motion_align_scene'] = blankfun

Blockly.Lua['motion_xscroll'] = blankfun

Blockly.Lua['motion_yscroll'] = blankfun

/*
 * operators
 * */

Blockly.Lua['operator_add'] = function (block) {
    var order = Blockly.Lua.ORDER_ADDITIVE;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    var operator = '+';
    var order = Blockly.Lua.ORDER_ADDITIVE;
    var argument0 = Blockly.Lua.valueToCode(block, 'NUM1', order) || '0';
    var argument1 = Blockly.Lua.valueToCode(block, 'NUM2', order) || '0';
    var code = argument0 + operator + argument1;
    return [code, order];
}

Blockly.Lua['operator_subtract'] = function (block) {
    var order = Blockly.Lua.ORDER_ADDITIVE;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    var operator = '-';
    var argument0 = Blockly.Lua.valueToCode(block, 'NUM1', order) || '0';
    var argument1 = Blockly.Lua.valueToCode(block, 'NUM2', order) || '0';
    var code = argument0 + operator + argument1;
    return [code, order];
}

Blockly.Lua['operator_multiply'] = function (block) {
    var order = Blockly.Lua.ORDER_MULTIPLICATIVE;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    var operator = '*';
    var argument0 = Blockly.Lua.valueToCode(block, 'NUM1', order) || '0';
    var argument1 = Blockly.Lua.valueToCode(block, 'NUM2', order) || '0';
    var code = argument0 + operator + argument1;
    return [code, order];
}

Blockly.Lua['operator_divide'] = function (block) {
    var order = Blockly.Lua.ORDER_MULTIPLICATIVE;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    var operator = '/';
    var argument0 = Blockly.Lua.valueToCode(block, 'NUM1', order) || '0';
    var argument1 = Blockly.Lua.valueToCode(block, 'NUM2', order) || '0';
    var code = argument0 + operator + argument1;
    return [code, order];
}

Blockly.Lua['operator_random'] = function (block) {
    let order=Blockly.Lua.ORDER_HIGH;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    var argument0 = Blockly.Lua.valueToCode(block, 'FROM',
        Blockly.Lua.ORDER_NONE) || '0';
    var argument1 = Blockly.Lua.valueToCode(block, 'TO',
        Blockly.Lua.ORDER_NONE) || '0';
    var code = 'math.random(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.Lua.ORDER_HIGH];
}

Blockly.Lua['operator_lt'] = function (block) {
    let order=Blockly.Lua.ORDER_RELATIONAL;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    var operator = '<';
    var argument0 = Blockly.Lua.valueToCode(block, 'OPERAND1',
        Blockly.Lua.ORDER_RELATIONAL) || '0';
    var argument1 = Blockly.Lua.valueToCode(block, 'OPERAND2',
        Blockly.Lua.ORDER_RELATIONAL) || '0';
    var code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, Blockly.Lua.ORDER_RELATIONAL];
}

Blockly.Lua['operator_equals'] = function (block) {
    let order=Blockly.Lua.ORDER_RELATIONAL;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    var operator = '==';
    var argument0 = Blockly.Lua.valueToCode(block, 'OPERAND1',
        Blockly.Lua.ORDER_RELATIONAL) || '0';
    var argument1 = Blockly.Lua.valueToCode(block, 'OPERAND2',
        Blockly.Lua.ORDER_RELATIONAL) || '0';
    var code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, Blockly.Lua.ORDER_RELATIONAL];
}

Blockly.Lua['operator_gt'] = function (block) {
    let order=Blockly.Lua.ORDER_RELATIONAL;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    var operator = '>';
    var argument0 = Blockly.Lua.valueToCode(block, 'OPERAND1',
        Blockly.Lua.ORDER_RELATIONAL) || '0';
    var argument1 = Blockly.Lua.valueToCode(block, 'OPERAND2',
        Blockly.Lua.ORDER_RELATIONAL) || '0';
    var code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, Blockly.Lua.ORDER_RELATIONAL];
}

Blockly.Lua['operator_and'] = function (block) {
    var order = Blockly.Lua.ORDER_AND;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
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
    var code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, order];
}

Blockly.Lua['operator_or'] = function (block) {
    var order = Blockly.Lua.ORDER_OR;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
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
    var code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, order];
}

Blockly.Lua['operator_not'] = function (block) {
    var order = Blockly.Lua.ORDER_UNARY;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);
    
    var argument0 = Blockly.Lua.valueToCode(block, 'OPERAND', order) || 'true';
    var code = 'not ' + argument0;
    return [code, order];
}

Blockly.Lua['operator_join'] = function (block) {
    let order=Blockly.Lua.ORDER_CONCATENATION;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    var element0 = Blockly.Lua.valueToCode(block, 'STRING1',
        Blockly.Lua.ORDER_CONCATENATION) || '\'\'';
    var element1 = Blockly.Lua.valueToCode(block, 'STRING2',
        Blockly.Lua.ORDER_CONCATENATION) || '\'\'';
    var code = element0 + ' .. ' + element1;
    return [code, Blockly.Lua.ORDER_CONCATENATION];
}

Blockly.Lua['operator_letter_of'] = function (block) {
    let order=Blockly.Lua.ORDER_HIGH;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    // Get letter at index.
    var atOrder = Blockly.Lua.ORDER_NONE;
    var start = Blockly.Lua.valueToCode(block, 'LETTER', atOrder) || '1';
    var text = Blockly.Lua.valueToCode(block, 'STRING',
        Blockly.Lua.ORDER_NONE) || '\'\'';
    var code = 'string.sub(' + text + ', ' + start + ', ' + start + ')';
    return [code, Blockly.Lua.ORDER_HIGH];
}

Blockly.Lua['operator_length'] = function (block) {
    let order=Blockly.Lua.ORDER_UNARY;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    // String or array length.
    var text = Blockly.Lua.valueToCode(block, 'STRING',
        Blockly.Lua.ORDER_UNARY) || '\'\'';
    return ['#' + text, Blockly.Lua.ORDER_UNARY];
}

Blockly.Lua['operator_contains'] = function (block) {
    let order=Blockly.Lua.ORDER_RELATIONAL;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    // Search the text for a substring.
    var substring = Blockly.Lua.valueToCode(block, 'STRING2',
        Blockly.Lua.ORDER_NONE) || '\'\'';
    var text = Blockly.Lua.valueToCode(block, 'STRING1',
        Blockly.Lua.ORDER_NONE) || '\'\'';
    var functionName = Blockly.Lua.provideFunction_(
        'contains',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ +
            '(str, substr) ',
            '  local i = string.find(str, substr, 1, true)',
            '  if i == nil then',
            '    return false',
            '  else',
            '    return true',
            '  end',
            'end']);

    var code = functionName + '(' + text + ', ' + substring + ')';
    return [code, Blockly.Lua.ORDER_RELATIONAL];
}

Blockly.Lua['operator_mod'] = function (block) {
    let order=Blockly.Lua.ORDER_MULTIPLICATIVE;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    // Remainder computation.
    var argument0 = Blockly.Lua.valueToCode(block, 'NUM1',
        Blockly.Lua.ORDER_MULTIPLICATIVE) || '0';
    var argument1 = Blockly.Lua.valueToCode(block, 'NUM2',
        Blockly.Lua.ORDER_MULTIPLICATIVE) || '0';
    var code = argument0 + ' % ' + argument1;
    return [code, Blockly.Lua.ORDER_MULTIPLICATIVE];
}

Blockly.Lua['operator_round'] = function (block) {
    let order=Blockly.Lua.ORDER_HIGH;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    var code;
    var arg;
    arg = Blockly.Lua.valueToCode(block, 'NUM',
        Blockly.Lua.ORDER_ADDITIVE) || '0';
    code = 'math.floor(' + arg + ')';
    return [code, Blockly.Lua.ORDER_HIGH];
}

Blockly.Lua['operator_mathop'] = function (block) {
    let order=Blockly.Lua.ORDER_HIGH;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    // Math operators with single operand.
    var operator = block.getFieldValue('OPERATOR');
    var code;
    var arg;
    if (operator == '10 ^') {
        arg = Blockly.Lua.valueToCode(block, 'NUM',
            Blockly.Lua.ORDER_EXPONENTIATION) || '0';
        return ['10 ^ ' + arg, Blockly.Lua.ORDER_EXPONENTIATION];
    } else {
        arg = Blockly.Lua.valueToCode(block, 'NUM',
            Blockly.Lua.ORDER_NONE) || '0';
    }
    switch (operator) {
        case 'abs':
            code = 'math.abs(' + arg + ')';
            break;
        case 'floor':
            code = 'math.floor(' + arg + ')';
            break;
        case 'ceiling':
            code = 'math.ceil(' + arg + ')';
            break;
        case 'sqrt':
            code = 'math.sqrt(' + arg + ')';
            break;
        case 'sin':
            code = 'math.sin(math.rad(' + arg + '))';
            break;
        case 'cos':
            code = 'math.cos(math.rad(' + arg + '))';
            break;
        case 'tan':
            code = 'math.tan(math.rad(' + arg + '))';
            break;
        case 'asin':
            code = 'math.deg(math.asin(' + arg + '))';
            break;
        case 'acos':
            code = 'math.deg(math.acos(' + arg + '))';
            break;
        case 'atan':
            code = 'math.deg(math.atan(' + arg + '))';
            break;
        case 'ln':
            code = 'math.log(' + arg + ')';
            break;
        case 'log':
            code = 'math.log(' + arg + ', 10)';
            break;
        case 'e ^':
            code = 'math.exp(' + arg + ')';
            break;
    }
    return [code, Blockly.Lua.ORDER_HIGH];
}
/*
 * sensing
 * */

Blockly.Lua['sensing_touchingobject'] = blankfun

Blockly.Lua['sensing_touchingobjectmenu'] = blankfun

Blockly.Lua['sensing_touchingcolor'] = blankfun

Blockly.Lua['sensing_coloristouchingcolor'] = blankfun

Blockly.Lua['sensing_distanceto'] = blankfun

Blockly.Lua['sensing_distancetomenu'] = blankfun

Blockly.Lua['sensing_askandwait'] = blankfun

Blockly.Lua['sensing_answer'] = blankfun

Blockly.Lua['sensing_keypressed'] = blankfun

Blockly.Lua['sensing_keyoptions'] = blankfun

Blockly.Lua['sensing_mousedown'] = blankfun

Blockly.Lua['sensing_mousex'] = blankfun

Blockly.Lua['sensing_mousey'] = blankfun

Blockly.Lua['sensing_setdragmode'] = blankfun

Blockly.Lua['sensing_loudness'] = blankfun

Blockly.Lua['sensing_loud'] = blankfun

Blockly.Lua['sensing_timer'] = blankfun

Blockly.Lua['sensing_resettimer'] = blankfun

Blockly.Lua['sensing_of_object_menu'] = blankfun

Blockly.Lua['sensing_of'] = blankfun

Blockly.Lua['sensing_current'] = blankfun

Blockly.Lua['sensing_dayssince2000'] = blankfun

Blockly.Lua['sensing_username'] = blankfun

Blockly.Lua['sensing_userid'] = blankfun

/*
 * sound
 * */

Blockly.Lua['sound_sounds_menu'] = blankfun

Blockly.Lua['sound_play'] = blankfun

Blockly.Lua['sound_playuntildone'] = blankfun

Blockly.Lua['sound_stopallsounds'] = blankfun

Blockly.Lua['sound_seteffectto'] = blankfun

Blockly.Lua['sound_changeeffectby'] = blankfun

Blockly.Lua['sound_cleareffects'] = blankfun

Blockly.Lua['sound_changevolumeby'] = blankfun

Blockly.Lua['sound_setvolumeto'] = blankfun

Blockly.Lua['sound_volume'] = blankfun
/**
 * data
 */

 Blockly.Lua['data_variable'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var code = Blockly.Lua.variableDB_.getName(block.getFieldValue('VARIABLE'),
        Blockly.Variables.NAME_TYPE);
    return [code, Blockly.Lua.ORDER_ATOMIC];
}

Blockly.Lua['data_setvariableto'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var argument0 = Blockly.Lua.valueToCode(block, 'VALUE',
        Blockly.Lua.ORDER_NONE) || '0';
    var varName = Blockly.Lua.variableDB_.getName(
        block.getFieldValue('VARIABLE'), Blockly.Variables.NAME_TYPE);

    return varName + ' = ' + argument0 + '\n';
}

Blockly.Lua['data_changevariableby'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var argument0 = Blockly.Lua.valueToCode(block, 'VALUE',
        Blockly.Lua.ORDER_NONE) || '0';
    var varName = Blockly.Lua.variableDB_.getName(
        block.getFieldValue('VARIABLE'), Blockly.Variables.NAME_TYPE);
    return varName + ' += ' + argument0 + '\n';
}

Blockly.Lua['data_showvariable'] = blankfun

Blockly.Lua['data_hidevariable'] = blankfun

Blockly.Lua['data_listcontents'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var code = Blockly.Lua.variableDB_.getName(block.getFieldValue('LIST'),
        Blockly.Variables.NAME_TYPE);
    return [code, Blockly.Lua.ORDER_ATOMIC];
}

Blockly.Lua['data_listindexall'] = blankfun

Blockly.Lua['data_listindexrandom'] = blankfun

Blockly.Lua['data_addtolist'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var list = block.inputList[1].fieldRow[1].text_ || '{}';
    var value = Blockly.Lua.valueToCode(block, 'ITEM',
        Blockly.Lua.ORDER_NONE) || 'None';

    var code = 'table.insert(' + list + ', ' +
        '#' + list + ' + 1' +
        ', ' + value + ')';
    return code + '\n';
}

Blockly.Lua['data_deleteoflist'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var list = block.inputList[1].fieldRow[1].text_ || '{}';
    var at = Blockly.Lua.valueToCode(block, 'INDEX', Blockly.Lua.ORDER_NONE) || '1';
    var code = 'table.remove(' + list + ', ' + at + ')';
    return code + '\n';
}

Blockly.Lua['data_deletealloflist'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var list = block.inputList[0].fieldRow[1].text_ || '{}';
    var code = 'while #' + list + ' > 0 do table.remove(' + list + ', #' + list + ') end';
    return code + '\n';
}

Blockly.Lua['data_insertatlist'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var list = block.inputList[2].fieldRow[1].text_ || '{}';
    var at = Blockly.Lua.valueToCode(block, 'INDEX',
        Blockly.Lua.ORDER_ADDITIVE) || '1';
    var value = Blockly.Lua.valueToCode(block, 'ITEM',
        Blockly.Lua.ORDER_NONE) || 'None';
    var code = 'table.insert(' + list + ', ' +
        at + ', ' + value + ')';
    return code + '\n';
}

Blockly.Lua['data_replaceitemoflist'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var list = block.inputList[1].fieldRow[1].text_ || '{}';
    var at = Blockly.Lua.valueToCode(block, 'INDEX',
        Blockly.Lua.ORDER_ADDITIVE) || '1';
    var value = Blockly.Lua.valueToCode(block, 'ITEM',
        Blockly.Lua.ORDER_NONE) || 'None';
    return list + '[' + at + '] = ' + value + '\n';
}

Blockly.Lua['data_itemoflist'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    block_data_itemoflist = block;
    var list = block.inputList[1].fieldRow[1].text_ || '{}';
    var at = Blockly.Lua.valueToCode(block, 'INDEX', Blockly.Lua.ORDER_NONE) || '1';
    var code = list + '[' + at + ']';
    return [code, Blockly.Lua.ORDER_HIGH];
}

Blockly.Lua['data_itemnumoflist'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var list = block.inputList[1].fieldRow[1].text_ || '{}';
    var item = Blockly.Lua.valueToCode(block, 'ITEM',
        Blockly.Lua.ORDER_NONE) || '\'\'';
    var functionName = Blockly.Lua.provideFunction_(
        'first_index',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t, elem)',
            '  for k, v in ipairs(t) do',
            '    if v == elem then',
            '      return k',
            '    end',
            '  end',
            '  return 0',
            'end']);
    var code = functionName + '(' + list + ', ' + item + ')';
    return [code, Blockly.Lua.ORDER_HIGH];
}

Blockly.Lua['data_lengthoflist'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    // String or array length.
    var list = block.inputList[0].fieldRow[1].text_ || '{}';
    return ['#' + list, Blockly.Lua.ORDER_UNARY];
}

Blockly.Lua['data_listcontainsitem'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var list = block.inputList[0].fieldRow[0].text_ || '{}';
    var item = Blockly.Lua.valueToCode(block, 'ITEM',
        Blockly.Lua.ORDER_NONE) || '\'\'';
    var functionName = Blockly.Lua.provideFunction_(
        'list_contains_item',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t, elem)',
            '  for k, v in ipairs(t) do',
            '    if v == elem then',
            '      return true',
            '    end',
            '  end',
            '  return false',
            'end']);
    var code = functionName + '(' + list + ', ' + item + ')';
    return [code, Blockly.Lua.ORDER_RELATIONAL];
}

Blockly.Lua['data_showlist'] = blankfun

Blockly.Lua['data_hidelist'] = blankfun

/*
 * 基础块
 * */
Blockly.Lua['math_integer'] = function (block) {
    let order = code < 0 ? Blockly.Lua.ORDER_UNARY :
        Blockly.Lua.ORDER_ATOMIC;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
    return ['', order];
    window.GeneratedBlocks.push(block.id);

    var code = parseFloat(block.getFieldValue('NUM'));
    return [code, order];
}

Blockly.Lua['math_number'] = function (block) {
    let order = code < 0 ? Blockly.Lua.ORDER_UNARY :
        Blockly.Lua.ORDER_ATOMIC;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    var code = parseFloat(block.getFieldValue('NUM'));
    
    return [code, order];
}

Blockly.Lua['math_whole_number'] = function (block) {
    let order = Blockly.Lua.ORDER_ATOMIC;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    var code = parseInt(block.getFieldValue('NUM'));
    return [code, order];
}

Blockly.Lua['math_positive_number'] = function (block) {
    let order = Blockly.Lua.ORDER_ATOMIC;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', order];
    window.GeneratedBlocks.push(block.id);

    var code = parseFloat(block.getFieldValue('NUM'));
    return [code, order];
}

Blockly.Lua['text'] = function (block) {
    let order = Blockly.Lua.ORDER_ATOMIC;
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return [Blockly.Lua.quote_(''), order];
    window.GeneratedBlocks.push(block.id);

    let re = /^-?\d+[.]?\d*$/;
    let code = block.getFieldValue('TEXT');
    if (!code)
        return [Blockly.Lua.quote_(''), Blockly.Lua.ORDER_ATOMIC];
    if (re.test(code) === false)
        code = Blockly.Lua.quote_(code);
    return [code, order];
}
/**
 * procedures
 */

/**
 * 过程参数引用布尔值
 * @param {*} block 
 */
 Blockly.Lua['argument_reporter_boolean'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    let code = block.getFieldValue('VALUE');
    return [code, Blockly.Lua.ORDER_ATOMIC];
}

/**
 * 过程参数引用字符串或数字
 * @param {*} block 
 */
Blockly.Lua['argument_reporter_string_number'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    let code = block.getFieldValue('VALUE');
    return [code, Blockly.Lua.ORDER_ATOMIC];
}

/**
 * 过程参数列表
 * @param {*} block 
 */
Blockly.Lua['procedures_prototype'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    let code='', count=0;
    for(var param in block.displayNames_){
        if(count>0)
            code+=',';
        code+=param;
        count++;
    }
    return code;
}

/**
 * 定义过程
 * @param {*} block 
 */
Blockly.Lua['procedures_definition'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);


    let code='';
    let procname='proc'+btoa(unescape(encodeURIComponent(block.childBlocks_[0].procCode_))).replace(/\+/g,'').replace(/\//g,'').replace(/=/g,'');
    code+='function '+procname+'(';
    code+=block.childBlocks_[0].displayNames_.join(',');
    code+=')\n';
    if(block.childBlocks_.length>1){
        code+=Blockly.Lua.blockToCode(block.childBlocks_[1]);
    }
    code += 'end';
    Blockly.Lua.definitions_[procname] = code;
    return '';
}

/**
 * 调用过程
 * @param {*} block 
 */
Blockly.Lua['procedures_call'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    window.procedures_call=block;

    let code = '', procname, argumentCount;
    var ids=block.argumentIds_;
    procname='proc'+btoa(unescape(encodeURIComponent(block.procCode_))).replace(/\+/g,'').replace(/\//g,'').replace(/=/g,'');
    code+=procname+'(';
    argumentCount=0;
    ids.forEach(id=>{
        if(argumentCount>0)
            code+=',';
        code+='('+(Blockly.Lua.valueToCode(block, id, Blockly.Lua.ORDER_NONE) || '')+')';
        argumentCount++;
    });
    code+=')\n';
    return code;
}
/**
 * 彩灯接口菜单
 * @param {*} block 
 * @returns 
 */
 Blockly.Lua['robotmaster_menu_LIGHT'] =function (block) {
    let order = Blockly.Lua.ORDER_NONE;
    var arg0= block.getFieldValue('LIGHT');
    let code=arg0;
    return [code, order];
};

/**
 * 彩灯颜色菜单
 * @param {*} block 
 * @returns 
 */
 Blockly.Lua['robotmaster_menu_HUE'] =function (block) {
    let order = Blockly.Lua.ORDER_NONE;
    var arg0= block.getFieldValue('HUE');
    let code=arg0;
    return [code, order];
};

/**
 * 速度菜单
 * @param {*} block 
 * @returns 
 */
 Blockly.Lua['robotmaster_menu_SPEED'] =function (block) {
    let order = Blockly.Lua.ORDER_NONE;
    var arg0= block.getFieldValue('SPEED');
    let code=arg0;
    return [code, order];
};

/**
 * 电机接口菜单
 * @param {*} block 
 * @returns 
 */
 Blockly.Lua['robotmaster_menu_PORT'] =function (block) {
    let order = Blockly.Lua.ORDER_NONE;
    var arg0= block.getFieldValue('PORT');
    let code=arg0;
    return [code, order];
};

/**
 * 电机转动方向菜单
 * @param {*} block 
 * @returns 
 */
 Blockly.Lua['robotmaster_menu_DIRECTION'] =function (block) {
    let order = Blockly.Lua.ORDER_NONE;
    var arg0= block.getFieldValue('DIRECTION');
    let code=arg0;
    return [code, order];
};

/**
 * 陀螺仪倾斜菜单
 * @param {*} block 
 * @returns 
 */
 Blockly.Lua['robotmaster_menu_tiltDirectionAny'] =function (block) {
    let order = Blockly.Lua.ORDER_NONE;
    var arg0= block.getFieldValue('tiltDirectionAny');
    let code=arg0;
    return [code, order];
};

/**
 * 设置内置灯的颜色
 * @param {*} block 
 * @returns 
 */
Blockly.Lua['robotmaster_setLightHue'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var led;
    let order = Blockly.Lua.ORDER_NONE;
    let selled = Blockly.Lua.valueToCode(block, 'LIGHT', order) || 'ALLLIGHTS';
    switch (selled) {
        case "LIGHT1":
            led = "1";
            break;
        case "LIGHT2":
            led = "2";
            break;
        case "ALLLIGHTS":
            led = "0";
            break;
    }
    let color = Blockly.Lua.valueToCode(block, 'HUE', order) || '0';
    return 'L(' + led + ',' + color + ')\n';
};

/**
 * 关掉内置灯
 * @param {*} block 
 * @returns 
 */
Blockly.Lua['robotmaster_turnOffLight'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    var led;
    let order = Blockly.Lua.ORDER_NONE;
    let selled = Blockly.Lua.valueToCode(block, 'LIGHT', order) || 'ALLLIGHTS';
    switch (selled) {
        case "LIGHT1":
            led = "1";
            break;
        case "LIGHT2":
            led = "2";
            break;
        case "ALLLIGHTS":
            led = "0";
            break;
    }
    return 'L(' + led + ',0)\n';
};

/**
 * 设置内置电机的速度
 * @param {*} block 
 * @returns 
 */
Blockly.Lua['robotmaster_setMotorSpeedByNum'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    let code='';
    let order = Blockly.Lua.ORDER_NONE;
    let _maxSpeed=12;
    let speed=Number(Blockly.Lua.valueToCode(block, 'SPEED', order) || '0');
    speed=(speed<0)?0:speed;
    speed=(speed>_maxSpeed)?_maxSpeed:speed;
    var sign;
    let seldirection=Blockly.Lua.valueToCode(block, 'DIRECTION', order) || 'CLOCKWISE';
    switch (seldirection) {
        case "CLOCKWISE":
            sign = "1";
            break;
        case "ANTICLOCKWISE":
            sign = "-1";
            break;
    }
    let selport=Blockly.Lua.valueToCode(block, 'PORT', order) || 'ALLPORTS';
    switch (selport) {
        case "PORT1":
            code+='M(1,' + speed.toString() + ',' + sign + ')\n';
            break;
        case "PORT2":
            code+='M(2,' + speed.toString() + ',' + sign + ')\n';
            break;
        case "ALLPORTS":
            code+='M(1,' + speed.toString() + ',' + sign + ')\n';
            code+='M(2,' + speed.toString() + ',' + sign + ')\n';
            break;
    }
    return code;
};

/**
 * 停止内置电机
 * @param {*} block 
 * @returns 
 */
Blockly.Lua['robotmaster_stopMotor'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return '';
    window.GeneratedBlocks.push(block.id);

    let code='';
    let order = Blockly.Lua.ORDER_NONE;
    let selport=Blockly.Lua.valueToCode(block, 'PORT', order) || 'ALLPORTS';
    switch (selport) {
        case "PORT1":
            code+='MS(1)\n';
            break;
        case "PORT2":
            code+='MS(2)\n';
            break;
        case "ALLPORTS":
            code+='MS(1)\n';
            code+='MS(2)\n';
            break;
    }
    return code;
};

/**
 * 获取距离传感器1的值
 * @param {*} block 
 * @returns 
 */
Blockly.Lua['robotmaster_getDistance'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', Blockly.Lua.ORDER_NONE];
    window.GeneratedBlocks.push(block.id);

    let code = 'GD(1)';
    return [code, Blockly.Lua.ORDER_NONE];
};

/**
 * 获取距离传感器2的值
 * @param {*} block 
 * @returns 
 */
 Blockly.Lua['robotmaster_getDistance2'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', Blockly.Lua.ORDER_NONE];
    window.GeneratedBlocks.push(block.id);

    let code = 'GD(2)';
    return [code, Blockly.Lua.ORDER_NONE];
};

/**
 * 获取陀螺仪X轴角度的值
 * @param {*} block 
 * @returns 
 */
 Blockly.Lua['robotmaster_getGyroXaxisAngle'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', Blockly.Lua.ORDER_NONE];
    window.GeneratedBlocks.push(block.id);

    let code = 'RX()';
    return [code, Blockly.Lua.ORDER_NONE];
};

/**
 * 获取陀螺仪Y轴角度的值
 * @param {*} block 
 * @returns 
 */
 Blockly.Lua['robotmaster_getGyroYaxisAngle'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', Blockly.Lua.ORDER_NONE];
    window.GeneratedBlocks.push(block.id);

    let code = 'RY()';
    return [code, Blockly.Lua.ORDER_NONE];
};

/**
 * 获取陀螺仪加速度矢量和
 * @param {*} block 
 * @returns 
 */
 Blockly.Lua['robotmaster_getGyroSumAcceleration'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', Blockly.Lua.ORDER_NONE];
    window.GeneratedBlocks.push(block.id);

    let code = 'RA()';
    return [code, Blockly.Lua.ORDER_NONE];
};

/**
 * 当陀螺仪向某个方向倾斜
 */
Blockly.Lua['robotmaster_whenTilted'] = blankfun;

/**
 * 陀螺仪是否向某个方向倾斜
 * @param {*} block 
 * @returns 
 */
 Blockly.Lua['robotmaster_isTilted'] = function (block) {
    if(window.GeneratedBlocks&&window.GeneratedBlocks.includes(block.id))
        return ['', Blockly.Lua.ORDER_NONE];
    window.GeneratedBlocks.push(block.id);

    const TILT_THRESHOLD='15';
    let code = '';
    let order = Blockly.Lua.ORDER_NONE;
    let seldirection=Blockly.Lua.valueToCode(block, 'DIRECTION', order) || 'any';
    switch (seldirection) {
        case "front":
            code = "(RY()>="+TILT_THRESHOLD+')';
            break;
        case "back":
            code = "(RY()<=-"+TILT_THRESHOLD+')';
            break;
        case "left":
            code = "(RX()<=-"+TILT_THRESHOLD+')';
            break;
        case "right":
            code = "(RX()>="+TILT_THRESHOLD+')';
            break;
        case "any":
            code = "(math.abs(RX())>="+TILT_THRESHOLD+' or math.abs(RY())>='+TILT_THRESHOLD+')';
            break;
    }
    return [code, Blockly.Lua.ORDER_NONE];
}
/*
 * 输出生成lua代码
 * */
window.GenerateCode = () => {
    window.GeneratedBlocks=[];
    let code=Blockly.Lua.workspaceToCode(Blockly.getMainWorkspace());
    console.log(code);
    return code;
}

/*
 * 输出生成lua代码
 * */
window.GenerateLua = () => {
    window.GeneratedBlocks=[];
    let code=Blockly.Lua.workspaceToCode(Blockly.getMainWorkspace());
    console.log(code);
    return code;
}

/*
 * 生成lua代码并在机器人端运行
 * */
window.Run = () => {
    window.GeneratedBlocks=[];
    window.ExcuteProgram(Blockly.Lua.workspaceToCode(Blockly.getMainWorkspace()));
}

/**
 * 记录生成过代码的积木块ID
 */
window.GeneratedBlocks=[];