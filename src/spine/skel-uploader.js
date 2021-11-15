/* eslint-disable */
import * as spine from '@esotericsoftware/spine-webgl';
import SkelAssetManager, {readZipPng} from './SkelAssetManager';
import SkeletonSprite from './SkeletonSprite';
import {Blocks} from 'scratch-vm';
import {reject} from 'core-js/fn/promise';

const JSZip = require('jszip');

const createVMAsset = function (storage, assetType, dataFormat, data) {
    const asset = storage.createAsset(
        assetType,
        dataFormat,
        data,
        null,
        true // generate md5
    );

    return {
        name: null, // Needs to be set by caller
        dataFormat: dataFormat,
        asset: asset,
        md5: `${asset.assetId}.${dataFormat}`,
        assetId: asset.assetId,
        bitmapResolution: 2,
        rotationCenterX: 0,
        rotationCenterY: 0
    };
};


const parseSkelData = function (skelName, zip, gl, handleSucc, handleError){
    const assetManager = new SkelAssetManager(gl, '', zip);
    let mainFile = `${skelName}.skel`;
    let file = zip.file(mainFile);
    file = undefined;
    if (!file) {
        mainFile = `${skelName}.json`;
        file = zip.file(mainFile);
    } else {
        assetManager.loadBinary(mainFile, (path, binary) => {
            assetManager.loadTextureAtlas(`${skelName}.atlas`, (url, atlas) => {
                const atlasLoader = new spine.AtlasAttachmentLoader(atlas);
                const skeletonLoader = new spine.SkeletonBinary(atlasLoader);
                skeletonLoader.scale = 0.2;
                handleSucc(skeletonLoader.readSkeletonData(binary), assetManager.getCache());
            }, handleError);
        }, handleError);
    }
    if (!file){
        handleError('no skeleton file');
        return;
    }
    assetManager.loadText(mainFile, (path, text) => {
        assetManager.loadTextureAtlas(`${skelName}.atlas`, (url, atlas) => {
            const atlasLoader = new spine.AtlasAttachmentLoader(atlas);
            const skeletonLoader = new spine.SkeletonJson(atlasLoader);
            skeletonLoader.scale = 0.2;
            handleSucc(skeletonLoader.readSkeletonData(text), assetManager.getCache());
        }, handleError);
    }, handleError);
    
};

const parseRendedTarget = function (skelData, costumes, runtime, name, handleTarget, cacheData){
    const blocks = new Blocks(runtime);
    const sprite = new SkeletonSprite(blocks, runtime);
    sprite.setSkeletonData(skelData);
    sprite.costumes = costumes;
    sprite.name = name;
    sprite.cacheData = cacheData;
    const target = sprite.createClone('sprite');
    const skinId = runtime.renderer.createSkelSkin(skelData);
    for (let i = 0, l = costumes.length; i < l; i++) {
        costumes[i].skinId = skinId;
    }
    runtime.renderer.updateDrawableSkinId(target.drawableID, skinId);
    handleTarget(target);
};

const skeletonUpload = function (fileData, fileType, skelName, runtime, handleTarget, handleError = () => {}) {
    switch (fileType) {
    case '':
    case 'application/zip': {
        JSZip.loadAsync(fileData)
            .then(zip => {
                parseSkelData(skelName, zip, runtime.renderer.gl, (skelData, cacheData) => {
                    const title = zip.file(`${skelName}_title.png`);
                    if (title){
                        title.async('uint8array').then(fileData => {
                            const costumes = [];
                            let costume;
                            for (let i = 0, l = skelData.skins.length; i < l; i++) {
                                const name = skelData.skins[i].name;
                                costume = createVMAsset(runtime.storage, runtime.storage.AssetType.ImageBitmap, runtime.storage.DataFormat.PNG, fileData);
                                costume.name = name;
                                costumes.push(costume);
                            }                
                            parseRendedTarget(skelData, costumes, runtime, skelName, handleTarget, cacheData);
                        });
                    } else {
                        const costume = createVMAsset(runtime.storage, runtime.storage.AssetType.ImageBitmap, runtime.storage.DataFormat.PNG, '');
                        parseRendedTarget(skelData, [costume], runtime, skelName, handleTarget, cacheData);
                    }
                        
                }, handleError);
            })
            .catch(err => {
                handleError('no zip file');
            });
        return;
    }
    default: {
        handleError(`Encountered unexpected file type: ${fileType}`);
        return;
    }
    }
};


const deserializeSkeletonAsset = function (target, zip){
    return new Promise((resolve, reject) => {
        const sprite = target.sprite;
        const renderer = sprite.runtime.renderer;
        parseSkelData(sprite.name, zip, renderer.gl, (skelData, cacheData) => {
            sprite.setSkeletonData(skelData);
            const orgCostume = sprite.costumes[0];
            const newCostumes = [];
            const skinId = renderer.createSkelSkin(skelData);
            for (let i = 0, l = skelData.skins.length; i < l; i++) {
                const name = skelData.skins[i].name;
                const costume = {
                    name: name,
                    dataFormat: orgCostume.dataFormat,
                    asset: orgCostume.asset,
                    md5: orgCostume.md5,
                    assetId: orgCostume.assetId,
                    bitmapResolution: 2,
                    rotationCenterX: 0,
                    rotationCenterY: 0,
                    skinId: skinId
                };
                newCostumes.push(costume);
            }
            sprite.costumes = newCostumes;
            sprite.cacheData = cacheData;
            renderer.updateDrawableSkinId(target.drawableID, skinId);
            resolve(target);
        }, reject);

    });
};

export {
    skeletonUpload,
    deserializeSkeletonAsset
};
