import domdomegg from 'eslint-config-domdomegg';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
	...domdomegg,

	{
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
	},

	{
		files: ['**/*.test.ts', '**/*.test.tsx'],
		rules: {
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'react/jsx-key': 'off',
		},
	},
];
