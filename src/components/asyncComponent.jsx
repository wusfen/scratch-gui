import React from 'react';

const asyncComponent = componentPromise => class AsyncComponentInner extends React.Component {
    constructor () {
        super();
        this.state = {
            component: null
        };
    }
    componentDidMount () {
        componentPromise().then(module => {
            this.setState({
                component: module.default
            });
        });
    }
    render () {
        const Component = this.state.component;
        return Component ? <Component {...this.props} /> : 'loading...';
    }
};

export default asyncComponent;
