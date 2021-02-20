const { transformCgi } = require('../utils/url-parser');

window.CORE_OPTIONS = JSON.parse('__OPTIONS__');

((global) => {
    function replaceMethods() {
        var options = [
            {
                'target': XMLHttpRequest.prototype,
                'methodName': 'open',
                'urlArgIndex': 1
            },
            {
                'target': global,
                'methodName': 'open',
                'urlArgIndex': 0
            },
            {
                'target': XMLHttpRequest.prototype,
                'methodName': 'setRequestHeader',
                'customMethod': blockAjax
            },
            {
                'target': XMLHttpRequest.prototype,
                'methodName': 'send',
                'customMethod': blockAjax
            },
        ];
        options.forEach(replaceMethod);

        function log(action, source, style) {
            if (!global.console) return;
            var value = '%c[local]api ' + action + ': ' + source
            style = Object.keys(style).reduce(function (value, cur) {
                return value + cur + ':' + style[cur] + ';'
            }, '')
            global.console.log(value, style);
        }

        function blockAjax(oldMethod) {
            return function () {
                if (this.readyState !== this.OPENED) {
                    var oldMethodName = /function (\w+)\(/.exec(oldMethod.toString());
                    oldMethodName = oldMethodName ? oldMethodName[1].toUpperCase() : '';
                    log('block', oldMethodName + '=>' + this.aegisUrl, {
                        'color': 'lightseagreen',
                        'font-size': '14px'
                    })
                    return;
                }
                return oldMethod.apply(this, [].slice.call(arguments));
            }
        }
        function replaceMethod(option) {
            var oldMethod = option.target[option.methodName];
            if (typeof option.urlArgIndex === 'number') {
                option.target[option.methodName] = function () {
                    var newUrl = transformCgi(arguments[option.urlArgIndex], CORE_OPTIONS);
                    log('proxy', '', {
                        'color': '#ff008a',
                        'font-size': '14px'
                    })
                    log('origin', arguments[option.urlArgIndex], {
                        'color': 'aqua',
                        'font-size': '12px'
                    })
                    log('target', newUrl, {
                        'color': '#69e147',
                        'font-size': '12px'
                    })
                    arguments[option.urlArgIndex] = newUrl;
                    if (arguments[option.urlArgIndex]) return oldMethod.apply(this, [].slice.call(arguments));
                }
            }
            if (typeof option.customMethod === 'function') {
                option.target[option.methodName] = function () {
                    return option.customMethod(oldMethod).apply(this, [].slice.call(arguments));
                };
            }
        }
    }

    replaceMethods();
})(window);