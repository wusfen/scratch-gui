/* eslint-disable no-use-before-define */
import './ajax.config.js';
import './bridge.js';
import Dialog from '../components/dialog/index.jsx';

window.alert = Dialog.alert;


// arrayBuffer polyfill
(function () {
    File.prototype.arrayBuffer =
                    File.prototype.arrayBuffer || myArrayBuffer;
    Blob.prototype.arrayBuffer =
                    Blob.prototype.arrayBuffer || myArrayBuffer;

    function myArrayBuffer () {
        var blob = this;
        return new Promise((resolve => {
            const fr = new FileReader();
            fr.onload = function (e) {
                resolve(fr.result);
            };
            fr.readAsArrayBuffer(blob);
        }));
    }
}());
