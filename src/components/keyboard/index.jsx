import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import VM from 'scratch-vm';
import {connect} from 'react-redux';

import styles from './styles.css';
const c = styles;

class Component extends React.Component{
    constructor (props) {
        super(props);

        this.state = {
            isShow: !false,
            keys: [],
            sortKeys: []
        };
        this.arrowRef = React.createRef();

        bindAll(this, [
            'handleMouseDown',
            'handleMouseUp',
            'handleClick',
            'handleArrowStart',
            'handleArrowMove',
            'handleArrowEnd',
        ]);
    }
    getKeys () {
        const vm = this.props.vm;
        let keys = [];

        vm.runtime.targets.forEach(e => {
            for (const id in e.blocks._blocks) {
                const KEY_OPTION = e.blocks._blocks[id].fields.KEY_OPTION;
                if (KEY_OPTION) {
                    const key = KEY_OPTION.value;
                    keys.push(key);
                }
            }
        });

        keys = [...new Set(keys)];
        return keys;
    }

    getSortKeys () {
        const vm = this.props.vm;
        let keys = [];
        const letterArr = [];
        const numberArr = [];
        const spaceArr = [];
        const freeArr = [];

        vm.runtime.targets.forEach(e => {
            for (const id in e.blocks._blocks) {
                const KEY_OPTION = e.blocks._blocks[id].fields.KEY_OPTION;
                if (KEY_OPTION) {
                    const key = KEY_OPTION.value;
                    if (!key.includes('arrow')){
                        if (key === 'any'){
                            freeArr.push(key);
                        }
                        if (key === 'space'){
                            spaceArr.push(key);
                        }
                        if ((typeof key === 'string') &&
                         (key !== 'space' && key !== 'any') &&
                         (Number(key) !== parseFloat(key))){
                            letterArr.push(key);
                        }
                        if (Number(key) === parseFloat(key)){
                            numberArr.push(Number(key));
                        }
                    }
                }
            }
        });
        letterArr.sort();
        numberArr.sort();
        keys = [...freeArr, ...spaceArr, ...letterArr, ...numberArr];
        keys = [...new Set(keys)];
        keys = keys.splice(0, 8);
        return keys;
    }

    toShowKey (key) {
        return {
            'any': '任意',
            'space': '空格',
            'up arrow': '↑',
            'down arrow': '↓',
            'left arrow': '←',
            'right arrow': '→',
        }[key] || key;
    }
    toEventKey (name) {
        return {
            'any': 'a',
            'space': ' ',
            'up arrow': 'ArrowUp',
            'down arrow': 'ArrowDown',
            'left arrow': 'ArrowLeft',
            'right arrow': 'ArrowRight',
            '任意': 'a',
            '空格': ' ',
            '↑': 'ArrowUp',
            '↓': 'ArrowDown',
            '←': 'ArrowLeft',
            '→': 'ArrowRight',
        }[name] || name;
    }
    handleArrowStart () {
        // eslint-disable-next-line no-warning-comments
        // TODO
    }
    handleArrowMove (){}
    handleArrowEnd (){}
    handleMouseDown (e) {
        e.target.blur();
        // e.preventDefault();

        const name = e.target.innerHTML.trim();
        const key = this.toEventKey(name);
        // console.log('handleMouseDown:', name, key, e);

        // down
        const keydownEvent = new Event('keydown');
        keydownEvent.key = key;
        setTimeout(() => {
            document.dispatchEvent(keydownEvent);
        }, 0);
    }
    handleMouseUp (e) {
        e.target.blur();
        // e.preventDefault();

        const name = e.target.innerHTML.trim();
        const key = this.toEventKey(name);
        // console.log('handleMouseUp:', name, key, e);

        // up
        const keyupEvent = new Event('keyup');
        keyupEvent.key = key;
        setTimeout(() => {
            document.dispatchEvent(keyupEvent);
        }, 4 + 11);
    }
    handleClick (e) {
        const target = e.target; // keep
        e = {
            target,
            key: e.key,
        };

        this.handleMouseDown(e);
        setTimeout(() => {
            e.target = target;
            this.handleMouseUp(e);
        }, 16);
    }
    render () {
        const {
            projectRunning,
            // eslint-disable-next-line no-unused-vars
            children,
            isPlayerOnly,
            // eslint-disable-next-line no-unused-vars
            ...props
        } = this.props;

        let {
            // eslint-disable-next-line no-unused-vars
            isShow,
            keys,
            sortKeys,
            // eslint-disable-next-line no-unused-vars
            ...state
        } = this.state;
        keys = this.getKeys();
        sortKeys = this.getSortKeys();
        var hasArrow = keys.join().match(/arrow/i);

        return (
            <div
                hidden={!(projectRunning && keys.length)}
                className={classNames(
                    styles.container,
                    isPlayerOnly ?
                        styles.isPlayerOnly : styles.commonContainer
                )}
                onTouchEnd={e => e.preventDefault()}
                onContextMenu={e => e.preventDefault()}
            >
                <div
                    hidden={!(hasArrow)}
                    className={`${c.direction}`}
                    ref={this.arrowRef}
                    onTouchStart={this.handleArrowStart}
                    onTouchMove={this.handleArrowMove}
                    onTouchEnd={this.handleArrowEnd}
                >
                    <button
                        type="button"
                        className={`${c.arrow} ${c.up}`}
                        onMouseDown={this.handleMouseDown}
                        onMouseUp={this.handleMouseUp}
                        onTouchStart={this.handleMouseDown}
                        onTouchEnd={this.handleMouseUp}
                    >ArrowUp</button>
                    <button
                        type="button"
                        className={`${c.arrow} ${c.down}`}
                        onMouseDown={this.handleMouseDown}
                        onMouseUp={this.handleMouseUp}
                        onTouchStart={this.handleMouseDown}
                        onTouchEnd={this.handleMouseUp}
                    >ArrowDown</button>
                    <button
                        type="button"
                        className={`${c.arrow} ${c.left}`}
                        onMouseDown={this.handleMouseDown}
                        onMouseUp={this.handleMouseUp}
                        onTouchStart={this.handleMouseDown}
                        onTouchEnd={this.handleMouseUp}
                    >ArrowLeft</button>
                    <button
                        type="button"
                        className={`${c.arrow} ${c.right}`}
                        onMouseDown={this.handleMouseDown}
                        onMouseUp={this.handleMouseUp}
                        onTouchStart={this.handleMouseDown}
                        onTouchEnd={this.handleMouseUp}
                    >ArrowRight</button>
                    <button
                        type="button"
                        className={`${c.arrow} ${c.center}`}
                        onMouseDown={this.handleMouseDown}
                        onMouseUp={this.handleMouseUp}
                        onTouchStart={this.handleMouseDown}
                        onTouchEnd={this.handleMouseUp}
                    >center</button>
                </div>

                <div className={`${c.keys}`} >
                    {sortKeys.map((e, i) => (
                        <button
                            // hidden={/arrow/.test(e)}
                            key={i}
                            type="button"
                            className={`${c.key}`}
                            onMouseDown={this.handleMouseDown}
                            onMouseUp={this.handleMouseUp}
                            onTouchStart={this.handleMouseDown}
                            onTouchEnd={this.handleMouseUp}
                        >{this.toShowKey(e)}</button>
                    ))}

                </div>
            </div>
        );
    }
}

Component.propTypes = {
    children: PropTypes.node,
    projectRunning: PropTypes.bool,
    isPlayerOnly: PropTypes.bool,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({
    projectRunning: state.scratchGui.vmStatus.running,
});
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
