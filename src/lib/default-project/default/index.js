/* eslint-disable import/no-unresolved */
import backdrop from '!arraybuffer-loader!./24fe9783e4d7b367c4100bc4472a8d9b.jpg';
import json from './project.json';

const defaultProject = translator => [{
    id: 0,
    assetType: 'Project',
    dataFormat: 'JSON',
    data: JSON.stringify(json)
}, {
    id: '24fe9783e4d7b367c4100bc4472a8d9b',
    assetType: 'ImageVector',
    dataFormat: 'JPG',
    data: new Uint8Array(backdrop)
}];

export default defaultProject;
