/*
 * looks
 * */
export default function (Blockly, blankfun){
    Blockly.Lua.looks_sayforsecs = blankfun;

    Blockly.Lua.looks_say = function (block) {
        if (window.GeneratedBlocks && window.GeneratedBlocks.includes(block.id)) {
            return '';
        }
        window.GeneratedBlocks.push(block.id);

        var msg = Blockly.Lua.valueToCode(block, 'MESSAGE',
            Blockly.Lua.ORDER_NONE) || '\'\'';
        return `print(${msg})\n`;
    };

    Blockly.Lua.looks_thinkforsecs = blankfun;

    Blockly.Lua.looks_think = blankfun;

    Blockly.Lua.looks_show = blankfun;

    Blockly.Lua.looks_hide = blankfun;

    Blockly.Lua.looks_hideallsprites = blankfun;

    Blockly.Lua.looks_changeeffectby = blankfun;

    Blockly.Lua.looks_seteffectto = blankfun;

    Blockly.Lua.looks_cleargraphiceffects = blankfun;

    Blockly.Lua.looks_changesizeby = blankfun;

    Blockly.Lua.looks_setsizeto = blankfun;

    Blockly.Lua.looks_size = blankfun;

    Blockly.Lua.looks_changestretchby = blankfun;

    Blockly.Lua.looks_setstretchto = blankfun;

    Blockly.Lua.looks_costume = blankfun;

    Blockly.Lua.looks_switchcostumeto = blankfun;

    Blockly.Lua.looks_nextcostume = blankfun;

    Blockly.Lua.looks_switchbackdropto = blankfun;

    Blockly.Lua.looks_backdrops = blankfun;

    Blockly.Lua.looks_gotofrontback = blankfun;

    Blockly.Lua.looks_goforwardbackwardlayers = blankfun;

    Blockly.Lua.looks_backdropnumbername = blankfun;

    Blockly.Lua.looks_costumenumbername = blankfun;

    Blockly.Lua.looks_switchbackdroptoandwait = blankfun;

    Blockly.Lua.looks_nextbackdrop = blankfun;

}
