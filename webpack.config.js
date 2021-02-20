const path = require("path")
const nodeExternals = require('webpack-node-externals')

module.exports = {
	entry: {
		main: "./src/index.js",
	},
	mode: "none",
	target: "node",
	output: {
		filename: "[name].js",
		libraryTarget: 'umd',
		path: path.resolve(__dirname)
	},
	devtool: false,
	plugins: [
	],
	resolve: {
		extensions: [".ts", ".tsx", ".js"]
	},
	module: {
		rules: [
			{ test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ }
		]
	},
	node: {
		__dirname: true
	},
	externals: [nodeExternals()],
}
