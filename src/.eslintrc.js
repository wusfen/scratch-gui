const path = require('path');
module.exports = {
    root: true,
    extends: ['scratch', 'scratch/es6', 'scratch/react', 'plugin:import/errors'],
    env: {
        browser: true,
        node: true,
    },
    globals: {
        process: true,
        Blockly: true,
    },
    rules: {
        'import/no-mutable-exports': 'error',
        'import/no-commonjs': 'error',
        'import/no-amd': 'error',
        'import/no-nodejs-modules': 'error',
        'react/jsx-no-literals': 'error',
        'no-confusing-arrow': ['error', {
            'allowParens': true
        }],
        'no-console': 1,
        'no-unused-vars': 1,
        'no-prototype-builtins': 1,
        'comma-dangle': 0,
        'import/no-commonjs': 0,
        'no-alert': 1,
        'react/self-closing-comp': 0,
        'react/jsx-no-bind': 0,
        'react/jsx-no-literals': 0,
        'eqeqeq': 1,
        'no-dupe-keys': 1,
        'no-var': 0,
        'react/jsx-handler-names': 1,
        'no-unused-expressions': 0,
        'no-undefined': 1,
        'no-trailing-spaces': [1, {
            "skipBlankLines": false,
        }],
        'react/no-unused-prop-types': 1,
        'prefer-rest-params': 0,
        'require-jsdoc': 0,
        'func-style': 0,
        'camelcase': 1,
        'arrow-body-style': 0,
        'import/no-nodejs-modules': 1,
        'no-shadow': 1,
        'max-len': 1,
        'no-mixed-operators': 1,
        'no-debugger': 1,
        'no-negated-condition': 1,
    },
    settings: {
        react: {
            version: '16.2' // Prevent 16.3 lifecycle method errors
        },
        'import/resolver': {
            webpack: {
                config: path.resolve(__dirname, '../webpack.config.js')
            }
        }
    }
};
