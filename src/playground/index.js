import './ajax.config.js';
import './bridge.js';
import './bi.js';
import Dialog from '../components/dialog/index.jsx';

window.alert = Dialog.alert;

addEventListener('blur', e => {
    if (/^(input)$/i.test(e.target?.tagName)) {
        document.documentElement.scrollTop++;
        document.documentElement.scrollTop--;
        document.body.scrollTop++;
        document.body.scrollTop--;
    }
}, true);
