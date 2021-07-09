import './ajax.config.js';
import './bridge.js';
import Confirm from '../components/dialog/confirm/index.jsx';

window.alert = function (title) {
    Confirm.confirm({
        title,
    });
};
