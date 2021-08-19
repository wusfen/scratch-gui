import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import {setUploadingProgress} from '../../reducers/uploading';

import styles from './styles.css';
const c = styles;

class Component extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
        };

        bindAll(this, [
        ]);
    }
    render () {
        const {
            children,
            ...props
        } = this.props;

        const {
            ...state
        } = this.state;

        return (
            <div
                hidden={!(props.progress)}
                className={classNames(c.overlay)}
            >
                <main className={classNames(c.container)}>
                    <button onClick={e => props.setUploadingProgress(0)}>x</button>
                    <img src={require('../submit-result-dialog/img/ing.png')} />
                    <h2>作业提交中···</h2>
                    <p>
                        <span style={{width: `${props.progress}%`}}>
                            <em>{props.progress}%</em>
                        </span>
                    </p>
                    <h3>{props.text || '正在上传作品···'}</h3>
                </main>
            </div>
        );
    }
}

Component.propTypes = {
    children: PropTypes.node,
    progress: PropTypes.number,
    text: PropTypes.string,
};

const mapStateToProps = state => ({
    progress: state.scratchGui.uploading.progress,
    text: state.scratchGui.uploading.text,
});

const mapDispatchToProps = dispatch => ({
    setUploadingProgress: (progress, text) => dispatch(setUploadingProgress(progress, text))
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
