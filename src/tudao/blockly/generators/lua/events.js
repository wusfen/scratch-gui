/*
 * events
 * */
export default function (Blockly, blankfun){
    Blockly.Lua.event_whentouchingobject = blankfun;

    Blockly.Lua.event_touchingobjectmenu = blankfun;

    Blockly.Lua.event_whenflagclicked = blankfun;

    Blockly.Lua.event_whenthisspriteclicked = blankfun;

    Blockly.Lua.event_whenstageclicked = blankfun;

    Blockly.Lua.event_whenbroadcastreceived = blankfun;

    Blockly.Lua.event_whenbackdropswitchesto = blankfun;

    Blockly.Lua.event_whengreaterthan = blankfun;

    Blockly.Lua.event_broadcast_menu = blankfun;

    Blockly.Lua.event_broadcast = blankfun;

    Blockly.Lua.event_broadcastandwait = blankfun;

    Blockly.Lua.event_whenkeypressed = blankfun;
}
