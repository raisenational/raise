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
];
