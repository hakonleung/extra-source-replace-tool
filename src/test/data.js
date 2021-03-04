const protocol = 'https'
const host = 'test.com'
const port = '8080'
const path = '/a/b'
const query = '?%u4E2D%u6587'
const hash = '#%u4E2D%u6587/%u4E2D%u6587'

const href = protocol + '://' + host + ':' + port + path + query + hash

const invalidUrls = [
  'yyyy/m/d h:mm:ss;@',
  '/a/中文',
  'a/{1}[0-9].{1}[0-9].{1}[0-9]',
  // '~img/test.png',
  'div',
  'wss://test.com'
]

const coreOptions = {
  default: {
    origins: ['https://test.com', 'http://test.cn'],
    // blockPaths: ['/txdoc/getauthinfo', '/info/report'],
    l1PathMap: {
      a: '/cgi-bin/b',
    },
    l2PathMap: {
      b: 'c'
    },
    injectBlockMethod: true,
    ignoreBinaryAccesses: [
      ['ignore', 'ignore']
    ],
    ignoreCallAccesses: [
      ['ignoreFunction']
    ],
  }
}

const validSources = [
  'https://github.githubassets.com/images/modules/site/icons/footer/github-logo.svg'
]

const invalidSources = [
  'http://finance.qq.com/products/portfolio/download.htm'
]

module.exports = {
  href,
  invalidUrls,
  coreOptions,
  validSources,
  invalidSources
}