const ts = require('typescript')
const { getUrlFullInfo, execStyleUrl } = require('../../utils/url-parser')
const { getAccess, isMatchAccess, isIgnoreAccess, printNode } = require('../../utils/ast')
const Changeset = require('../../utils/changeset')

const keywords = 'align-content align-items align-self all animation animation-delay animation-direction animation-duration animation-fill-mode animation-iteration-count animation-name animation-play-state animation-timing-function backface-visibility background background-attachment background-blend-mode background-clip background-color background-image background-origin background-position background-repeat background-size border border-bottom border-bottom-color border-bottom-left-radius border-bottom-right-radius border-bottom-style border-bottom-width border-collapse border-color border-image border-image-outset border-image-repeat border-image-slice border-image-source border-image-width border-left border-left-color border-left-style border-left-width border-radius border-right border-right-color border-right-style border-right-width border-spacing border-style border-top border-top-color border-top-left-radius border-top-right-radius border-top-style border-top-width border-width bottom box-decoration-break box-shadow box-sizing break-after break-before break-inside caption-side caret-color @charset clear clip color column-count column-fill column-gap column-rule column-rule-color column-rule-style column-rule-width column-span column-width columns content counter-increment counter-reset cursor direction display empty-cells filter flex flex-basis flex-direction flex-flow flex-grow flex-shrink flex-wrap float font @font-face font-family font-feature-settings @font-feature-values font-kerning font-language-override font-size font-size-adjust font-stretch font-style font-synthesis font-variant font-variant-alternates font-variant-caps font-variant-east-asian font-variant-ligatures font-variant-numeric font-variant-position font-weight grid grid-area grid-auto-columns grid-auto-flow grid-auto-rows grid-column grid-column-end grid-column-gap grid-column-start grid-gap grid-row grid-row-end grid-row-gap grid-row-start grid-template grid-template-areas grid-template-columns grid-template-rows hanging-punctuation height hyphens image-rendering @import isolation justify-content @keyframes left letter-spacing line-break line-height list-style list-style-image list-style-position list-style-type margin margin-bottom margin-left margin-right margin-top max-height max-width @media min-height min-width mix-blend-mode object-fit object-position opacity order orphans outline outline-color outline-offset outline-style outline-width overflow overflow-wrap overflow-x overflow-y padding padding-bottom padding-left padding-right padding-top page-break-after page-break-before page-break-inside perspective perspective-origin pointer-events position quotes resize right scroll-behavior tab-size table-layout text-align text-align-last text-combine-upright text-decoration text-decoration-color text-decoration-line text-decoration-style text-indent text-justify text-orientation text-overflow text-shadow text-transform text-underline-position top transform transform-origin transform-style transition transition-delay transition-duration transition-property transition-timing-function unicode-bidi user-select vertical-align visibility white-space widows width word-break word-spacing word-wrap writing-mode z-index box-orient box-align box-pack'.split(
  ' '
)

const totalSet = new Set([...keywords])

function cssDetect(code) {
  if (code.length < 50) return false

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
  Import: 'Import',
  Require: 'Require',
  ImportKeyword: 'ImportKeyword',
  Export: 'Export',
}

/**
 * 需要忽略的节点
 * @param node
 */
function isIgnoreNode(node, sourceFile) {
  if (ts.isImportDeclaration(node)) {
    return IgnoreType.Import
  }
  if (ts.isExportDeclaration(node)) {
    return IgnoreType.Export
  }
  // ignore console
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    /^(window\.)?((__)?console|__log)\./.test(printNode(node.expression, sourceFile).trim())
  ) {
    return IgnoreType.Console
  }
  if (ts.isCallExpression(node) && ts.isImportKeyword(node.expression)) return IgnoreType.ImportKeyword
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.escapedText === 'require')
    return IgnoreType.Require
  // type definition
  if (ts.isTypeNode(node)) return IgnoreType.TypeNode
  // ignore console
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.escapedText === 'log'
  )
    return IgnoreType.Log
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'SPEED_REPORT_LOG')
    return IgnoreType.SpeedReportLog
  // Error
  if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'Error')
    return IgnoreType.ErrorExp
  // Property
  if (node.parent && ts.isPropertyAssignment(node.parent) && node === node.parent.name) return IgnoreType.Property
  // Enum
  if (ts.isEnumDeclaration(node)) return IgnoreType.Enum
  // specific comment
  const comments = sourceFile.getFullText().substr(node.getFullStart(), node.getStart(sourceFile) - node.getFullStart())
  if (/@local-ignore/.test(comments)) return IgnoreType.IgnoreComment

  return false
}

