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

      Blockly.Blocks['looks_switchanimationto'] = {
        /**
         * 切换spine动画积木
         * 
         */
        init: function() {
          this.jsonInit({
            "message0": "换成 %1 动效",
            "args0": [
              {
                "type": "input_value",
                "name": "ANIMATION",
              }
            ],
            "category": Blockly.Categories.looks,
            "extensions": ["colours_looks", "shape_statement"]
          });
        }
      };

      Blockly.Blocks['looks_animation'] = {
        /**
         * spine drop-down menu.
         * 
         */
        init: function() {
          this.jsonInit({
              message0: '%1',
              args0: [
                  {
                      type: 'field_dropdown',
                      name: 'ANIMATION',
                      options: animationMenu
                  }
              ],
              inputsInline: true,
              output: 'String',
              colour: Blockly.Colours.looks.secondary,
              colourSecondary: Blockly.Colours.looks.secondary,
              colourTertiary: Blockly.Colours.looks.tertiary,
              outputShape: Blockly.OUTPUT_SHAPE_ROUND
          });
        }
      };

    const animationMenu = function () {
      if (vm.editingTarget && vm.editingTarget.getAnimations().length > 0) {
          return vm.editingTarget.getAnimations().map(anim => [anim.name, anim.name]);
      }
      return [['', '']];
    };

    Blockly.Blocks['looks_nextanimation'] = {
      /**
       * spine 下一个动效
       * 
       */
      init: function() {
        this.jsonInit({
          "message0": "下一个动效",
          "category": Blockly.Categories.looks,
          "extensions": ["colours_looks", "shape_statement"]
        });
      }
    };
}