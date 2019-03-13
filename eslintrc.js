module.exports = {
    //'extends': 'eslint:recommended',

    rules: {
        // 'array-bracket-spacing': ['error', 'never',{}],

        // treat var statements as if they were block scoped
        'block-scoped-var': 'error',

        'brace-style': 'error',
        'comma-dangle': ['error', 'never'],

        // specify the maximum cyclomatic complexity allowed in a program
        'complexity': ['warn', 12],

        // specify curly brace conventions for all control statements
        'curly': ['error', 'all'],

        // require default case in switch statements
        'default-case': 'error',

        // encourages use of dot notation whenever possible
        //'dot-notation': ['error', { allowKeywords: true }],

        // require the use of === and !==
        'eqeqeq': ['warn', 'always', { null: 'ignore' }],

        // make sure for-in loops have an if statement
        'guard-for-in': 'warn',

        'indent': ['error', 4, {'SwitchCase': 1}],

        // specify whether double or single quotes should be used in JSX attributes
        'jsx-quotes': ['off', 'prefer-double'],

        'keyword-spacing': ['error', { 'before': true, 'after': true }],

        'no-console': ['error', { allow: ['debug', 'warn', 'error'] }],

        'no-fallthrough': 'error',
        'no-unused-vars': 2,
        'no-dupe-args': 2,
        'no-dupe-keys': 2,
        'no-duplicate-case': 2,
        'no-empty': 'warn',
        'no-ex-assign': 2,
        'no-extra-semi': 2,
        'no-inner-declarations': [2,'both'],

        'no-mixed-spaces-and-tabs': 'error',
        'no-multiple-empty-lines': ['error', { 'max': 4 }],
        'no-trailing-spaces': 'error',

        'no-obj-calls': 2,
        'no-sparse-arrays': 2,
        'no-unreachable': 2,

        // specify whether double or single quotes should be used
        'quotes': ['error', 'single', { avoidEscape: true }],

        'semi-spacing': 2,
        'semi': [2, 'always'],

        'space-before-blocks': [2, 'always'],
        'space-before-function-paren': ['error', 'never'],
        'space-in-parens': ['error', 'never', {}],
        'key-spacing': ['error'],
        'space-infix-ops': [2, {'int32Hint': true}],

        'spaced-comment': ['warn', 'always'],

        'use-isnan': 2,

        // requires to declare all vars on top of their containing scope
        'vars-on-top': 'warn',
    }
}