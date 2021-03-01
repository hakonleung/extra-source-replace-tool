const ts = require('typescript')
const core = require('../core')

function stringPlusToTemplateExpression(exp) {
  const isStringPlusExp = node => ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken

  if (!isStringPlusExp(exp)) return
  let canTransform = true
  // 检查是否满足条件，并将节点变成数组
  const nodes = []
  function visit(node) {
    if (ts.isBinaryExpression(node)) {
      if (node.operatorToken.kind !== ts.SyntaxKind.PlusToken) {
        canTransform = false
        return
      }

      ts.forEachChild(node, visit)
    } else if (ts.isStringLiteral(node)) {
      nodes.push(node)
    } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
      nodes.push(node)
    } else if (node.kind !== ts.SyntaxKind.PlusToken) {
      nodes.push(node)
    }
  }

  ts.forEachChild(exp, visit)
  if (!canTransform || nodes.length < 2) return


  // 预处理：保证变量一定是字符串间隔的
  const combined = nodes.reduce((pre, cur) => {
    if (ts.isStringLiteral(cur)) {
      if (typeof pre[pre.length - 1] === 'string') {
        pre[pre.length - 1] += cur.text
      } else {
        pre.push(cur.text)
      }
    } else if (ts.isNoSubstitutionTemplateLiteral(cur)) {
      if (typeof pre[pre.length - 1] === 'string') {
        pre[pre.length - 1] += cur.rawText
      } else {
        pre.push(cur.text)
      }
    } else {
      if (typeof pre[pre.length - 1] === 'string') pre.push(cur)
      else pre.push('', cur)
    }

    return pre
  }, [''])

  if (typeof combined[combined.length - 1] !== 'string') combined.push('')
  if (combined.length === 1) return ts.createStringLiteral(combined[0])

  const head = ts.createTemplateHead(combined[0], combined[0])
  const tspan = []
  combined.forEach((node, index) => {
    if (index === 0) return

    if (typeof node !== 'string') {
      let tail;
      if (index + 1 === combined.length - 1) {
        tail = ts.createTemplateTail(combined[index + 1], combined[index + 1])
      } else {
        tail = ts.createTemplateMiddle(combined[index + 1], combined[index + 1])
      }
      tspan.push(ts.createTemplateSpan(node, tail))
    }
  })

  return ts.createTemplateExpression(head, tspan)
}

const matchAccess = (access, validAccesses) => {
  const { global, globalAlias } = core.options
  return access && access.length > 0 && validAccesses.some(validAccess => {
    let validStart = 0
    let accessStart = 0
    if (validAccess[0] === global) {
      validStart = 1
      if (access[0].text === global || globalAlias.includes(access[0].text)) {
        accessStart = 1
      }
    }
    const compareValidAccess = validAccess.slice(validStart)
    const compareAccess = access.slice(accessStart)
    return compareValidAccess.length === compareAccess.length && compareAccess.every((v, i) => v.text === compareValidAccess[i])
  })
}

const isMatchAccess = (access, isCallExpression) => {
  const { matchBinaryAccesses, matchCallAccesses } = core.options
  return matchAccess(access, isCallExpression ? matchCallAccesses : matchBinaryAccesses)
}

const isIgnoreAccess = (access, isCallExpression) => {
  const { ignoreBinaryAccesses, ignoreCallAccesses } = core.options
  return matchAccess(access, isCallExpression ? ignoreCallAccesses : ignoreBinaryAccesses)
}

const getAccess = (node) => {
  // get property access
  const access = []
  while (node) {
    // property && element access expression
    // only support identifier and string name
    if (ts.isIdentifier(node)) {
      access.unshift(node)
    } else if (node.name && ts.isIdentifier(node.name)) {
      access.unshift(node.name)
    } else if (node.argumentExpression) {
      if (ts.isStringLiteral(node.argumentExpression)) {
        access.unshift(node.argumentExpression)
      } else {
        // not support
        return []
      }
    }
    node = node.expression
  }
  return access
}

const isIgnoreFile = (source, map, filename) => {
  const { options } = core
  if (filename && options.ignorePath && options.ignorePath.test(filename)) return true
  const realSource = map && map.sourcesContent && map.sourcesContent.length > 0 ? map.sourcesContent[0].trim() : source
  const leadingComment = /^\/\/.*|^\/\*[\s\S]+?\*\//.exec(realSource)
  return leadingComment && /@local-ignore/.test(leadingComment[0])
}

const printNode = (node, sourceFile, hint = ts.EmitHint.Unspecified) => {
  try {
    return ts.createPrinter().printNode(hint, node, sourceFile)
  } catch (err) {
    debugger
  }
}

module.exports = {
  stringPlusToTemplateExpression,
  isMatchAccess,
  isIgnoreAccess,
  getAccess,
  isIgnoreFile,
  printNode
}