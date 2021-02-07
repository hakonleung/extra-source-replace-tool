function test(global) {
    var WEDOC_INNER_HOSTNAME_ARR = [global.location.hostname, 'doc.weixin.qq.com', ''];
    var WEDOC_ORIGIN_F_P_ARR = [
        'doc',
        'wedoc',
        'txdoc',
        'comment',
        'disk'
        // 'info'
    ];
    var WEDOC_TARGET_F_P_MAP = {
        'default': '/cgi-bin/doc',
        'disk': '/cgi-bin/disk'
    };
    var WEDOC_TARGET_S_P_MAP = {
        'getinfo': 'get_info'
    };
    var WEDOC_BLOCK_INNER_SOURCE = true;
    var WEDOC_BLOCK_OUTTER_SOURCE = true;
    var WEDOC_BLOCK_PATHNAME_ARR = ['/txdoc/getauthinfo', '/info/report'];

    function handleUrl(url) {
        var urlObj = getUrlObj(url);
        if (!urlObj) return url;

        if (!WEDOC_INNER_HOSTNAME_ARR.includes(urlObj.hostname)) {
            // 外链
            return WEDOC_BLOCK_OUTTER_SOURCE ? '' : url;
        }

        var paths = urlObj.pathname || '';

        if (WEDOC_BLOCK_PATHNAME_ARR.includes(paths)) {
            // 阻止的请求
            return '';
        }

        if (Object.keys(WEDOC_TARGET_F_P_MAP).some(function(key) {
            return paths.indexOf(WEDOC_TARGET_F_P_MAP[key]) === 0
        })) {
            // 前缀和目标前缀相同，不用替换
            return url;
        }

        paths = paths.split('/').filter(function(p) {
            return p;
        });

        if (!WEDOC_ORIGIN_F_P_ARR.includes(paths[0])) {
            // 内链，一级path不在白名单
            return WEDOC_BLOCK_INNER_SOURCE ? '' : url;
        }

        // 替换一级
        paths[0] = WEDOC_TARGET_F_P_MAP[paths[0]] || WEDOC_TARGET_F_P_MAP.default;
        // 替换二级
        paths[1] = WEDOC_TARGET_S_P_MAP[paths[1]] || paths[1];

        return paths.join('/') + (urlObj.hash || urlObj.search);
    }

    function replaceMethods() {
        var options = [
            {
                'target': XMLHttpRequest.prototype,
                'methodName': 'open',
                'urlArgIndex': 1
            },
            {
                'target': global.location,
                'methodName': 'replace',
                'urlArgIndex': 0
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
            style = Object.keys(style).reduce(function(value, cur) {
                return value + cur + ':' + style[cur] + ';'
            }, '')
            global.console.log(value, style);
        }

        function blockAjax(oldMethod) {
            return function() {
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
                option.target[option.methodName] = function() {
                    var newUrl = handleUrl(arguments[option.urlArgIndex]);
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
                option.target[option.methodName] = function() {
                    return option.customMethod(oldMethod).apply(this, [].slice.call(arguments));
                };
            }
        }
    }

    replaceMethods();
}