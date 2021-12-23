module.exports = {
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint-config-blvd/react"
  ],
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module",
    "project": "./tsconfig.json",
    "tsconfigRootDir": __dirname,
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "max-len": "off",
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
            "name": "axios",
            "message": "Use src/components/networking.ts instead"
          },
          {
            "name": "axios-hooks",
            "importNames": [
              "default",
              "makeUseAxios"
            ],
            "message": "Use src/components/networking.ts instead"
          }
        ]
      }
    ],
    "import/prefer-default-export": "off",
    "comma-spacing": "off",
    "@typescript-eslint/comma-spacing": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/no-use-before-define": "warn",
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
    "react/jsx-one-expression-per-line": "off",
    "react/require-default-props": "off",
    "react/jsx-props-no-spreading": "off", // for react-hook-form
    "react/jsx-indent": "warn",
    "react/no-unescaped-entities": [
      "error",
      {
        "forbid": [
          {
            "char": ">",
            "alternatives": [
              "&gt;"
            ]
          },
          {
            "char": "}",
            "alternatives": [
              "&#125;"
            ]
          }
        ]
      }
    ]
  }
}
