import raiseEslint from '@raise/eslint-config';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
	...raiseEslint,

	{
		ignores: ['local/**'],
	},

	{
		rules: {
			'no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: '@aws-sdk/client-dynamodb',
							message: 'Use @aws-sdk/lib-dynamodb instead',
						},
						{
							name: '@aws-sdk/lib-dynamodb',
							importNames: [
								'DynamoDBDocumentClient',
							],
							message: 'Use src/helpers/documentClient.ts instead',
						},
						{
							name: 'process',
							importNames: [
								'env',
							],
							message: 'Use src/env/env.ts instead',
						},
					],
					patterns: [
						{
							group: [
								'**/env/*',
								'!**/env/env',
							],
							message: 'Use /env/env (the sibling) instead',
						},
						{
							group: [
								'**/schemas/jsonSchema',
								'**/schemas/typescript',
							],
							message: 'Use /schemas (the parent) instead',
						},
					],
				},
			],
		},
	},
];
