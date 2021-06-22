import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Box from '../box/box.jsx';
import Label from '../forms/label.jsx';
import Input from '../forms/input.jsx';
import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import DirectionPicker from '../../containers/direction-picker.jsx';

import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';

import { STAGE_DISPLAY_SIZES } from '../../lib/layout-constants.js';
import { isWideLocale } from '../../lib/locale-utils.js';

import styles from './sprite-info.css';
import Icon from '../../assets/icons/icon.jsx';

import xIcon from './X.svg';
import yIcon from './Y.svg';
import showIcon from './icon--show.svg';
import hideIcon from './icon--hide.svg';

import rotateIcon from './rotate.svg';

import isometricIcon from './isometric.svg';



const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
    spritePlaceholder: {
        id: 'gui.SpriteInfo.spritePlaceholder',
        defaultMessage: 'Name',
        description: 'Placeholder text for sprite name'
    }
});

class SpriteInfo extends React.Component {
    shouldComponentUpdate(nextProps) {
        return (
            this.props.rotationStyle !== nextProps.rotationStyle ||
            this.props.disabled !== nextProps.disabled ||
            this.props.name !== nextProps.name ||
            this.props.stageSize !== nextProps.stageSize ||
            this.props.visible !== nextProps.visible ||
            // Only update these if rounded value has changed
            Math.round(this.props.direction) !== Math.round(nextProps.direction) ||
            Math.round(this.props.size) !== Math.round(nextProps.size) ||
            Math.round(this.props.x) !== Math.round(nextProps.x) ||
            Math.round(this.props.y) !== Math.round(nextProps.y)
        );
    }
    render() {
        const {
            stageSize
        } = this.props;

        const sprite = (
            <FormattedMessage
                defaultMessage="Sprite"
                description="Sprite info label"
                id="gui.SpriteInfo.sprite"
            />
        );
        const showLabel = (
            <FormattedMessage
                defaultMessage="Show"
                description="Sprite info show label"
                id="gui.SpriteInfo.show"
            />
        );
        const sizeLabel = (
            <FormattedMessage
                defaultMessage="Size"
                description="Sprite info size label"
                id="gui.SpriteInfo.size"
            />
        );

        const labelAbove = isWideLocale(this.props.intl.locale);

        return (
            <Box className={styles.spriteInfo}>
                <div className={classNames(styles.row)}>
                    {/* 角色名 */}
                    <div className={styles.group}>
                        <Label
                            above={labelAbove}
                            // text={sprite}
                            text={this.props.name || ''}
                        >
                            <BufferedInput
                                hidden
                                className={classNames(
                                    styles.spriteInput,
                                    {
                                        [styles.columnInput]: labelAbove
                                    }
                                )}
                                disabled={this.props.disabled}
                                placeholder={this.props.intl.formatMessage(messages.spritePlaceholder)}
                                tabIndex="0"
                                type="text"
                                value={this.props.disabled ? '' : this.props.name}
                                onSubmit={this.props.onChangeName}
                            />
                        </Label>
                    </div>
                    {/* 显示 */}
                    {
                        this.props.visible ?
                            <b
                                className={classNames(styles.iconWrap)}
                                name="show"
                                onClick={this.props.onClickNotVisible}
                            >
                                <Icon name="show" />
                            </b> :
                            <b
                                className={classNames(styles.iconWrap)}
                                name="hide"
                                onClick={this.props.onClickVisible}
                            >
                                <Icon name="hide" />
                            </b>
                    }

                    <div
                        hidden
                        className={labelAbove ? styles.column : styles.group}
                    >
                        <div className={styles.radioWrapper}>
                            <div
                                className={classNames(
                                    styles.radio,
                                    styles.radioFirst,
                                    styles.iconWrapper,
                                    {
                                        [styles.isActive]: this.props.visible && !this.props.disabled,
                                        [styles.isDisabled]: this.props.disabled
                                    }
                                )}
                                tabIndex="0"
                                onClick={this.props.onClickVisible}
                                onKeyPress={this.props.onPressVisible}
                            >
                                <img
                                    className={styles.icon}
                                    src={showIcon}
                                />
                            </div>
                            <div
                                className={classNames(
                                    styles.radio,
                                    styles.radioLast,
                                    styles.iconWrapper,
                                    {
                                        [styles.isActive]: !this.props.visible && !this.props.disabled,
                                        [styles.isDisabled]: this.props.disabled
                                    }
                                )}
                                tabIndex="0"
                                onClick={this.props.onClickNotVisible}
                                onKeyPress={this.props.onPressNotVisible}
                            >
                                <img
                                    className={styles.icon}
                                    src={hideIcon}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={classNames(styles.row)}>
                    <div className={styles.group}>
                        <Label
                            above={labelAbove}
                            text=''
                        >
                            <img
                                className={styles.iconWrapperAbs}
                                src={xIcon}
                            />
                            <BufferedInput
                                disabled={this.props.disabled}
                                tabIndex="0"
                                type="text"
                                value={this.props.disabled ? '' : Math.round(this.props.x)}
                                onSubmit={this.props.onChangeX}
                            />
                        </Label>
                    </div>
                    <div className={classNames(styles.group)}>
                        <Label
                            secondary
                            above={labelAbove}
                            text=''
                        >
                            <img
                                className={styles.iconWrapperAbs}
                                src={isometricIcon}
                            />
                            <BufferedInput
                                disabled={this.props.disabled}
                                label={sizeLabel}
                                tabIndex="0"
                                type="text"
                                value={this.props.disabled ? '' : Math.round(this.props.size)}
                                onSubmit={this.props.onChangeSize}
                            />
                        </Label>
                    </div>
                </div>
                <div className={classNames(styles.row)}>
                    <div className={styles.group}>
                        <Label
                            above={labelAbove}
                            text=''
                        >
                            <img
                                className={styles.iconWrapperAbs}
                                src={yIcon}
                            />
                            <BufferedInput
                                disabled={this.props.disabled}
                                tabIndex="0"
                                type="text"
                                value={this.props.disabled ? '' : Math.round(this.props.y)}
                                onSubmit={this.props.onChangeY}
                            />
                        </Label>
                    </div>
                    <div className={classNames(styles.group)}>
                        <DirectionPicker
                            direction={Math.round(this.props.direction)}
                            disabled={this.props.disabled}
                            labelAbove={labelAbove}
                            rotationStyle={this.props.rotationStyle}
                            onChangeDirection={this.props.onChangeDirection}
                            onChangeRotationStyle={this.props.onChangeRotationStyle}
                        />
                    </div>
                </div>
            </Box>
        );
    }
}

SpriteInfo.propTypes = {
    direction: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    disabled: PropTypes.bool,
    intl: intlShape,
    name: PropTypes.string,
    onChangeDirection: PropTypes.func,
    onChangeName: PropTypes.func,
    onChangeRotationStyle: PropTypes.func,
    onChangeSize: PropTypes.func,
    onChangeX: PropTypes.func,
    onChangeY: PropTypes.func,
    onClickNotVisible: PropTypes.func,
    onClickVisible: PropTypes.func,
    onPressNotVisible: PropTypes.func,
    onPressVisible: PropTypes.func,
    rotationStyle: PropTypes.string,
    size: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    visible: PropTypes.bool,
    x: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    y: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ])
};

export default injectIntl(SpriteInfo);
