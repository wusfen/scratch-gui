/* eslint-disable */
import * as spine from '@esotericsoftware/spine-webgl';

const memoizedToString = (function () {
    /**
     * The maximum length of a chunk before encoding it into base64.
     *
     * 32766 is a multiple of 3 so btoa does not need to use padding characters
     * except for the final chunk where that is fine. 32766 is also close to
     * 32768 so it is close to a size an memory allocator would prefer.
     * @const {number}
     */
    const BTOA_CHUNK_MAX_LENGTH = 32766;

    /**
     * An array cache of bytes to characters.
     * @const {?Array.<string>}
     */
    let fromCharCode = null;

    return data => {
        if (typeof btoa === 'undefined') {
            // Use a library that does not need btoa to run.
            /* eslint-disable-next-line global-require */
            const base64js = require('base64-js');
            return base64js.fromByteArray(data);
        } 
        // Native btoa is faster than javascript translation. Use js to
        // create a "binary" string and btoa to encode it.
        if (fromCharCode === null) {
            // Cache the first 256 characters for input byte values.
            fromCharCode = new Array(256);
            for (let i = 0; i < 256; i++) {
                fromCharCode[i] = String.fromCharCode(i);
            }
        }

        const {length} = data;
        let s = '';
        // Iterate over chunks of the binary data.
        for (let i = 0, e = 0; i < length; i = e) {
            // Create small chunks to cause more small allocations and
            // less large allocations.
            e = Math.min(e + BTOA_CHUNK_MAX_LENGTH, length);
            let s_ = '';
            for (let j = i; j < e; j += 1) {
                s_ += fromCharCode[data[j]];
            }
            // Encode the latest chunk so the we create one big output
            // string instead of creating a big input string and then
            // one big output string.
            /* global btoa */
            s += btoa(s_);
        }
        return s;
        
    };
}());

const readZipPng = function (data, suc, err){
    if (typeof createImageBitmap !== 'undefined') {
        createImageBitmap(new Blob([data], {type: 'image/png'}))
            .then(bitmap => {
                if (bitmap) suc(bitmap);
            });
    } else {
        const image = new Image();
        image.onload = () => suc(image);
        image.onerror = () => err();
        image.src = `data:'image/png';base64,${memoizedToString(data)}`;
    }
};

export class SkelZipReader extends spine.Downloader {

    constructor (zip) {
        super();
        this._rawData = new Map();
        this._zip = zip;
    }

    downloadText (url, success, error) {
        if (this.start(url, success, error)) return;
        const cache = this._rawData.get(url);
        if (cache) {
            this.finish(url, 200, cache);
            return;
        }
        const file = this._zip.file(url);
        if (!file){
            this.finish(url, 400, "{msg:'no file'}");
        }
        file.async('string').then(text => {
            this._rawData.set(url, text);
            this.finish(url, 200, text);
        })
            .catch(e => {
                this.finish(url, 400, JSON.stringify(e));
            });
    }

    downloadBinary (url, success, error) {
        if (this.start(url, success, error)) return;
        const cache = this._rawData.get(url);
        if (cache) {
            this.finish(url, 200, cache);
            return;
        }
        const file = this._zip.file(url);
        if (!file){
            this.finish(url, 400, "{msg:'no file'}");
        }
        file.async('uint8array').then(data => {
            this._rawData.set(url, data);
            this.finish(url, 200, data);
        })
            .catch(e => {
                this.finish(url, 400, JSON.stringify(e));
            });
    }
}
export default class SkelAssetManager extends spine.AssetManagerBase {
    
    constructor (context, pathPrefix, zip) {
        super(image => {
            return new spine.GLTexture(context, image);
        }, pathPrefix, new SkelZipReader(zip));
        this._zip = zip;
    }

    loadTexture (path, success, error) {
        path = this.start(path);
        const cache = this.downloader._rawData.get(path);
        if (cache){
            readZipPng(cache, image => {
                this.success(success, path, this.textureLoader(image));
            }, e => this.error(error, path, `Couldn't load cache: ${path}`));
            return;
        }
        const file = this._zip.file(path);
        if (!file){
            this.error(error, path, `Couldn't load image: ${path}`);
        }
        file.async('uint8array').then(data => {
            readZipPng(data, image => {
                this.success(success, path, this.textureLoader(image));
            }, () => this.error(error, path, `Couldn't load image: ${path}`));
            this.downloader._rawData.set(path, data);
        })
            .catch(e => {
                this.error(error, path, `Couldn't load image: ${path}`);
            });
    }

    getCache (){
        return this.downloader._rawData;
    }
}


export {readZipPng};
