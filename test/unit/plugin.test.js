const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const { ESRTCore, HtmlPlugin } = require('index')
const { compile, getCompiler, getExecutedCode, readAsset } = require('test/helpers')

jest.setTimeout(200000)

ESRTCore.getInstance().configure(null, true, 'TEST')

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
          new HtmlPlugin(new ESRTCore({ injectBlockMethod }, 'TEST')),
        ],
      })
      const stats = await compile(compiler)
      expect(readAsset(filename, compiler, stats)).toMatchSnapshot('module')
      expect(getExecutedCode('main.bundle.js', compiler, stats)).toMatchSnapshot('result')
    })
  })
})
