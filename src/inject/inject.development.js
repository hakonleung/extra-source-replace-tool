/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/utils/url-parser.js":
/*!*********************************!*\
  !*** ./src/utils/url-parser.js ***!
  \*********************************/
/***/ ((module) => {

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _wrapRegExp(re, groups) { _wrapRegExp = function _wrapRegExp(re, groups) { return new BabelRegExp(re, undefined, groups); }; var _RegExp = _wrapNativeSuper(RegExp); var _super = RegExp.prototype; var _groups = new WeakMap(); function BabelRegExp(re, flags, groups) { var _this = _RegExp.call(this, re, flags); _groups.set(_this, groups || _groups.get(re)); return _this; } _inherits(BabelRegExp, _RegExp); BabelRegExp.prototype.exec = function (str) { var result = _super.exec.call(this, str); if (result) result.groups = buildGroups(result, this); return result; }; BabelRegExp.prototype[Symbol.replace] = function (str, substitution) { if (typeof substitution === "string") { var groups = _groups.get(this); return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)>/g, function (_, name) { return "$" + groups[name]; })); } else if (typeof substitution === "function") { var _this = this; return _super[Symbol.replace].call(this, str, function () { var args = []; args.push.apply(args, arguments); if (_typeof(args[args.length - 1]) !== "object") { args.push(buildGroups(args, _this)); } return substitution.apply(this, args); }); } else { return _super[Symbol.replace].call(this, str, substitution); } }; function buildGroups(result, re) { var g = _groups.get(re); return Object.keys(g).reduce(function (groups, name) { groups[name] = result[g[name]]; return groups; }, Object.create(null)); } return _wrapRegExp.apply(this, arguments); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var URL_VALID_CHARS = "-_.~!*'();:@&=+$,/?#";
var VALID_CHARS = {
  pathname: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[;:@&=+$,/?#']/g, '').split('').join('\\'),
  host: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[.;:@&=+$,/?#']/g, '').split('').join('\\'),
  hash: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[?#']/g, '').split('').join('\\'),
  search: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[?#']/g, '').split('').join('\\')
};
var URL_REGS = {
  protocol: "(https?:)?//",
  pathname: "(^[".concat(VALID_CHARS.pathname, "]+)?((\\/[").concat(VALID_CHARS.pathname, "]+)+\\/?|/)"),
  host: "([".concat(VALID_CHARS.host, "])+(\\.[").concat(VALID_CHARS.host, "]+)+(:d+)?"),
  hash: "#[".concat(VALID_CHARS.hash, "]*"),
  search: "\\?[".concat(VALID_CHARS.search, "]*")
};

var _w = function _w(name, group) {
  return "(".concat(group ? "?<".concat(name, ">") : '').concat(URL_REGS[name], ")");
};

Object.keys(URL_REGS).forEach(function (v) {
  URL_REGS[v + '_g'] = _w(v, true);
  URL_REGS[v] = _w(v);
});
var URL_ORIGIN_REG = "(?<origin>".concat(URL_REGS.protocol_g).concat(URL_REGS.host_g, ")");
var URL_TAIL_REG = "(?<tail>".concat(URL_REGS.pathname_g, "?(").concat(URL_REGS.hash_g, "|").concat(URL_REGS.search_g, ")?)");
var URL_REG = new RegExp("".concat(URL_ORIGIN_REG, "?").concat(URL_TAIL_REG), 'i');
var URL_ORIGIN_NO_GROUP = "(".concat(URL_REGS.protocol).concat(URL_REGS.host, ")");
var URL_SEARCH_NO_GROUP = "(".concat(URL_REGS.hash, "|").concat(URL_REGS.search, ")");
var URL_TAIL_NO_GROUP = "(".concat(URL_REGS.pathname).concat(URL_SEARCH_NO_GROUP, "?|").concat(URL_SEARCH_NO_GROUP, ")");
var URL_REG_NO_GROUP = new RegExp("(".concat(URL_ORIGIN_NO_GROUP).concat(URL_TAIL_NO_GROUP, "?)|(").concat(URL_TAIL_NO_GROUP, ")"), 'i');
var URL_REG_NO_GROUP_ALL = new RegExp("^".concat(URL_REG_NO_GROUP.source, "$"), URL_REG.flags);

var testUrl = function testUrl(str, all) {
  return str && (all ? URL_REG_NO_GROUP_ALL : URL_REG_NO_GROUP).test(str);
};

var execUrlNormalize = function execUrlNormalize(groups) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var defaultProtocol = options.protocol || 'http';
  Object.keys(groups).forEach(function (key) {
    if (key === 'protocol') {
      if (groups[key] !== undefined) {
        var _groups$key$split = groups[key].split(':'),
            _groups$key$split2 = _slicedToArray(_groups$key$split, 2),
            protocol = _groups$key$split2[0],
            slash = _groups$key$split2[1];

        if (!slash) {
          groups[key] = defaultProtocol;
          groups.origin = defaultProtocol + ':' + groups.origin;
          groups.href = defaultProtocol + ':' + groups.href;
        } else {
          groups[key] = protocol;
        }
      } else {
        var protocolWidthSlash = defaultProtocol + '://';
        groups[key] = defaultProtocol;

        if (groups.host) {
          // host exist
          groups.origin = protocolWidthSlash + groups.origin;
          groups.href = protocolWidthSlash + groups.href;
        }
      }
    } else if (key === 'host') {
      if (groups[key] !== undefined) {
        var _groups$key$split3 = groups[key].split(':'),
            _groups$key$split4 = _slicedToArray(_groups$key$split3, 2),
            hostname = _groups$key$split4[0],
            port = _groups$key$split4[1];

        groups.hostname = hostname;
        groups.port = port;
      }
    } else if (key === 'pathname') {
      if (groups[key] !== undefined && !groups[key].startsWith('/')) {
        groups[key] = '/' + groups[key];
      }
    }

    if (groups[key] === undefined) {
      groups[key] = '';
    }
  });
  return groups.origin || groups.tail ? groups : null;
};

var parseUrl = function parseUrl(str) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (str === undefined) return null;
  var res = URL_REG.exec(str);
  if (!res || res[0] !== str) return null;
  res = _objectSpread({
    href: res[0]
  }, res.groups);
  return execUrlNormalize(res, options);
};

var FULL_INFO_CACHE = new Map();

var getUrlFullInfo = function getUrlFullInfo(str, incomplete) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  if (!incomplete && FULL_INFO_CACHE.has(str)) return FULL_INFO_CACHE.get(str);
  var location = parseUrl(str, options);
  if (!location || !location.host && !location.pathname) return null;
  location.ext = '';

  if (!location.host && location.pathname || options.origins && options.origins.includes(location.origin)) {
    location.inside = true;
  } // empty ext regarded as source, though cgi


  if (!incomplete) {
    var ext = /\.([0-0a-z]+)$/i.exec(location.pathname);
    if (ext) location.ext = ext[1];
    FULL_INFO_CACHE.set(str, location);
  }

  return location;
};

var URL_STYLE_REG = /*#__PURE__*/_wrapRegExp(/url\(((["']?)((?:(?![ "'])[\s\S])+)\2)\)/i, {
  origin: 1,
  href: 3
});

var parseStyleUrl = function parseStyleUrl(str, test) {
  var res = URL_STYLE_REG.exec(str);
  if (!res) return null;
  var isValid = !test || testUrl(res.groups.href, true);
  return isValid ? res.groups : null;
};

var getExecResult = function getExecResult(str, reg) {
  var condition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var regG = new RegExp(reg, 'g');
  var result = [];
  var cur;

  while (cur = regG.exec(str)) {
    if (!cur[0]) break;

    if (typeof condition === 'function' ? condition(cur) : condition) {
      result.push(cur.groups);
    }
  }

  return result;
};

var execUrl = function execUrl(str) {
  return getExecResult(str, URL_REG);
};

var execStyleUrl = function execStyleUrl(str, test) {
  return getExecResult(str, URL_STYLE_REG, function (cur) {
    return !test || testUrl(cur.groups.href, true);
  });
};

var transformCgi = function transformCgi(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // use options
  if (typeof options.transformCgi === 'function') return options.transformCgi(url);
  var urlObj = url;

  if (_typeof(url) === 'object') {
    url = url.href || '';
  } else if (typeof url === 'string') {
    urlObj = getUrlFullInfo(url, true, options);
  } else {
    console.error("esrt transformCgi error! ".concat(_typeof(url)));
    console.error(url);
    throw new Error('url`s type must be object or string!');
  } // not url


  if (!urlObj) return url; // extra

  if (!urlObj.inside) return options.blockExtraUrl ? '' : url; // block path

  if (options.blockPaths.includes(urlObj.pathname)) return '';
  var l1Paths = Object.keys(options.l1PathMap); // don`t need to transform

  if (l1Paths.some(function (key) {
    return urlObj.pathname.indexOf(options.l1PathMap[key]) === 0;
  })) return url;
  var levelPaths = urlObj.pathname.split('/').filter(function (v) {
    return v;
  }); // can`t transform

  if (!l1Paths.includes(levelPaths[0])) return options.blockIntraUrl ? '' : url;
  levelPaths[0] = options.l1PathMap[levelPaths[0]];
  levelPaths[1] = options.l2PathMap[levelPaths[1]] || levelPaths[1];
  return levelPaths.join('/') + (urlObj.hash || urlObj.search);
};

module.exports = {
  testUrl: testUrl,
  parseUrl: parseUrl,
  getUrlFullInfo: getUrlFullInfo,
  parseStyleUrl: parseStyleUrl,
  execUrl: execUrl,
  execStyleUrl: execStyleUrl,
  transformCgi: transformCgi
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
(() => {
/*!******************************!*\
  !*** ./src/inject/inject.js ***!
  \******************************/
var _require = __webpack_require__(/*! ../utils/url-parser */ "./src/utils/url-parser.js"),
    transformCgi = _require.transformCgi;

window.CORE_OPTIONS = JSON.parse('__OPTIONS__');
CORE_OPTIONS.blockExtraUrl = true;

(function (global) {
  function replaceMethods() {
    var options = [{
      'target': XMLHttpRequest.prototype,
      'methodName': 'open',
      'urlArgIndex': 1
    }, {
      'target': global,
      'methodName': 'open',
      'urlArgIndex': 0
    }, {
      'target': XMLHttpRequest.prototype,
      'methodName': 'setRequestHeader',
      'customMethod': blockAjax
    }, {
      'target': XMLHttpRequest.prototype,
      'methodName': 'send',
      'customMethod': blockAjax
    }];
    options.forEach(replaceMethod);

    function log(action, source, style) {
      if (!global.console) return;
      var value = '%c[local]api ' + action + ': ' + source;
      style = Object.keys(style).reduce(function (value, cur) {
        return value + cur + ':' + style[cur] + ';';
      }, '');
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
          });
          return;
        }

        return oldMethod.apply(this, [].slice.call(arguments));
      };
    }

    function replaceMethod(option) {
      var oldMethod = option.target[option.methodName];

      if (typeof option.urlArgIndex === 'number') {
        option.target[option.methodName] = function () {
          var newUrl = transformCgi(arguments[option.urlArgIndex], CORE_OPTIONS);
          log('proxy', '', {
            'color': '#ff008a',
            'font-size': '14px'
          });
          log('origin', arguments[option.urlArgIndex], {
            'color': 'aqua',
            'font-size': '12px'
          });
          log('target', newUrl, {
            'color': '#69e147',
            'font-size': '12px'
          });
          arguments[option.urlArgIndex] = newUrl;
          if (arguments[option.urlArgIndex]) return oldMethod.apply(this, [].slice.call(arguments));
        };
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
})();

/******/ })()
;
//# sourceMappingURL=inject.development.js.map