/* eslint-disable no-invalid-this */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import styles from './styles.css';
import warn from '../../assets/icons/warn.svg';
const c = styles;
Object.assign(c, require('../../css/animate.css'));
class ErrorTips extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
        };

        bindAll(this, [
        ]);
    }
    componentDidMount () {

    }
    componentWillUnmount () {

    }

    render () {
        const {
            text,
            ...props
        } = this.props;

        const {
            isPlay,
            ...state
        } = this.state;
        return (
            <div className={c.errorTipsContainer}>
                <div className={c.imgContent}>
                    <img
                        src={warn}
                        alt="warn"
                    />
                </div>

                <div className={c.text}>
                    {text}
                </div>
            </div>
        );
    }
}

ErrorTips.propTypes = {
    text: PropTypes.string
};

const mapStateToProps = state => ({
});
const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(ErrorTips);
