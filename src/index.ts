declare var window: Window;

(window as any)['location'] = `https://a.a${121}` + 'aaa';

let a = `/doc/getinfo?${1}`
a = `doc/getinfo`
window.open('https://a.a', '_self')
window.location.href = 'https://doc.weixin.qq.com/doc/getinfo'