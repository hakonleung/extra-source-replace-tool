const ESRTCore = require('core/base')

const core = ESRTCore.getInstance()

describe('ESRTCore', () => {
  test('singleton', () => {
    expect(ESRTCore.getInstance()).toEqual(core)
  })

  core.configure({ testOption: true })

  test('options', () => {
    expect(ESRTCore.getInstance().options).toMatchObject({ testOption: true })
  })

  const logger = {}
  ESRTCore.getLogger = () => logger
  core.initLogger()
  test('logger', () => {
    expect(ESRTCore.getInstance().logger).toEqual(logger)
  })
})
