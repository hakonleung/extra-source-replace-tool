const a = 'https://oa.com'
const b = `https://oa.com` + `/sss`;
(window as any)['a']['location'] = 'aaa';
window.location.href = 'aaa'
window.location.replace('a')
window[a].replace()