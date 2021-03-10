const { ESRTCore } = require('index')
const { testUrl, getUrlFullInfo, parseStyleUrl, execStyleUrl, transformCgi } = require('utils/url-parser')
const { href, invalidUrls, validSources } = require('test/helpers/mock')

let options = ESRTCore.genOptions(undefined, 'TEST2')

describe('url-parser', () => {
  // toMatchObject
  test('testUrl', () => {
    expect(testUrl(' ' + href)).toBeTruthy()
    expect(testUrl(' ' + href, true)).toBeFalsy()
  })

  test('getUrlFullInfo', () => {
    invalidUrls.forEach((str) => {
      expect(getUrlFullInfo(str)).toBeNull()
    })

    expect(getUrlFullInfo('a/b', true, options)).toMatchObject({
      inside: true,
      protocol: options.intraProtocol,
    })

    expect(getUrlFullInfo('~a/b', true, options)).toMatchObject({
      inside: true,
      protocol: options.intraProtocol,
    })

    expect(getUrlFullInfo('//test.com/a/b', true, options)).toMatchObject({
      inside: true,
      protocol: options.intraProtocol,
    })

    expect(getUrlFullInfo('http://test.cn/a/b', true, options)).toMatchObject({
      inside: true,
      protocol: 'http',
    })

    expect(getUrlFullInfo('//test1.com/a/b', true, options)).toMatchObject({
      inside: false,
      protocol: options.intraProtocol,
    })

    expect(getUrlFullInfo('http://test1.cn/a/b', false, options)).toMatchObject({
      inside: false,
      protocol: 'http',
      ext: '',
    })

    expect(getUrlFullInfo('http://test1.cn/a/b.c', true, options)).toMatchObject({
      inside: false,
      protocol: 'http',
      ext: '',
    })

    expect(getUrlFullInfo('http://test1.cn/a/b.c', false, options)).toMatchObject({
      inside: false,
      protocol: 'http',
      ext: 'c',
    })
  })

  test('parseStyleUrl', () => {
    expect(parseStyleUrl(`background: url(${validSources[0]})`)).toMatchObject({
      href: validSources[0],
      origin: validSources[0],
    })
    expect(parseStyleUrl(`background: url('${validSources[0]}')`)).toMatchObject({
      href: validSources[0],
      origin: `'${validSources[0]}'`,
    })

    expect(parseStyleUrl(`background: url('${validSources[0]}")`)).toBeNull()

    invalidUrls.forEach((str) => {
      expect(parseStyleUrl(str, true)).toBeNull()
    })
  })

  test('execStyleUrl', () => {
    expect(execStyleUrl(`background: url(${validSources[0]}); background: url(${validSources[0]})`)).toHaveLength(2)

    expect(execStyleUrl(`background: url(${validSources[0]}); background: url(${invalidUrls[0]})`, true)).toHaveLength(
      1
    )

    expect(execStyleUrl(`background: url(${invalidUrls.join('); background: url(')})`, true)).toHaveLength(0)
  })

  test('transformCgi', () => {
    options = ESRTCore.genOptions({ transformCgi: (url) => 'test' + url }, 'TEST1')

    expect(transformCgi('/a/c', options)).toBe(options.transformCgi('/a/c'))

    options = ESRTCore.genOptions(undefined, 'TEST2')

    expect(transformCgi('/a/', options)).toBe('/cgi-bin/b/')

    expect(transformCgi('/a/b', options)).toBe('/cgi-bin/b/c')

    expect(transformCgi('/a/c', options)).toBe('/cgi-bin/b/c')

    expect(transformCgi('/d/c', options)).toBe('/d/c')

    expect(transformCgi('/cgi-bin/b/b', options)).toBe('/cgi-bin/b/b')

    expect(transformCgi(getUrlFullInfo('/a/b', true, options), options)).toBe('/cgi-bin/b/c')

    expect(() => transformCgi(1, options)).toThrowError('url`s type must be object or string!')

    expect(transformCgi(null, options)).toBe('')

    expect(transformCgi('//github.com/test', options)).toBe('//github.com/test')

    expect(transformCgi(invalidUrls[0], options)).toBe(invalidUrls[0])

    options.intraBlock = true

    expect(transformCgi('/d/c', options)).toBe('')

    options.intraBlockPaths = ['/a/c']

    expect(transformCgi('/a/c', options)).toBe('')

    options.extraBlock = true

    expect(transformCgi('//github.com/test', options)).toBe('')
  })
})
