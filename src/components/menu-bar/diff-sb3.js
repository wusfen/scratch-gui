import JSZip from 'jszip';


const serializeAssets = function (runtime, assetType, optTargetId) {
    const targets = optTargetId ? [runtime.getTargetById(optTargetId)] : runtime.targets;
    const assetDescs = [];
    for (let i = 0; i < targets.length; i++) {
        const currTarget = targets[i];
        const currAssets = currTarget.sprite[assetType];
        for (let j = 0; j < currAssets.length; j++) {
            const currAsset = currAssets[j];
            const asset = currAsset.asset;
            assetDescs.push({
                fileName: `${asset.assetId}.${asset.dataFormat}`,
                fileContent: asset.data});
        }
    }
    return assetDescs;
}

const serializeSounds = function (runtime, optTargetId) {
    return serializeAssets(runtime, 'sounds', optTargetId);
};

const serializeCostumes = function (runtime, optTargetId) {
    return serializeAssets(runtime, 'costumes', optTargetId);
};

function getContentById (id, descs) { // 根据id查找资源对象
    const arr = descs.filter(desc => {
        return desc.fileName.indexOf(id) !== -1;
    });
    return arr[0];
}

function comparisonSb3Json (originSb3List, soundDescsAndCostumeDescs) {
    const soundDescsAndCostumeDescsList = serializeSounds(window.vm.runtime).concat(serializeCostumes(window.vm.runtime));
    console.log('资源data------', soundDescsAndCostumeDescsList);
    const newSb3List = window.vm.runtime.targets.map(e => e.sprite).map(e => e.costumes_)
        .flat()
        .map(e => e.md5)
        .concat(window.vm.runtime.targets.map(e => e.sprite).map(e => e.sounds)
            .flat()
            .map(e => e.md5));
    
    console.log('originSb3List------', window.originSb3List);
    console.log('newSb3List------', newSb3List);
    const diff = newSb3List.filter(e => {
        return !originSb3List.find(o => e === o);
    });
    console.log('originSb3List newSb3List diff------', diff);
    diff.forEach(item => {
        const o = getContentById(item, soundDescsAndCostumeDescsList);
        o && soundDescsAndCostumeDescs.push(o);
    });
}

function saveProjectDifferenceSb3 (originSb3List) { // 保存新旧sb3的差异资源
    const soundDescsAndCostumeDescs = [];
    comparisonSb3Json(originSb3List, soundDescsAndCostumeDescs);
    console.log('新旧差异的资源------', soundDescsAndCostumeDescs);
    const projectJson = window.vm.toJSON();
    const zip = new JSZip();
    zip.file('project.json', projectJson);
    zip.file('originWorkPath', window._workInfo.workPath); // 将原始资源workPath写入zip中
    window.vm._addFileDescsToZip(soundDescsAndCostumeDescs, zip);
    return zip.generateAsync({
        type: 'blob',
        mimeType: 'application/x.scratch.sb3',
        compression: 'DEFLATE',
        compressionOptions: {
            level: 6 // Tradeoff between best speed (1) and best compression (9)
        }
    });
}

export default saveProjectDifferenceSb3;
