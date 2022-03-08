window.Extensions = {
    robotmaster: {
        connection: null,
        defaultCharacteristicId: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
        defaultServiceId: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
        isModular: false,
        isSupportInfrared: false,
        isSupportMultiFile: false,
        repeatDelay: false,
        title: 'RobotMaster（机器人大师）',
        writeable: true
    }
};
var _selectedExtension;

/**
 * 上传代码到机器人
 */
window.UploadCode = function (){
    // 弹出设备选择
    dialogSelectExtensionInit();
    $('#dialogSelectExtension').dialog({
        width: 400
    });
};

/**
 * 选择设备扩展对话框初始化
 */
const dialogSelectExtensionInit = () => {
    const root = $('#dialogSelectExtension>div.controlgroup-vertical');

    // 清除已有的选项
    root.empty();

    // 增加已连接的选项
    for (var key in window.Extensions){
        if (!window.Extensions[key].writeable || // 不可写入
            !window.Extensions[key].connection || // 没有连接
            !window.Extensions[key].connection.isConnected() // 未连接
        ){
            continue;
        }
        root.append(`<label for="RadioSelectExtension${key}">${window.Extensions[key].title}</label>`);
        root.append(`<input type="radio" id="RadioSelectExtension${key}" onclick="ExtensionItemOnClick('${key}');">`);
    }

    $('#dialogSelectExtension>div.controlgroup-vertical').controlgroup({
        direction: 'vertical'
    });
};

/**
 * 扩展选项被点击时执行的函数
 * @param {string} extensionId
 */
window.ExtensionItemOnClick = extensionId => {
    $('#dialogSelectExtension').dialog('close');

    if (!window.Extensions[extensionId].connection ||
        !window.Extensions[extensionId].connection.isConnected()){
        alert('所选设备未连接');
        return;
    }

    writeFile(extensionId, 0);
};

/**
 * 写入文件
 * @param {string} extensionId 扩展编号
 * @param {number} fileno 写入的文件序号
 */
const writeFile = (extensionId, fileno) => {
    window.RepeatDelay = window.Extensions[extensionId].repeatDelay;

    const pg = window.GenerateLua();

    var content = (new TextEncoder()).encode(pg);
    if (content.length > (256 * 256)) {
        alert('离线程序过大，无法传入机器人！');
        return;
    }

    /**
     * 写入报文
     * @param {*} message
     * @param {*} encoding
     */
    const writeMsg = (message, encoding = null) => {
        const serviceId = window.Extensions[extensionId].defaultServiceId;
        const characteristicId = window.Extensions[extensionId].defaultCharacteristicId;
        window.Extensions[extensionId].connection.write(serviceId, characteristicId, message, encoding);
    };

    var queue = [];
    // 写入下载模式帧
    if (['robotmaster'].includes(extensionId)){
        queue.push(...[0xFF, 0xFE, 0x09, 0x02,
            Math.floor(content.length / 256), Math.floor(content.length % 256),
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFD, 0xFC]);
    }
    if (queue.length == 0){
        return;
    }

    console.log(`写入下载模式帧:${JSON.stringify(queue)}`);
    const message = btoa(String.fromCharCode.apply(null, queue));
    writeMsg(message, 'base64');

    // 写入程序文本
    var buf;
    var offset = 0;
    const _frame_length = 14;
    queue = [];

    setTimeout(() => {
        while (offset < content.length) {
            if ((content.length - offset) <= _frame_length) { // 最后一帧
                buf = content.slice(offset, content.length);
                setTimeout(() => {
                    alert('上传完毕');
                }, 2000);
            } else {
                buf = content.slice(offset, offset + _frame_length);
            }
            offset += _frame_length;

            // 发出
            const message = btoa(String.fromCharCode.apply(null, buf));
            writeMsg(message, 'base64');
        }
    }, 1500);

};
