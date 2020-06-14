module.exports = {
    root: true,
    env: {
        node: true,
        jest: true,
    },
    extends: ['xo-typescript', 'plugin:jest/style'], // 'plugin:jest/all'
    plugins: ['import'],
    rules: {
        'object-curly-spacing': ['error', 'always'],
        '@typescript-eslint/indent': ['error', 4, { SwitchCase: 1 }],
        'capitalized-comments': 0,
        'comma-dangle': ['error', 'always-multiline']
    }
};
