import * as ReactDom from 'react-dom'
import JSX from './test.tsx'
import './test.js'
import './index.css'
declare var window: Window;

(window as any)['location'] = `https://a.a${121}` + 'aaa';

let a:any = `/doc/getinfo?${1}`
a = `doc/getinfo`
window.open('https://a.a', '_self')
window.location.href = 'https://doc.weixin.qq.com/doc/getinfo'

a = `background-image: url(https://rescdn.qqmail.com/node/wework/images/wwdoc_edit_expire.a6ecd3e29e.png)`
a = (str: string) => {}
let d = '/txdoc/e' + '/txdoc/g' + `/txdoc/h`
const c = `/txdoc/a${`/txdoc/b${'/txdoc/c'}`}`
let f
const b = '/txdoc/d' + a('/txdoc/f' + f)
window.addEventListener('load', () => {
  const div = document.createElement('div')
  document.body.append(div)
  ReactDom.render(JSX, div)
  document.querySelector('#exception-other')
  const url = `wss://window.location.host`;
  const tencentDocOpenUrl = (url: string, type: string) => { };
  tencentDocOpenUrl('http://finance.qq.com/products/portfolio/download.htm', '_blank');
  if (a === 'constructor') {}
})
