/**
 * @jest-environment jsdom
 */
const { compile, getCompiler, getExecutedCode, getModuleSource } = require('test/helpers')

jest.setTimeout(200000)

describe('loader', () => {
  ;['ts', 'tsx', 'js'].forEach((ext) => {
    it(ext, async () => {
      const compiler = getCompiler(`./basic.${ext}`)
      const stats = await compile(compiler)
      expect(getExecutedCode('main.bundle.js', compiler, stats)).toMatchSnapshot('result')
    })
  })

  // it('css', async () => {
  //   const compiler = getCompiler('./css.ts')
  //   const stats = await compile(compiler)
  //   expect(getModuleSource('./basic.css', stats)).toMatchSnapshot(
  //     'module'
  //   )
  //   expect(
  //     getExecutedCode('main.bundle.js', compiler, stats)
  //   ).toMatchSnapshot('result')
  // })
})
