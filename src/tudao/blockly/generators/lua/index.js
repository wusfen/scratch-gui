/* eslint-disable valid-jsdoc */
import luaInit from './lua';
import base from './base';
import data from './data';
import controls from './controls';
import events from './events';
import looks from './looks';
import motions from './motions';
import operators from './operators';
import procedures from './procedures';
import sensing from './sensing';
import sound from './sound';
import robotmaster from './robotmaster';


const blankfun = block => {
    if (window.GeneratedBlocks && !window.GeneratedBlocks.includes(block.id)) {
        window.GeneratedBlocks.push(block.id);
    }
    return '';
};

// let blankvalfun = (block) => {
//     if(window.GeneratedBlocks&&!window.GeneratedBlocks.includes(block.id))
//         window.GeneratedBlocks.push(block.id);
//     return ['', Blockly.Lua.ORDER_NONE];
// }


export default function (Blockly){

    luaInit(Blockly);

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
            return `${branch + Blockly.Lua.INDENT}::continue::\n`;
        }
        return branch;

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
            return `#${listName} + 1 - ${opt_at}`;
        } else if (where == 'LAST') {
            return `#${listName}`;
        } else if (where == 'RANDOM') {
            return `math.random(#${listName})`;
        }
        return opt_at;

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
        const re = /^-?\d+[.]?\d*$/;
        var varmodels = Blockly.Variables.allUsedVarModels(Blockly.getMainWorkspace());
        const variables = window.ScratchGui.props.vm.runtime.getTargetForStage().variables;
        if (varmodels && varmodels.length > 0) {
            varmodels.forEach(ele => {
                // 变量定义并初始化
                var variable = variables[ele.getId()];
                if (variable.type === 'list') {
                    var elements = [];
                    variable.value.forEach(v => {
                        if (re.test(v) === false) {
                            elements.push(Blockly.Lua.quote_(v));
                        } else {
                            elements.push(v);
                        }
                    });
                    init += `\n${Blockly.Lua.variableDB_.getName(ele.name, Blockly.Variables.NAME_TYPE)}={${elements.join(', ')}}`;
                } else {
                    var v = variable.value;
                    init += `\n${Blockly.Lua.variableDB_.getName(ele.name, Blockly.Variables.NAME_TYPE)}=`;
                    if (re.test(v) === false) {
                        init += Blockly.Lua.quote_(v);
                    } else {
                        init += v;
                    }
                }
            });
        }
        return `${definitions.join('\n\n') + init}\n\n\n${code}`;
    };

    base(Blockly, blankfun);
    data(Blockly, blankfun);
    controls(Blockly, blankfun);
    events(Blockly, blankfun);
    looks(Blockly, blankfun);
    motions(Blockly, blankfun);
    operators(Blockly, blankfun);
    procedures(Blockly, blankfun);
    sensing(Blockly, blankfun);
    sound(Blockly, blankfun);
    robotmaster(Blockly, blankfun);

    /**
     * 记录生成过代码的积木块ID
     */
    window.GeneratedBlocks = [];

    window.scratchExtensions = {
        robotmaster: {
            session: null,
            repeatDelay: false,
        }
    };


    window.tudaoUploadCode = () => {
        window.GeneratedBlocks = [];
        window.scratchExtensions.robotmaster.session.uploadCode();
    };

}
