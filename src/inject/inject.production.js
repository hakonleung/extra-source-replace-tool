(()=>{var t,e,r={528:t=>{function e(t){return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function r(t,c){r=function(t,e){return new l(t,void 0,e)};var i=o(RegExp),a=RegExp.prototype,u=new WeakMap;function l(t,e,r){var n=i.call(this,t,e);return u.set(n,r||u.get(t)),n}function f(t,e){var r=u.get(e);return Object.keys(r).reduce((function(e,n){return e[n]=t[r[n]],e}),Object.create(null))}return n(l,i),l.prototype.exec=function(t){var e=a.exec.call(this,t);return e&&(e.groups=f(e,this)),e},l.prototype[Symbol.replace]=function(t,r){if("string"==typeof r){var n=u.get(this);return a[Symbol.replace].call(this,t,r.replace(/\$<([^>]+)>/g,(function(t,e){return"$"+n[e]})))}if("function"==typeof r){var o=this;return a[Symbol.replace].call(this,t,(function(){var t=[];return t.push.apply(t,arguments),"object"!==e(t[t.length-1])&&t.push(f(t,o)),r.apply(this,t)}))}return a[Symbol.replace].call(this,t,r)},r.apply(this,arguments)}function n(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&a(t,e)}function o(t){var e="function"==typeof Map?new Map:void 0;return(o=function(t){if(null===t||(r=t,-1===Function.toString.call(r).indexOf("[native code]")))return t;var r;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==e){if(e.has(t))return e.get(t);e.set(t,n)}function n(){return c(t,arguments,u(this).constructor)}return n.prototype=Object.create(t.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),a(n,t)})(t)}function c(t,e,r){return(c=i()?Reflect.construct:function(t,e,r){var n=[null];n.push.apply(n,e);var o=new(Function.bind.apply(t,n));return r&&a(o,r.prototype),o}).apply(null,arguments)}function i(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}function a(t,e){return(a=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function u(t){return(u=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function l(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function f(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?l(Object(r),!0).forEach((function(e){p(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function p(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function s(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var r=[],n=!0,o=!1,c=void 0;try{for(var i,a=t[Symbol.iterator]();!(n=(i=a.next()).done)&&(r.push(i.value),!e||r.length!==e);n=!0);}catch(t){o=!0,c=t}finally{try{n||null==a.return||a.return()}finally{if(o)throw c}}return r}}(t,e)||function(t,e){if(t){if("string"==typeof t)return h(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?h(t,e):void 0}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function h(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n}var y="-_.~!*'();:@&=+$,/?#",g={pathname:"a-z0-9\\"+y.replace(/[;:@&=+$,/?#']/g,"").split("").join("\\"),host:"a-z0-9\\"+y.replace(/[.;:@&=+$,/?#']/g,"").split("").join("\\"),hash:"a-z0-9\\"+y.replace(/[?#']/g,"").split("").join("\\"),search:"a-z0-9\\"+y.replace(/[?#']/g,"").split("").join("\\")},b={protocol:"(https?:)?//",pathname:"(^[".concat(g.pathname,"]+)?((\\/[").concat(g.pathname,"]+)+\\/?|/)"),host:"([".concat(g.host,"])+(\\.[").concat(g.host,"]+)+(:d+)?"),hash:"#[".concat(g.hash,"]*"),search:"\\?[".concat(g.search,"]*")},m=function(t,e){return"(".concat(e?"?<".concat(t,">"):"").concat(b[t],")")};Object.keys(b).forEach((function(t){b[t+"_g"]=m(t,!0),b[t]=m(t)}));var v="(?<origin>".concat(b.protocol_g).concat(b.host_g,")"),d="(?<tail>".concat(b.pathname_g,"?(").concat(b.hash_g,"|").concat(b.search_g,")?)"),O=new RegExp("".concat(v,"?").concat(d),"i"),x="(".concat(b.protocol).concat(b.host,")"),j="(".concat(b.hash,"|").concat(b.search,")"),w="(".concat(b.pathname).concat(j,"?|").concat(j,")"),S=new RegExp("(".concat(x).concat(w,"?)|(").concat(w,")"),"i"),P=new RegExp("^".concat(S.source,"$"),O.flags),E=function(t,e){return t&&(e?P:S).test(t)},_=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=e.protocol||"http";return Object.keys(t).forEach((function(e){if("protocol"===e)if(void 0!==t[e]){var n=s(t[e].split(":"),2),o=n[0];n[1]?t[e]=o:(t[e]=r,t.origin=r+":"+t.origin,t.href=r+":"+t.href)}else{var c=r+"://";t[e]=r,t.host&&(t.origin=c+t.origin,t.href=c+t.href)}else if("host"===e){if(void 0!==t[e]){var i=s(t[e].split(":"),2),a=i[0],u=i[1];t.hostname=a,t.port=u}}else"pathname"===e&&(void 0===t[e]||t[e].startsWith("/")||(t[e]="/"+t[e]));void 0===t[e]&&(t[e]="")})),t.origin||t.tail?t:null},R=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(void 0===t)return null;var r=O.exec(t);return r&&r[0]===t?(r=f({href:r[0]},r.groups),_(r,e)):null},I=new Map,M=function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if(!e&&I.has(t))return I.get(t);var n=R(t,r);if(!n||!n.host&&!n.pathname)return null;if(n.ext="",(!n.host&&n.pathname||r.origins&&r.origins.includes(n.origin))&&(n.inside=!0),!e){var o=/\.([0-0a-z]+)$/i.exec(n.pathname);o&&(n.ext=o[1]),I.set(t,n)}return n},A=r(/url\(((["']?)((?:(?![ "'])[\s\S])+)\2)\)/i,{origin:1,href:3}),N=function(t,e){for(var r,n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],o=new RegExp(e,"g"),c=[];(r=o.exec(t))&&r[0];)("function"==typeof n?n(r):n)&&c.push(r.groups);return c};t.exports={testUrl:E,parseUrl:R,getUrlFullInfo:M,parseStyleUrl:function(t,e){var r=A.exec(t);return!r||e&&!E(r.groups.href,!0)?null:r.groups},execUrl:function(t){return N(t,O)},execStyleUrl:function(t,e){return N(t,A,(function(t){return!e||E(t.groups.href,!0)}))},transformCgi:function(t){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if("function"==typeof r.transformCgi)return r.transformCgi(t);var n=t;if("object"===e(t))t=t.href||"";else{if("string"!=typeof t)throw console.error("esrt transformCgi error! ".concat(e(t))),console.error(t),new Error("url`s type must be object or string!");n=M(t,!0,r)}if(!n)return t;if(!n.inside)return r.blockExtraUrl?"":t;if(r.blockPaths.includes(n.pathname))return"";var o=Object.keys(r.l1PathMap);if(o.some((function(t){return 0===n.pathname.indexOf(r.l1PathMap[t])})))return t;var c=n.pathname.split("/").filter((function(t){return t}));return o.includes(c[0])?(c[0]=r.l1PathMap[c[0]],c[1]=r.l2PathMap[c[1]]||c[1],c.join("/")+(n.hash||n.search)):r.blockIntraUrl?"":t}}}},n={};e=function t(e){if(n[e])return n[e].exports;var o=n[e]={exports:{}};return r[e](o,o.exports,t),o.exports}(528).transformCgi,window.CORE_OPTIONS=JSON.parse("__OPTIONS__"),CORE_OPTIONS.blockExtraUrl=!0,t=window,function(){function r(e,r,n){if(t.console){var o="%c[local]api "+e+": "+r;n=Object.keys(n).reduce((function(t,e){return t+e+":"+n[e]+";"}),""),t.console.log(o,n)}}function n(t){return function(){if(this.readyState===this.OPENED)return t.apply(this,[].slice.call(arguments));var e=/function (\w+)\(/.exec(t.toString());r("block",(e=e?e[1].toUpperCase():"")+"=>"+this.aegisUrl,{color:"lightseagreen","font-size":"14px"})}}[{target:XMLHttpRequest.prototype,methodName:"open",urlArgIndex:1},{target:t,methodName:"open",urlArgIndex:0},{target:XMLHttpRequest.prototype,methodName:"setRequestHeader",customMethod:n},{target:XMLHttpRequest.prototype,methodName:"send",customMethod:n}].forEach((function(t){var n=t.target[t.methodName];"number"==typeof t.urlArgIndex&&(t.target[t.methodName]=function(){var o=e(arguments[t.urlArgIndex],CORE_OPTIONS);if(r("proxy","",{color:"#ff008a","font-size":"14px"}),r("origin",arguments[t.urlArgIndex],{color:"aqua","font-size":"12px"}),r("target",o,{color:"#69e147","font-size":"12px"}),arguments[t.urlArgIndex]=o,arguments[t.urlArgIndex])return n.apply(this,[].slice.call(arguments))}),"function"==typeof t.customMethod&&(t.target[t.methodName]=function(){return t.customMethod(n).apply(this,[].slice.call(arguments))})}))}()})();