import JSZip from 'jszip';
import {ajax} from './ajax.js';
import {param} from './param.js';
// TODO: sb3 内文件名必须是文件的 md5 ，如果不一致加载会找不到
// TODO: 选择本地文件
import Dialog from './../components/dialog/index.jsx';
import createSpriteResizer from '../components/sprite-resizer/index.jsx';

let vm;

// WARNING: sb3 内文件名必须是文件的 md5 ，如果不一致加载会找不到

/**
 * single
 */
class Project {
    originalFileURL = '' // ?file=url || id=>url
    originalJson = {} // 最初的文件json
    jsonAddon = { // project.json +
        // 保存当前角色
        get _editingTargetName () {
            return vm.editingTarget.getName();
        }
    }

    /**
     * 获取拆分包
     * @returns {Promise<Blob>} blob
     */
    getSb3Diff () {
        var zip = new JSZip();
        this.zip = zip;

        // project.json + _originalFileURL
        this.jsonAddon._originalFileURL = this.originalFileURL;
        var json = vm.toJSON();
        zip.file('project.json', json);

        // originalAssets[]
        const originalAssets = [];
        this.originalJson.targets.forEach(t => originalAssets.push(...t.costumes, ...t.sounds));
        console.info('[diff] originalAssets:', originalAssets);

        // currentAssets[] - originalAssets[]
        vm.assets.forEach(asset => {
            if (!originalAssets.find(e => e.assetId === asset.assetId)) {
                // console.info('[diff] +:', name, asset.assetId);

                zip.file(
                    `${asset.assetId}.${asset.dataFormat}`,
                    asset.data
                );
            }
        });

        console.log('[diff] zip:', zip, {get json (){
            return JSON.parse(json);
        }});
        return zip.generateAsync({
            type: 'blob',
            mimeType: 'application/x.scratch.sb3diff',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 6 // Tradeoff between best speed (1) and best compression (9)
            }
        });
    }

    /**
     * 加载解析 sb3
     * @param {string|Blob|ArrayBuffer} file .sb3|.sb3diff
     * @returns {Promise<ArrayBuffer>} arrayBuffer
     */
    async getFullProjectArrayBuffer (file) {
        let blob = file;
        let url = '';
        if (typeof file === 'string') {
            url = file;
            blob = await ajax.get(url, {}, {responseType: 'blob', base: ''});
        }

        const zip = await JSZip.loadAsync(blob);
        let json = await zip.file('project.json').async('string');
        json = JSON.parse(json);
        console.log('zip:', zip, json);

        // original
        let originalZip = zip;
        this.originalFileURL = json._originalFileURL || this.originalFileURL;
        this.originalJson = json;

        // _originalFileURL
        if (json._originalFileURL) {
            let originalFile;

            // file:///
            // 在不同设备上提交和访问本地的路径可能是不一样
            if (/^file:\//.test(json._originalFileURL) && json._originalFileURL === param('file')) {
                originalFile = await new Promise((rs, rj) => {
                    ajax.get(json._originalFileURL, {}, {
                        responseType: 'blob',
                        base: '',
                        onload (res) {
                            rs(res);
                        },
                        onerror (){
                            rs();
                        }
                    });
                });
            }

            // online
            if (!originalFile) {
                const onlineOriginalFileURL = this.localFileToOnlineURL(json._originalFileURL);
                originalFile = await new Promise((rs, rj) => {
                    ajax.get(onlineOriginalFileURL, {}, {
                        responseType: 'blob',
                        base: '',
                        onload (res) {
                            rs(res);
                        },
                        onerror (){
                            console.error('[onlineOriginalFileURL]', onlineOriginalFileURL);
                            rs();
                        }
                    });
                });
            }

            if (originalFile) {
                originalZip = await JSZip.loadAsync(originalFile);
                let originalJson = await originalZip.file('project.json').async('string');
                originalJson = JSON.parse(originalJson);

                this.originalJson = originalJson;
            }
        }

        // 合并
        const finalZip = new JSZip();
        finalZip.files = {
            ...originalZip.files,
            ...zip.files,
        };
        this.finalZip = finalZip;

        console.log('finalZip:', finalZip);
        return finalZip.generateAsync({
            type: 'arraybuffer',
        });
    }

    async resetProjectByFileParam () {
        await Dialog.confirm({
            title: '重做确认',
            content: '将会清空当前作品记录，重新开始创作哦，是否确定重做？'
        });

        var file = param('file');
        const arrayBuffer = await this.getFullProjectArrayBuffer(file);

        vm.loadProject(arrayBuffer);
    }

    /**
     * file:///.../{WORK_CODE}/scratch/{FILE}.sb3
     *
     * https://oss.wit-learn.com/s/platform/interactive/common/interactiveTemplate/wdProj/moduleRelease/{WORK_CODE}/scratch/{FILE}.sb3
     * https://oss.iandcode.com/s/platform/interactive/common/interactiveTemplate/wdProj/moduleRelease/{WORK_CODE}/scratch/{FILE}.sb3
     *
     * @param {string} file file:///
     * @returns {string} url
     */
    localFileToOnlineURL (file) {
        var url = file;
        var path = file
            .replace(/[\\/]+/g, '/') // fuck //\\ => /
            .match(/[/][^/]+[/]scratch[/][^/]+$/)?.[0];

        if (path && !/^http/.test(file)) { // !(!file:///)
            if (param('base') === 'dev') {
                url = `https://oss.wit-learn.com/s/platform/interactive/common/interactiveTemplate/wdProj/moduleRelease${path}`;
            } else if (param('base') === 'uat') {
                url = `https://oss.wit-learn.com/s/platform/interactive/common/interactiveTemplate/wdProj/moduleRelease${path}`;
            } else {
                url = `https://oss.iandcode.com/s/platform/interactive/common/interactiveTemplate/wdProj/moduleRelease${path}`;
            }
        }

        return url;
    }

}

const project = new Project();

/**
 * inject: vm.toJSON, vm.loadProject
 * @param {VM} _vm vm
 */
function injectVm (_vm) {
    console.log('[injectVm]');
    vm = _vm;

    // TODO remove: src\lib\blocks_teacher_mode.js vm.toJSON
    // inject toJSON
    var toJSON = vm.toJSON;
    vm.toJSON = function () {
        var json = toJSON.apply(this, arguments);
        json = JSON.parse(json);

        json = {
            ...json,
            ...project.jsonAddon,
        };

        return JSON.stringify(json);
    };

    // inject loadProject
    vm._loadProject = vm.loadProject;
    vm.loadProject = async function (arrayBuffer) {
        console.log('[injectVm] vm.loadProject');
        const fullArrayBuffer = await project.getFullProjectArrayBuffer(arrayBuffer);
        return vm._loadProject(fullArrayBuffer);
    };


    vm.runtime.on(vm.runtime.constructor.PROJECT_LOADED, e => {
        console.log('PROJECT_LOADED', project.originalJson);

        // 默认选中保存时选中的角色
        var _editingTarget = vm.runtime.targets.find(e => e.sprite.name === project.originalJson._editingTargetName);
        vm.setEditingTarget(_editingTarget?.id);
    });

    // SpriteResizer
    createSpriteResizer();
}

export {
    project as default,
    project,
    injectVm,
};

// dev
window.project = project;
