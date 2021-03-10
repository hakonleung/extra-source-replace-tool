const result = [
  `wss://test.com`,
  `background-image: url(https://github.githubassets.com/images/modules/site/icons/footer/github-logo.svg)`,
  '/txdoc/e' + '/txdoc/g' + `/txdoc/h`,
  `/txdoc/a${`/txdoc/b${'/txdoc/c'}`}`,
  'http://finance.qq.com/products/portfolio/download.htm',
  '#test',
  `/doc/getinfo?${1}`,
  `doc/getinfo?%u4E2D%u6587`,
  'https://doc.weixin.qq.com/txdoc/get_openusers',
  '/',
  '/a/中文',
  'yyyy/m/d h:mm:ss;@',
  /* webpackChunkName: "bundle" */ '/a/a' + `a`,
  'a/{1}[0-9].{1}[0-9].{1}[0-9]',
  'https://docs.qq.com/desktop/m/index.html?tdsourcetag=s_mqq_andr_shortcut',
  '~img/test.png',
  'https://doc.weixin.qq.com/txdoc/getres?nocache=true&ignorlocaldiff=true&file=/',
]
const window: any = {
  open: (href: string) => {
    result.push(href)
  },
}
const locaton = {
  href: '',
  replace: () => {},
}
Object.defineProperty(window, 'location', {
  get: () => locaton,
  set: (href) => {
    locaton.href = href
    result.push(href)
  },
})
window['location'] = `https://test.com${1}` + 'test'
window.location.href = 'https://doc.weixin.qq.com/doc/getinfo'
window.open()
window.open('https://test.com', '_self')

const tencentDocOpenUrl = (url: string, type: string) => {
  result.push(url)
}
tencentDocOpenUrl('https://github.githubassets.com/images/modules/site/icons/footer/github-logo.svg', '_blank')

let temp: any = (str: string) => {},
  _temp
result.push('/txdoc/d' + temp('/txdoc/f' + _temp))

if (temp === 'constructor') {
}

__export__ = JSON.stringify(result, undefined, 2)
