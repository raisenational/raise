const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const {SourceMapDevToolPlugin} = require('webpack');

/** @type { import('webpack').Configuration } */
module.exports = {
	context: __dirname,
	mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
	entry: slsw.lib.entries,
	// See plugins below
	devtool: slsw.lib.webpack.isLocal ? 'eval-cheap-module-source-map' : undefined,
	resolve: {
		extensions: ['.js', '.mjs', '.ts', '.json'],
		symlinks: false,
		cacheWithContext: false,
	},
	output: {
		libraryTarget: 'commonjs',
		path: path.join(__dirname, '.webpack'),
		filename: '[name].js',
	},
	optimization: {
		concatenateModules: false,
	},
	target: 'node',
	externals: [nodeExternals({
		allowlist: ['@raise/shared'],
	})],
	module: {
		rules: [
			// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
			{
				test: /\.(tsx?)$/,
				loader: 'ts-loader',
				exclude: [
					[
						path.resolve(__dirname, 'node_modules'),
						path.resolve(__dirname, '.serverless'),
						path.resolve(__dirname, '.webpack'),
						path.resolve(__dirname, '.dynamodb'),
					],
				],
				options: {
					transpileOnly: true,
				},
			},
		],
	},
	plugins: [
		...(slsw.lib.webpack.isLocal ? [] : [new SourceMapDevToolPlugin({
			filename: '[file].map',
			// This line appears to help with being able to print stacktraces.
			// Without this I think what is happening is:
			// - We generate massive source maps because we include sources of deps (6 MB+)
			// - We try accessing error.stack (or use a method which does this, like logging an error)
			// - source-map-support means this file is then read, which hangs Node.js
			// - Eventually the function times out and our server is sad - but doesn't alert us well
			noSources: true,
		})]),
		new ForkTsCheckerWebpackPlugin(),
	],
};
