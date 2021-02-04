const ts = require('typescript')
const templateTransform = require('./template-transform')
const { getUrlFullInfo } = require('../utils/url-parser')
const {
  stringPlusToTemplateExpression,
  getAccess
} = require('../utils/ast-node-transform')
const Changeset = require('./changeset')

const keywords = 'align-content align-items align-self all animation animation-delay animation-direction animation-duration animation-fill-mode animation-iteration-count animation-name animation-play-state animation-timing-function backface-visibility background background-attachment background-blend-mode background-clip background-color background-image background-origin background-position background-repeat background-size border border-bottom border-bottom-color border-bottom-left-radius border-bottom-right-radius border-bottom-style border-bottom-width border-collapse border-color border-image border-image-outset border-image-repeat border-image-slice border-image-source border-image-width border-left border-left-color border-left-style border-left-width border-radius border-right border-right-color border-right-style border-right-width border-spacing border-style border-top border-top-color border-top-left-radius border-top-right-radius border-top-style border-top-width border-width bottom box-decoration-break box-shadow box-sizing break-after break-before break-inside caption-side caret-color @charset clear clip color column-count column-fill column-gap column-rule column-rule-color column-rule-style column-rule-width column-span column-width columns content counter-increment counter-reset cursor direction display empty-cells filter flex flex-basis flex-direction flex-flow flex-grow flex-shrink flex-wrap float font @font-face font-family font-feature-settings @font-feature-values font-kerning font-language-override font-size font-size-adjust font-stretch font-style font-synthesis font-variant font-variant-alternates font-variant-caps font-variant-east-asian font-variant-ligatures font-variant-numeric font-variant-position font-weight grid grid-area grid-auto-columns grid-auto-flow grid-auto-rows grid-column grid-column-end grid-column-gap grid-column-start grid-gap grid-row grid-row-end grid-row-gap grid-row-start grid-template grid-template-areas grid-template-columns grid-template-rows hanging-punctuation height hyphens image-rendering @import isolation justify-content @keyframes left letter-spacing line-break line-height list-style list-style-image list-style-position list-style-type margin margin-bottom margin-left margin-right margin-top max-height max-width @media min-height min-width mix-blend-mode object-fit object-position opacity order orphans outline outline-color outline-offset outline-style outline-width overflow overflow-wrap overflow-x overflow-y padding padding-bottom padding-left padding-right padding-top page-break-after page-break-before page-break-inside perspective perspective-origin pointer-events position quotes resize right scroll-behavior tab-size table-layout text-align text-align-last text-combine-upright text-decoration text-decoration-color text-decoration-line text-decoration-style text-indent text-justify text-orientation text-overflow text-shadow text-transform text-underline-position top transform transform-origin transform-style transition transition-delay transition-duration transition-property transition-timing-function unicode-bidi user-select vertical-align visibility white-space widows width word-break word-spacing word-wrap writing-mode z-index box-orient box-align box-pack'.split(' ')

const totalSet = new Set([...keywords])

function cssDetect(code) {
  if (code.length < 100) return false

  let c = 0
  let matchedLength = 0
  const regGroup = code.match(/\b[\w-]+?:[^;\n]+/gm)
  if (!regGroup) return false

  for (let i = 0; i < regGroup.length; i++) {
    matchedLength += regGroup[i].length

    const s = regGroup[i].split(':')[0]
    if (s && totalSet.has(s.replace(/^webkit-/, ''))) c += 1
  }

  if (regGroup.length > 0) {
    return c / regGroup.length > 0.7 && matchedLength / code.length > 0.4
  }

  return false
}

const IgnoreType = {
  Console: 'Console',
  Log: 'Log',
  I18N: 'I18N',
  SpeedReportLog: 'SpeedReportLog',
  ErrorExp: 'ErrorExp',
  TypeNode: 'TypeNode',
  IdAttribute: 'IdAttribute',
  Property: 'Property',
  Enum: 'Enum',
  IgnoreComment: 'IgnoreComment',
}

/**
 * 需要忽略的节点
 * @param node 
 */
