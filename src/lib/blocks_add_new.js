/* eslint-disable */
//增加新积木块
export default function (Blockly){

    //进入下环节
    Blockly.Blocks['event_next_lesson'] = {
        init: function() {
          this.jsonInit({
            "id": "event_next_lesson",
            "message0": "请进入下环节",
            "args0": [
            ],
            "category": Blockly.Categories.event,
            "extensions": ["colours_event", "shape_statement"]
          });
        }
      };

      //隐藏积木块的积木块
      Blockly.Blocks['control_block_hide'] = {
        init: function() {
          this.jsonInit({
            "id": "control_block_hide",
            "message0": "隐藏积木代码",
            "args0": [
            ],
            "category": Blockly.Categories.control,
            "extensions": ["colours_control", "shape_statement"]
          });
        }
      };
}