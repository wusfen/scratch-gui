import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';

import {getEventXY} from '../../lib/touch-utils';

import styles from './styles.css';
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

            isShow: false,
            target: null
        };

        bindAll(this, [
            'pick',
            'update',
            'handleDown',
            'handleRotate',
            'handleResize',
            'handleMove',
            'handleUp',
        ]);

        // setTarget
        addEventListener('mousedown', e => setTimeout(_ => this.pick(e), 1), true);
        addEventListener('touchstart', e => setTimeout(_ => this.pick(e), 1), true);

        // TODO to canvas
        addEventListener('mousedown', this.handleDown);
        addEventListener('touchstart', this.handleDown);
        addEventListener('mousemove', this.handleMove);
        addEventListener('touchmove', this.handleMove);
        addEventListener('mouseup', this.handleUp);
        addEventListener('touchend', this.handleUp);

    }
    pick (e) {
        var state = this.state;
        if (state.isRotateDown) return;
        if (state.isResizeDown) return;

        this.setState({
            isShow: false,
            target: null,
        });

        // TODO window
        var vm = window.vm;
        this.renderer = vm.renderer;
        this.rect = vm.renderer.canvas.getBoundingClientRect();

        const {x, y} = getEventXY(e);
        const mousePosition = [x - this.rect.left, y - this.rect.top];
        const drawableId = this.renderer.pick(mousePosition[0], mousePosition[1]);
        if (drawableId === null) return;
        const targetId = vm.getTargetIdForDrawableId(drawableId);
        const target = vm.runtime.getTargetById(targetId);

        this.setState({
            target,
        });
    }
    // 舞台坐标转页面坐标
    getPos ({x, y}) {
        var STAGE_WIDTH = window.STAGE_WIDTH;
        var STAGE_HEIGHT = window.STAGE_HEIGHT;
        var STAGE_CSS_WIDTH = window.STAGE_CSS_WIDTH;
        var stageScale = STAGE_CSS_WIDTH / STAGE_WIDTH;
        this.canvasRect = this.state.target.renderer.canvas.getBoundingClientRect();

        return {
            x: this.canvasRect.x + (((STAGE_WIDTH / 2) + x) * stageScale),
            y: this.canvasRect.y + (((STAGE_HEIGHT / 2) - y) * stageScale),
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
    update (target = this.state.target) {


        if (!target?.isSprite()) {
            this.setState({
                isShow: false,
            });
            return;
        }
        var state = this.state;

        var targetDrawable = target.renderer._allDrawables[target.drawableID];
        var skin = targetDrawable._skin;

        this.setState({
            target
        });
        var xy = this.getPos(target);

        this.canvasRect = target.renderer.canvas.getBoundingClientRect();
        var STAGE_WIDTH = window.STAGE_WIDTH;
        var STAGE_CSS_WIDTH = window.STAGE_CSS_WIDTH;
        var stageScale = STAGE_CSS_WIDTH / STAGE_WIDTH;
        var rotationCenter = ({
            x: (skin.rotationCenter[0] * stageScale),
            y: (skin.rotationCenter[1] * stageScale),
        });

        this.setState({
            isShow: true,
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

        this.setState({
            downX: e.clientX,
            downY: e.clientY,
            downRotate: this.state.rotate,
            downSize: this.state.size,
        });
    }
    handleRotate (e) {
        var state = this.state;
        if (!state.target) return;
        if (!state.isRotateDown) return;

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
            {x: e.clientX, y: e.clientY},
        );
        if (e.clientX < state.x) {
            currentAngle = 360 - currentAngle;
        }

        var diffAngle = currentAngle - downAngle;
        var rotate = state.downRotate + diffAngle;

        // render
        this.state.target.setDirection(rotate);
        this.setState({
            isShow: true,
            rotate,
        });

    }
    handleResize (e) {
        var state = this.state;
        if (!state.target) return;
        if (!state.isResizeDown) return;

        var downDistance = this.getDistance(
            {x: state.x, y: state.y},
            {x: state.downX, y: state.downY},
        );
        var currentDistance = this.getDistance(
            {x: state.x, y: state.y},
            {x: e.clientX, y: e.clientY},
        );

        const size = state.downSize * (currentDistance / downDistance);

        // render
        this.state.target.setSize(size);
        this.setState({
            isShow: true,
            size,
        });
    }
    handleMove (e) {
        this.handleRotate(e);
        this.handleResize(e);
    }
    handleUp () {

        this.setState({
            isRotateDown: false,
            isResizeDown: false,
        });
        this.update();
    }
    render () {
        const {
            children,
            ...props
        } = this.props;

        const {
            isShow,
            ...state
        } = this.state;

        return (
            <div
                hidden={!(isShow)}
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
};

Component.create = function () {
    const el = document.createElement('div');
    document.body.appendChild(el);


    ReactDOM.render((
        <Component />
    ), el);

};


const mapStateToProps = state => ({
});
const mapDispatchToProps = () => ({
});

// export default connect(mapStateToProps, mapDispatchToProps)(Component);
// single
export default Component.create;
