module.exports = {
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
};