function ignoreNode(node, sourceFile) {
  // ignore console
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
    (
      /^console\./.test(ts.createPrinter().printNode(ts.EmitHint.Unspecified, node.expression, sourceFile).trim()) ||
      /^window.console\./.test(ts.createPrinter().printNode(ts.EmitHint.Unspecified, node.expression, sourceFile).trim()) ||
      /^__console\./.test(ts.createPrinter().printNode(ts.EmitHint.Unspecified, node.expression, sourceFile).trim()) ||
      /^window.__console\./.test(ts.createPrinter().printNode(ts.EmitHint.Unspecified, node.expression, sourceFile).trim()) ||
      /^window.__log\./.test(ts.createPrinter().printNode(ts.EmitHint.Unspecified, node.expression, sourceFile).trim()) ||
      false
    )) {
    return IgnoreType.Console
  }
  // type definition
  if (ts.isTypeNode(node)) return IgnoreType.TypeNode

  // ignore console
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
    (
      node.expression.name.escapedText === 'log'
    )) {
    return IgnoreType.Log;
  }
  // excel的时间log定义
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'SPEED_REPORT_LOG') return IgnoreType.SpeedReportLog
  // ignore Error
  if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'Error') return IgnoreType.ErrorExp
  // // 对象属性名允许中文
  // if (node.parent && ts.isPropertyAssignment(node.parent) && node === node.parent.name) return IgnoreType.Property;
  // 忽略enum定义，如有需要请自行处理
  if (ts.isEnumDeclaration(node)) return IgnoreType.Enum;
  // 特殊注释 @i18n-ignore，忽略下一行
  const comments = sourceFile.getFullText().substr(node.getFullStart(), node.getStart(sourceFile) - node.getFullStart())
  if (/@local-ignore/.test(comments)) return IgnoreType.IgnoreComment

  return false
}

class TsProcessor {
  constructor(sourceFile, options) {
    this.sourceFile = sourceFile
    this.options = options
  }

  getChangeset(root = this.sourceFile, onlyChild) {
    const changeset = new Changeset(this.sourceFile)
    const nodeVisitor = (node) => {
      const result = this.process(node)

      if (result) {
        changeset.add(result)
        return
      }

      ts.forEachChild(node, nodeVisitor)
    }
    
    ts[onlyChild ? 'forEachChild' : 'visitNode'](root, nodeVisitor)
    return changeset
  }

  process(node) {
    let result = null
    ;[
      this.expressionProc,
      this.stringPlusProc,
      this.stringProc,
    ].some(proc => result = proc.call(this, node))

    if (result) {
      if (result.start === undefined) {
        result.start = result.node.pos
        result.end = result.node.end
      }
      result.code = ts.createPrinter().printNode(ts.EmitHint.Unspecified, result.node, this.sourceFile)
    }

    return result
  }

  stringPlusProc(node) {
    const templateAst = stringPlusToTemplateExpression(node)
    if (templateAst) {
      const result = this.stringProc(templateAst)
      if (!result) return
      result.start = node.pos
      result.end = node.end
      return result
    }
  }

  stringProc(node) {
    let text = ''
    let incomplete = false
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      text = node.text
    } else if (ts.isTemplateExpression(node)) {
      text = node.head.text
      incomplete = true
    }
    let location
    return text && (location = getUrlFullInfo(text, incomplete)) && {
      node,
      text,
      location,
    } || null
  }

  expressionProc(node) {
    const isBinaryExpression = ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
    const isCallExpression = ts.isCallExpression(node)
    let accessEntry
    let argsEntry
    
    if (isBinaryExpression || isCallExpression) {
      if (isBinaryExpression) {
        accessEntry = 'left'
        argsEntry = 'right'
      } else {
        accessEntry = 'expression'
        argsEntry = 'arguments'
      }
      const access = getAccess(node[accessEntry], true, isCallExpression)
      if (!access.length) return null
      const child = (node[argsEntry] instanceof Array ? node[argsEntry] : [node[argsEntry]]).map(v => this.getChangeset(v))
      if (child.length) {
        return { node, access, child }
      }
    }
    return null
  }
}

module.exports = TsProcessor