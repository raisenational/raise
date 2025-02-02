import raiseEslint from '@raise/eslint-config';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
	...raiseEslint,

	{
		rules: {
			'react/display-name': 'off',
		},
	},
	{
		files: ['**/*.tsx'],
		rules: {'@typescript-eslint/naming-convention': 'off'},
	},
];
