const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlPlugin = require('plugins/html-plugin')

const ESRTCore = require('core/base')
const { compile, getCompiler, getExecutedCode, readAsset } = require('test/helpers')

jest.setTimeout(200000)

ESRTCore.getInstance().configure(null, true)

const filename = 'basic.html'

describe('plugin', () => {
  ;[false, true].forEach((injectBlockMethod) => {
    it(`html inject ${injectBlockMethod}`, async () => {
      const compiler = getCompiler('./css-import.ts', {
        plugins: [
          new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../fixtures', filename),
            filename,
          }),
          new HtmlPlugin(new ESRTCore({ injectBlockMethod })),
        ],
      })
      const stats = await compile(compiler)
      expect(readAsset(filename, compiler, stats)).toMatchSnapshot('module')
      expect(getExecutedCode('main.bundle.js', compiler, stats)).toMatchSnapshot('result')
    })
  })
})
