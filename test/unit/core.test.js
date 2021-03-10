const { ESRTCore } = require('index')

const core = ESRTCore.getInstance(undefined, 'TEST1')

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
