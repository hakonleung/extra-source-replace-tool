const path = require('path')
const hakonLoader = path.resolve(process.cwd(), './webpack/hakon/loader')
const hakonCssLoader = path.resolve(process.cwd(), './webpack/hakon/css-loader')
const exclude = [/node_modules/]
const cssLoaders = ['style-loader', 'css-loader', hakonCssLoader, {
  loader: "postcss-loader",
  options: {
    postcssOptions: {
      plugins: [
        [
          "postcss-preset-env",
          {
            // Options
          },
        ],
      ],
    },
  },
},]

module.exports = {
  rules: [
    {
      test: /\.ts(x?)$/,
      exclude,
      use: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
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
                "@babel/plugin-proposal-decorators",
                {
                  legacy: true
                }
              ],
              [
                "@babel/plugin-proposal-class-properties",
                {
                  loose: true
                }
              ],
              [
                '@babel/plugin-transform-runtime',
                {
                  "helpers": true,
                  "regenerator": false,
                  "useESModules": true,
                  "absoluteRuntime": false,
                },
              ],
            ],
          },
        },
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: '../tsconfig.json',
          },
        },
        // {
        //   loader: hakonLoader
        // }
      ],
    },
    // {
    //   test: /\.js$/,
    //   exclude,
    //   use: [
    //     {
    //       loader: 'babel-loader',
    //       options: {
    //         cacheDirectory: true,
    //         sourceType: 'unambiguous',
    //         presets: [
    //           [
    //             '@babel/preset-env',
    //             {
    //               useBuiltIns: 'usage',
    //               targets: [
    //                 '> 0.5%, last 2 versions, not IE < 11',
    //                 'IE >= 11'
    //               ],
    //               corejs: {
    //                 version: 3,
    //                 proposals: true,
    //               }
    //             },
    //           ],
    //           '@babel/preset-react',
    //         ],
    //         plugins: [
    //           [
    //             "@babel/plugin-proposal-decorators",
    //             {
    //               legacy: true
    //             }
    //           ],
    //           [
    //             "@babel/plugin-proposal-class-properties",
    //             {
    //               loose: true
    //             }
    //           ],
    //           [
    //             '@babel/plugin-transform-runtime',
    //             {
    //               "helpers": true,
    //               "regenerator": false,
    //               "useESModules": true,
    //               "absoluteRuntime": false,
    //             },
    //           ],
    //         ],
    //       },
    //     },
    //     // {
    //     //   loader: hakonLoader
    //     // }
    //   ],
    // },
    {
      test: /\.css$/,
      exclude,
      use: cssLoaders,
    },
    // {
    //   test: /\.less$/,
    //   exclude,
    //   use: [...cssLoaders, 'less-loader'],
    // },
    // {
    //   test: /\.scss$/,
    //   exclude,
    //   use: [...cssLoaders, 'sass-loader'],
    // },
    // {
    //   test: /\.(png|jpg|gif|cur|svg)$/,
    //   exclude,
    //   use: [
    //     {
    //       loader: 'url-loader',
    //       options: {
    //         limit: 8192,
    //         outputPath: 'img',
    //       },
    //     },
    //   ],
    // },
  ]
}