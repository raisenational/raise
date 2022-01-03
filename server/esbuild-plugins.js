const { nodeExternalsPlugin } = require('esbuild-node-externals');

module.exports = [nodeExternalsPlugin({
  allowList: ['@raise/shared']
})]
