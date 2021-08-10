/* eslint-disable */
//增加新积木块
export default function (Blockly){

    //进入下环节
    Blockly.Blocks['event_next_lesson'] = {
        /**
         * Block for when broadcast received.
         * @this Blockly.Block
         */
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
}