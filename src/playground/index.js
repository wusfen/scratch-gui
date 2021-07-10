import './ajax.config.js';
import './bridge.js';
import Dialog from '../components/dialog/index.jsx';

window.alert = Dialog.alert;
