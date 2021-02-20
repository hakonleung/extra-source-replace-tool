module.exports = {
	// cacheDirectory: true,
	sourceType: 'unambiguous',
	presets: [
		[
			'@babel/preset-env',
			{
				useBuiltIns: 'usage',
				targets: [
					'> 0.5%, last 2 versions, not IE < 11',
					'IE >= 11'
				],
				corejs: {
					version: 3,
					proposals: true,
				}
			},
		],
		'@babel/preset-react',
	],
	plugins: [
		[
			'@babel/plugin-proposal-decorators',
			{
				legacy: true
			}
		],
		[
			'@babel/plugin-proposal-class-properties',
			{
				loose: true
			}
		],
		[
			'@babel/plugin-transform-runtime',
			{
				helpers: true,
				regenerator: false,
				useESModules: true,
				absoluteRuntime: false,
			},
		],
	],
}
