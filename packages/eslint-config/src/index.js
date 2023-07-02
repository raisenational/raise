/** @type { import('eslint').Linter.Config } */
module.exports = {
  extends: [
    'eslint-config-domdomegg',
    // "eslint-config-turbo",
    // "eslint-config-prettier"
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'axios',
            importNames: [
              'default',
              'axios',
            ],
            message: 'Use src/components/networking.ts instead',
          },
        ],
      },
    ],
    'import/prefer-default-export': ['off'],
    '@typescript-eslint/comma-dangle': ['off'],
  },
  overrides: [{
    files: ['serverless.ts'],
    rules: {
      // Need to use module.exports for https://github.com/serverless/serverless/issues/11039
      'import/no-import-module-exports': ['off'],
    },
  }],
};