class TsProcessor {
  constructor(sourceFile, options) {
    this.sourceFile = sourceFile
    this.options = options
    this.jsxAttribute = null

    this.traverseFuncs = [this.traverseExpression, this.traverseStringPlus, this.traverseString]
  }

  traverse(root = this.sourceFile, changeset = new Changeset(this.sourceFile)) {
    const ast = ts.transform(
      root,
      [
        (context) => (root) => {
          const nodeVisitor = (node) => {
            if (isIgnoreNode(node, this.sourceFile)) return node
            if (!this.jsxAttribute && ts.isJsxAttribute(node)) this.jsxAttribute = node
            let res
            this.traverseFuncs.some((f) => (res = f.call(this, node, changeset)))
            if (res) {
              if (res.ignore) return node
              return res.node
            }
            res = ts.visitEachChild(node, nodeVisitor, context)
            if (this.jsxAttribute === node) this.jsxAttribute = null
            return res
          }
          return ts.visitNode(root, nodeVisitor)
        },
      ],
      { jsx: ts.JsxEmit.React }
    )
    return { node: ast.transformed[0], changeset }
  }

  traverseString(expr, changeset, incomplete = false) {
    let text = ''
    let location
    let cs
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
      text = expr.text
      if (
        (this.jsxAttribute && this.jsxAttribute.name.text === 'style' && ts.isPropertyAssignment(expr.parent)) ||
        cssDetect(text)
      ) {
        const locations = execStyleUrl(text, true)
        if (!locations.length) return
        cs = { node: expr, text, locations }
      }
    } else if (ts.isTemplateExpression(expr)) {
      text = expr.head.text
      incomplete = true
    } else {
      return
    }
    if (!cs && text && (location = getUrlFullInfo(text, incomplete, this.options))) {
      cs = { node: expr, text, location }
    }
    if (cs) {
      changeset.add(cs)
    }
    return { node: expr, changeset }
  }

  traverseStringPlus(expr, changeset) {
    const isStringPlusExp = (node) => ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken
    if (!isStringPlusExp(expr)) return
    const ast = ts.transform(expr, [
      (context) => (root) => {
        const handler = (node) => {
          if (!isStringPlusExp(node)) return this.traverse(node, changeset).node
          if (
            (ts.isStringLiteral(node.left) || ts.isNoSubstitutionTemplateLiteral(node.left)) &&
            (ts.isStringLiteral(node.right) || ts.isNoSubstitutionTemplateLiteral(node.right))
          ) {
            const textNode = new ts.createStringLiteral(node.left.text + node.right.text)
            textNode.parent = node.parent
            textNode.pos = node.left.pos
            textNode.end = node.right.end
            this.traverseString(textNode, changeset)
            return textNode
          } else if (
            ts.isStringLiteral(node.left) ||
            ts.isNoSubstitutionTemplateLiteral(node.left) ||
            ts.isTemplateExpression(node.left)
          ) {
            this.traverseString(node.left, changeset)
            return node
          }
        }
        const nodeVisitor = (node) => {
          let newNode = handler(node)
          if (newNode) return newNode
          newNode = ts.visitEachChild(node, nodeVisitor, context)
          return handler(newNode) || newNode
        }
        return ts.visitNode(root, nodeVisitor)
      },
    ])
    return { node: ast.transformed[0], changeset }
  }

  traverseExpression(expr, changeset) {
    const isBinaryExpression = ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.EqualsToken
    const isCallExpression = ts.isCallExpression(expr)

    if (!isBinaryExpression && !isCallExpression) return

    let accessEntry
    let argsEntry

    if (isBinaryExpression) {
      accessEntry = 'left'
      argsEntry = 'right'
    } else {
      accessEntry = 'expression'
      argsEntry = 'arguments'
    }
    const access = getAccess(expr[accessEntry])
    if (isIgnoreAccess(access, isCallExpression)) return { ignore: true }
    if (!isMatchAccess(access, isCallExpression)) return
    const child = expr[argsEntry] instanceof Array ? expr[argsEntry][0] : expr[argsEntry]
    if (!child) return
    let childChangeset = new Changeset(this.sourceFile)
    let childRes = this.traverse(child, childChangeset)

    if (childRes) {
      if (expr[argsEntry] instanceof Array) {
        expr[argsEntry][0] = childRes.node
      } else {
        expr[argsEntry] = childRes.node
      }
      changeset.add({ node: expr, access, child: childChangeset })
      return { node: expr, changeset }
    }
  }
}

module.exports = TsProcessor
