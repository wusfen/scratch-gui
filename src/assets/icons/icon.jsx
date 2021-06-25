import React from 'react';
import PropTypes from 'prop-types';
import c from './icon.css';

const getIcon = name => require(`./${name}.svg`);

const Icon = props => (
    <img
        className={`${c.iIcon}`}
        src={getIcon(props.name)}
        {...props}
    />
);

Icon.propTypes = {
    name: PropTypes.string
};

export default Icon;
