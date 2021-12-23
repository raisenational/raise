module.exports = {
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint-config-blvd"
  ],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json",
    "tsconfigRootDir": __dirname,
  },
  "ignorePatterns": "local/**",
  "rules": {
    "max-len": "off",
    "indent": "off",
    "object-curly-newline": "warn",
    "quotes": [
      "warn",
      "double"
    ],
    "no-plusplus": [
      "warn",
      {
        "allowForLoopAfterthoughts": true
      }
    ],
    "semi": [
      "warn",
      "never"
    ],
    "comma-dangle": [
      "warn",
      "always-multiline"
    ],
    "no-restricted-imports": [
      "error",
      {
        "paths": [
          {
            "name": "@aws-sdk/client-dynamodb",
            "message": "Use @aws-sdk/lib-dynamodb instead"
          },
          {
            "name": "@aws-sdk/lib-dynamodb",
            "importNames": [
              "DynamoDBDocumentClient"
            ],
            "message": "Use src/helpers/documentClient.ts instead"
          },
          {
            "name": "process",
            "importNames": [
              "env"
            ],
            "message": "Use src/env/env.ts instead"
          }
        ]
      }
    ],
    "import/prefer-default-export": "off",
    "comma-spacing": "off",
    "@typescript-eslint/comma-spacing": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/member-delimiter-style": [
      "warn",
      {
        "multiline": {
          "delimiter": "comma",
          "requireLast": true
        },
        "singleline": {
          "delimiter": "comma",
          "requireLast": false
        }
      }
    ],
    "@typescript-eslint/no-floating-promises": "error"
  }
}
