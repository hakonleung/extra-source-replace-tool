import * as ReactDom from 'react-dom'
import JSX from './test.tsx'
import './test.js'
import './index.css'
import('./test.tsx')
declare var window: Window
;(window as any)['location'] = `https://test.com${1}` + 'test'
window.open()
window.open('https://test.com', '_self')
window.location.href = 'https://doc.weixin.qq.com/doc/getinfo'
document.querySelector('#test')

let temp: any = `wss://test.com`
temp = `background-image: url(https://github.githubassets.com/images/modules/site/icons/footer/github-logo.svg)`
temp = '/txdoc/e' + '/txdoc/g' + `/txdoc/h`
temp = `/txdoc/a${`/txdoc/b${'/txdoc/c'}`}`
temp = (str: string) => {}
let _temp
temp = '/txdoc/d' + temp('/txdoc/f' + _temp)
temp = 'http://finance.qq.com/products/portfolio/download.htm'
const tencentDocOpenUrl = (url: string, type: string) => {}
tencentDocOpenUrl('https://github.githubassets.com/images/modules/site/icons/footer/github-logo.svg', '_blank')

if (temp === 'constructor') {
}
temp = `/doc/getinfo?${1}`
temp = `doc/getinfo?%u4E2D%u6587`
temp = 'https://doc.weixin.qq.com/txdoc/get_openusers'
temp = '/'
temp = '/a/中文'
temp = 'yyyy/m/d h:mm:ss;@'
temp = /* webpackChunkName: "bundle" */ '/a/a' + `a`
temp = 'a/{1}[0-9].{1}[0-9].{1}[0-9]'

temp = 'https://docs.qq.com/desktop/m/index.html?tdsourcetag=s_mqq_andr_shortcut'
temp = '~img/test.png'
temp = 'https://doc.weixin.qq.com/txdoc/getres?nocache=true&ignorlocaldiff=true&file=/'

window.addEventListener('load', () => {
  const div = document.createElement('div')
  document.body.append(div)
  ReactDom.render(JSX, div)
})
