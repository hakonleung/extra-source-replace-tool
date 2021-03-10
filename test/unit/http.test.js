const { getParseBase64Promise, getParseJsPromise } = require('utils/http')
const { ESRTCore } = require('index')
const { validSources, invalidSources } = require('test/helpers/mock')

jest.setTimeout(200000)

const core = new ESRTCore(undefined, 'TEST2')

describe('http', () => {
  it('getParseBase64Promise empty url', () => expect(getParseBase64Promise('', core)).resolves.toBe(undefined))
  it('getParseBase64Promise invalid ext', () =>
    expect(getParseBase64Promise(invalidSources[0], core)).resolves.toBe(undefined))
  it('getParseBase64Promise intra url', () =>
    expect(getParseBase64Promise('//test.com/a.jpg', core)).resolves.toBe(undefined))
  it('getParseBase64Promise no ext', () =>
    expect(getParseBase64Promise(validSources[0].replace('.svg', ''), core)).resolves.toBe(undefined))
  it('getParseBase64Promise valid url', () =>
    expect(getParseBase64Promise(validSources[0], core)).resolves.toStrictEqual(
      expect.stringMatching(/^data\:image\/svg\+xml/)
    ))

  it('getParseJsPromise valid url', () =>
    expect(getParseJsPromise(validSources[1], core)).resolves.toStrictEqual(expect.stringMatching(/^System\.register/)))
})
