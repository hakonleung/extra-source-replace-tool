const { getParseBase64Promise, getParseJsPromise } = require('utils/http')
const core = require('core/index')
const { coreOptions, validSources, invalidSources } = require('test/helper')

jest.setTimeout(200000)

describe('http', () => {
  core.config(coreOptions.default, true)
  it('getParseBase64Promise empty url', () => expect(getParseBase64Promise('', core.options)).resolves.toBe(undefined))
  it('getParseBase64Promise invalid ext', () =>
    expect(getParseBase64Promise(invalidSources[0], core.options)).resolves.toBe(undefined))
  it('getParseBase64Promise intra url', () =>
    expect(getParseBase64Promise('//test.com/a.jpg', core.options)).resolves.toBe(undefined))
  it('getParseBase64Promise no ext', () =>
    expect(getParseBase64Promise(validSources[0].replace('.svg', ''), core.options)).resolves.toBe(undefined))
  it('getParseBase64Promise valid url', () =>
    expect(getParseBase64Promise(validSources[0], core.options)).resolves.toStrictEqual(
      expect.stringMatching(/^data\:image\/svg\+xml/)
    ))

  it('getParseJsPromise valid url', () =>
    expect(getParseJsPromise(validSources[1], core.options)).resolves.toStrictEqual(
      expect.stringMatching(/^System\.register/)
    ))
})
