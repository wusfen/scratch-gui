import React from 'react';
import PropTypes from 'prop-types';

const getIcon = name => require(`./${name}.svg`);

const Icon = props => (
    <img
        style={{
            width: '1em', height: '1em'
        }}
        src={getIcon(props.name)}
        {...props}
    />
);

Icon.propTypes = {
    name: PropTypes.string
};

export default Icon;
