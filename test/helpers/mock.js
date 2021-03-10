const href = 'https://test.com:8080/a/b?%u4E2D%u6587#%u4E2D%u6587/%u4E2D%u6587'

const invalidUrls = [
  'yyyy/m/d h:mm:ss;@',
  '/a/中文',
  'a/{1}[0-9].{1}[0-9].{1}[0-9]',
  // '~img/test.png',
  'div',
  'wss://test.com',
]

const validSources = [
  'https://github.githubassets.com/images/modules/site/icons/footer/github-logo.svg',
  'https://github.githubassets.com/assets/chunk-frameworks-39ff961b.js',
]

const invalidSources = ['http://finance.qq.com/products/portfolio/download.htm']

const mockAccess = (access) => access.map((v) => ({ text: v }))

module.exports = {
  href,
  invalidUrls,
  validSources,
  invalidSources,
  mockAccess,
}
