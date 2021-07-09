import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import React from 'react';

import {setProjectChanged, setProjectUnchanged} from '../reducers/project-changed';
import {setProjectTitle} from '../reducers/project-title';


const MenuBarHOC = function (WrappedComponent) {
    class MenuBarContainer extends React.PureComponent {
        constructor (props) {
            super(props);

            bindAll(this, [
                'confirmReadyToReplaceProject',
                'shouldSaveBeforeTransition'
            ]);
        }
        confirmReadyToReplaceProject (message) {
            let readyToReplaceProject = true;
            if (this.props.projectChanged && !this.props.canCreateNew) {
                readyToReplaceProject = this.props.confirmWithMessage(message);
            }
            return readyToReplaceProject;
        }
        shouldSaveBeforeTransition () {
            return (this.props.canSave && this.props.projectChanged);
        }
        render () {
            const {
                /* eslint-disable no-unused-vars */
                projectChanged,
                /* eslint-enable no-unused-vars */
                ...props
            } = this.props;
            console.log('projectChanged:', projectChanged);
            return (<WrappedComponent
                confirmReadyToReplaceProject={this.confirmReadyToReplaceProject}
                shouldSaveBeforeTransition={this.shouldSaveBeforeTransition}
                projectChanged={projectChanged}
                {...props}
            />);
        }
    }

    MenuBarContainer.propTypes = {
        canCreateNew: PropTypes.bool,
        canSave: PropTypes.bool,
        confirmWithMessage: PropTypes.func,
        projectChanged: PropTypes.bool
    };
    MenuBarContainer.defaultProps = {
        // default to using standard js confirm
        confirmWithMessage: message => (confirm(message)) // eslint-disable-line no-alert
    };
    const mapStateToProps = state => ({
        projectChanged: state.scratchGui.projectChanged
    });
    const mapDispatchToProps = dispatch => ({
        onProjectSaved: data => {
            dispatch(setProjectUnchanged());
            return dispatch(setProjectTitle(data.title));
        },
    });
    // Allow incoming props to override redux-provided props. Used to mock in tests.
    const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign(
        {}, stateProps, dispatchProps, ownProps
    );
    return connect(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
    )(MenuBarContainer);
};

export default MenuBarHOC;
