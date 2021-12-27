import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl} from 'react-intl';
import fileUploadIcon from '../components/action-menu/icon--file-upload.svg';
import addSoundFromRecordingIcon from '../components/asset-panel/record.png';
import surpriseIcon from '../components/action-menu/icon--surprise.svg';
import searchIcon from '../components/action-menu/icon--search.svg';
import styles from './sound-ctrl.css';


class SoundCtrl extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
        ]);

    }
    componentDidMount () {

    }
    componentWillUnmount () {

    }


    render () {
        return (
            <div>
                <div className={styles.title}>
                    你还没有声音呢!<br />
                    你可以点击下方按钮添加声音
                </div>
                <div className={styles.container}>
                    <div className={styles.iconContainer}>
                        <img
                            src={searchIcon}
                            alt=""
                            onClick={e => {
                                this.props.onClickSearch(e);
                            }}
                        />
                        <p>选择</p>
                    </div>
                    <div className={styles.iconContainer}>
                        <img
                            src={addSoundFromRecordingIcon}
                            alt=""
                            onClick={() => {
                                this.props.onClickRecord();
                            }}
                        />
                        <p>录制</p>
                    </div>
                    <div className={styles.iconContainer}>
                        <img
                            src={surpriseIcon}
                            alt=""
                            onClick={() => {
                                this.props.onClickRandom();
                            }}
                        />
                        <p>随机</p>
                    </div>
                    <div className={styles.iconContainer}>
                        <img
                            src={fileUploadIcon}
                            alt=""
                            onClick={() => {
                                this.props.onClickUploadClick();
                            }}
                        />
                        <p>上传</p>
                    </div>
                </div>


            </div>
        );
    }


}

SoundCtrl.propTypes = {
    onClickUploadClick: PropTypes.func.isRequired,
    onClickSearch: PropTypes.func.isRequired,
    onClickRandom: PropTypes.func.isRequired,
    onClickRecord: PropTypes.func.isRequired,
};

export default injectIntl(SoundCtrl);
