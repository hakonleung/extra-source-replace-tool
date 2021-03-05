const core = require('core/index')
const { testUrl, getUrlFullInfo, parseStyleUrl, execStyleUrl, transformCgi } = require('utils/url-parser')
const { href, invalidUrls, coreOptions, validSources, invalidSources } = require('test/data')

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

    core.config(coreOptions.default, true)

    expect(getUrlFullInfo('a/b', true, core.options)).toMatchObject({
      inside: true,
      protocol: core.options.protocol,
    })

    expect(getUrlFullInfo('~a/b', true, core.options)).toMatchObject({
      inside: true,
      protocol: core.options.protocol,
    })

    expect(getUrlFullInfo('//test.com/a/b', true, core.options)).toMatchObject({
      inside: true,
      protocol: core.options.protocol,
    })

    expect(getUrlFullInfo('http://test.cn/a/b', true, core.options)).toMatchObject({
      inside: true,
      protocol: 'http',
    })

    expect(getUrlFullInfo('//test1.com/a/b', true, core.options)).toMatchObject({
      inside: false,
      protocol: core.options.protocol,
    })

    expect(getUrlFullInfo('http://test1.cn/a/b', false, core.options)).toMatchObject({
      inside: false,
      protocol: 'http',
      ext: '',
    })

    expect(getUrlFullInfo('http://test1.cn/a/b.c', true, core.options)).toMatchObject({
      inside: false,
      protocol: 'http',
      ext: '',
    })

    expect(getUrlFullInfo('http://test1.cn/a/b.c', false, core.options)).toMatchObject({
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
    core.config(
      {
        transformCgi: (url) => 'test' + url,
      },
      true
    )

    expect(transformCgi('/a/c', core.options)).toBe(core.options.transformCgi('/a/c'))

    core.config(coreOptions.default, true)

    expect(transformCgi('/a/', core.options)).toBe('/cgi-bin/b/')

    expect(transformCgi('/a/b', core.options)).toBe('/cgi-bin/b/c')

    expect(transformCgi('/a/c', core.options)).toBe('/cgi-bin/b/c')

    expect(transformCgi('/d/c', core.options)).toBe('/d/c')

    expect(transformCgi('/cgi-bin/b/b', core.options)).toBe('/cgi-bin/b/b')

    expect(transformCgi(getUrlFullInfo('/a/b', true, core.options), core.options)).toBe('/cgi-bin/b/c')

    expect(() => transformCgi(1, core.options)).toThrowError('url`s type must be object or string!')

    expect(transformCgi(null, core.options)).toBe('')

    expect(transformCgi('//github.com/test', core.options)).toBe('//github.com/test')

    expect(transformCgi(invalidUrls[0], core.options)).toBe(invalidUrls[0])

    core.config({
      blockIntraUrl: true,
    })

    expect(transformCgi('/d/c', core.options)).toBe('')

    core.config({
      blockPaths: ['/a/c'],
    })

    expect(transformCgi('/a/c', core.options)).toBe('')

    core.config({
      blockExtraUrl: true,
    })

    expect(transformCgi('//github.com/test', core.options)).toBe('')
  })
})
