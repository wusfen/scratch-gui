import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import VM from 'scratch-vm';

import {getEventXY} from '../../lib/touch-utils';
import {param} from '../../lib/param';

import styles from './styles.css';
import {getStageDimensions} from '../../lib/screen-utils';
const c = styles;

// single
class Component extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            x: 100,
            y: 100,
            rotate: 90,
            rotationCenterX: 0,
            rotationCenterY: 0,
            size: 100,
            width: 100,
            height: 100,

            isRotateDown: false,
            isResizeDown: false,
            downX: 0,
            downY: 0,
            downRotate: 90,
            downSize: 100,

            canvas: props.vm.renderer.canvas,
            target: null,

            isTeacherMode: param('mode') === 'teacher',
        };

        bindAll(this, [
            'pick',
            'show',
            'handleDown',
            'handleRotate',
            'handleResize',
            'handleMove',
            'handleUp',
        ]);

        // setTarget
        const canvas = this.state.canvas;
        canvas.addEventListener('mousedown', this.pick, true);
        canvas.addEventListener('touchstart', this.pick, true);
        addEventListener('mouseup', this.show);
        addEventListener('touchend', this.show);

        // down info
        addEventListener('mousedown', this.handleDown);
        addEventListener('touchstart', this.handleDown);

        // update
        addEventListener('mousemove', this.handleMove);
        addEventListener('touchmove', this.handleMove);

        // unset
        addEventListener('mouseup', this.handleUp);
        addEventListener('touchend', this.handleUp);

    }
    componentWillUnmount () {
        const canvas = this.state.canvas;
        canvas.removeEventListener('mousedown', this.pick, true);
        canvas.removeEventListener('touchstart', this.pick, true);
        removeEventListener('mouseup', this.show);
        removeEventListener('touchend', this.show);

        removeEventListener('mousedown', this.handleDown);
        removeEventListener('touchstart', this.handleDown);

        removeEventListener('mousemove', this.handleMove);
        removeEventListener('touchmove', this.handleMove);

        removeEventListener('mouseup', this.handleUp);
        removeEventListener('touchend', this.handleUp);
    }
    pick (e) {
        if (this.props.projectRunning) {
            this.setState({target: null});
            return;
        }

        const state = this.state;
        if (state.isRotateDown) return;
        if (state.isResizeDown) return;

        const vm = this.props.vm;
        this.renderer = vm.renderer;
        this.rect = vm.renderer.canvas.getBoundingClientRect();

        const {x, y} = getEventXY(e);
        const mousePosition = [x - this.rect.left, y - this.rect.top];
        const drawableId = this.renderer.pick(mousePosition[0], mousePosition[1]);
        const targetId = vm.getTargetIdForDrawableId(drawableId);
        let target = vm.runtime.getTargetById(targetId);

        var isSprite = target?.isSprite();
        var isHidden = !state.isTeacherMode && target?.getName().match(/^#.*\*$/);
        if (!isSprite || isHidden) {
            target = null;
        }

        // console.log('pick target:', target);
        this.setState({
            target,
        });
        this.show();
    }
    // 舞台坐标转页面坐标
    getPos ({x, y}, stageDimensions) {
        this.canvasRect = this.state.target.renderer.canvas.getBoundingClientRect();
        return {
            x: this.canvasRect.x + (stageDimensions.width / 2 + x * stageDimensions.scale),
            y: this.canvasRect.y + (stageDimensions.height / 2 - y * stageDimensions.scale),
        };
    }
    // 已知三点求角度
    getAngle (A, B, C) {
        var AB = Math.sqrt(Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2));
        var AC = Math.sqrt(Math.pow(A.x - C.x, 2) + Math.pow(A.y - C.y, 2));
        var BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
        var cosA = (Math.pow(AB, 2) + Math.pow(AC, 2) - Math.pow(BC, 2)) / (2 * AB * AC);
        var angleA = Math.round(Math.acos(cosA) * 180 / Math.PI);
        return angleA;
    }
    // 已知两点求距离
    getDistance (A, B) {
        return Math.sqrt(Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2));
    }
    show () {
        const state = this.state;
        const target = this.state.target;
        if (!target) {
            return;
        }

        var targetDrawable = target.renderer._allDrawables[target.drawableID];
        var skin = targetDrawable._skin;
        const stageDimensions = getStageDimensions(null, false);
        const stageScale = stageDimensions.scale;
        var xy = this.getPos(target, stageDimensions);

        this.canvasRect = target.renderer.canvas.getBoundingClientRect();
        var rotationCenter = ({
            x: (skin.rotationCenter[0] * stageScale),
            y: (skin.rotationCenter[1] * stageScale),
        });

        this.setState({
            ...xy,
            rotate: target.direction,
            rotationCenterX: rotationCenter.x,
            rotationCenterY: rotationCenter.y,
            size: target.size,
            width: skin.size[0] * stageScale,
            height: skin.size[1] * stageScale,
        });
    }
    handleDown (e) {
        var state = this.state;
        if (!state.target) return;
        if (!state.isRotateDown && !state.isResizeDown) return;

        var {x, y} = getEventXY(e);
        this.setState({
            downX: x,
            downY: y,
            downRotate: this.state.rotate,
            downSize: this.state.size,
        });
    }
    handleRotate (e) {
        var state = this.state;
        if (!state.target) return;
        if (!state.isRotateDown) return;
        var {x, y} = getEventXY(e);

        // 12点为0度
        var downAngle = this.getAngle(
            {x: state.x, y: state.y},
            {x: state.x, y: state.y - 100},
            {x: state.downX, y: state.downY},
        );
        // 在12点左侧，转为优角
        if (state.downX < state.x) {
            downAngle = 360 - downAngle;
        }

        var currentAngle = this.getAngle(
            {x: state.x, y: state.y},
            {x: state.x, y: state.y - 100},
            {x: x, y: y},
        );
        if (x < state.x) {
            currentAngle = 360 - currentAngle;
        }

        var diffAngle = currentAngle - downAngle;
        var rotate = state.downRotate + diffAngle;

        // render
        this.state.target.setDirection(rotate);
        this.setState({
            rotate,
        });

    }
    handleResize (e) {
        var state = this.state;
        if (!state.target) return;
        if (!state.isResizeDown) return;
        var {x, y} = getEventXY(e);

        var downDistance = this.getDistance(
            {x: state.x, y: state.y},
            {x: state.downX, y: state.downY},
        );
        var currentDistance = this.getDistance(
            {x: state.x, y: state.y},
            {x: x, y: y},
        );

        const size = state.downSize * (currentDistance / downDistance);

        // render
        this.state.target.setSize(size);
        this.setState({
            size,
        });
    }
    handleMove (e) {
        this.handleRotate(e);
        this.handleResize(e);
    }
    handleUp (e) {
        const state = this.state;

        if (e.target !== state.canvas && !(state.isResizeDown || state.isRotateDown)) {
            this.setState({
                target: null
            });
        }

        this.setState({
            isRotateDown: false,
            isResizeDown: false,
        });
    }
    render () {
        const {
            projectRunning,
            children,
            ...props
        } = this.props;

        const {
            target,
            ...state
        } = this.state;

        return (
            <div
                hidden={!(target && !projectRunning)}
                className={classNames(c.container)}
                style={{
                    left: state.x,
                    top: state.y,
                    width: state.width * (state.size / 100),
                    height: state.height * (state.size / 100),
                    transform: `rotate(${state.rotate - 90}deg) translate(-50%,-50%)`
                }}
            >
                <div
                    className={classNames(c.border)}
                    style={{
                        left: -state.rotationCenterX * (state.size / 100),
                        top: -state.rotationCenterY * (state.size / 100),
                    }}
                >
                    <b
                        className={`${c.rotate}`}
                        onMouseDown={e => this.setState({isRotateDown: true})}
                        onTouchStart={e => this.setState({isRotateDown: true})}
                    ></b>
                    <b
                        className={`${c.resize}`}
                        onMouseDown={e => this.setState({isResizeDown: true})}
                        onTouchStart={e => this.setState({isResizeDown: true})}
                    ></b>
                </div>
            </div>
        );
    }
}

Component.propTypes = {
    children: PropTypes.node,
    projectRunning: PropTypes.bool.isRequired,
    vm: PropTypes.instanceOf(VM).isRequired,
};


const mapStateToProps = state => ({
    projectRunning: state.scratchGui.vmStatus.running,
    vm: state.scratchGui.vm,
});
const mapDispatchToProps = () => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
