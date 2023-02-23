module.exports = {
  extends: [
    'eslint-config-domdomegg',
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
  },
};
