import JSZip from 'jszip';
import {ajax} from './ajax.js';
import {param} from './param.js';

// TODO: sb3 内文件名必须是文件的 md5 ，如果不一致加载会找不到
// TODO: 选择本地文件

class Project {
    vm = null
    id = null
    idFile = null
    file = null
    originalFileURL = ''
    originalTargets = null

    /**
     * 获取拆分包
     * @returns {Promise<Blob>} blob
     */
    getSb3Diff () {
        var vm = this.vm;
        var runtime = vm.runtime;

        var zip = new JSZip();
        this.zip = zip;

        // project.json + _originalFileURL
        var json = vm.toJSON();
        json = JSON.parse(json);
        json._originalFileURL = this.originalFileURL;
        json = JSON.stringify(json);
        zip.file('project.json', json);

        // originList[]
        const originList = [];
        this.originalTargets.forEach(t => originList.push(...[...t.costumes, ...t.sounds]));
        console.info('[diff] originList:', originList);

        // [...] - originList[]
        vm.assets.forEach(asset => {
            if (!originList.find(e => e.assetId === asset.assetId)) {
                // console.info('[diff] +:', name, asset.assetId);

                zip.file(
                    `${asset.assetId}.${asset.dataFormat}`,
                    asset.data
                );
            }
        });

        console.log('[diff] zip:', zip);
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
     * @param {string} url url
     * @returns {Promise<ArrayBuffer>} arraybuffer
     */
    async loadProject (url) {
        const blob = await ajax.get(url, {}, {responseType: 'blob', base: ''});
        const zip = await JSZip.loadAsync(blob);
        let json = await zip.file('project.json').async('string');
        json = JSON.parse(json);
        console.log('zip:', zip);

        // original
        let originalZip = zip;
        this.originalFileURL = url;
        this.originalTargets = json.targets;

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

                this.originalFileURL = json._originalFileURL;
                this.originalTargets = originalJson.targets;
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

        if (/^file:\//.test(file) && path) {
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

export {
    project as default,
    project,
};

// dev
window.project = project;
