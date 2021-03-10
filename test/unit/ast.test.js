const ts = require('typescript')
const {
  stringPlusToTemplateExpression,
  isMatchAccess,
  isIgnoreAccess,
  getAccess,
  isIgnoreFile,
  printNode,
} = require('utils/ast')
const { ESRTCore } = require('index')
const { mockAccess } = require('test/helpers/mock')

const options = ESRTCore.genOptions(undefined, 'TEST2')

describe('ast', () => {
  test('stringPlusToTemplateExpression', () => {
    let sourceFile = ts.createSourceFile('temp', `'a' + b + \`c\``, ts.ScriptTarget.Latest, true)
    let templateExpr = stringPlusToTemplateExpression(sourceFile.statements[0].expression)
    expect(templateExpr.kind).toBe(ts.SyntaxKind.TemplateExpression)
    expect(templateExpr.head).toMatchObject({
      kind: ts.SyntaxKind.TemplateHead,
      text: 'a',
    })
    expect(templateExpr.templateSpans[0].expression).toMatchObject({
      kind: ts.SyntaxKind.Identifier,
      text: 'b',
    })
    expect(templateExpr.templateSpans[0].literal).toMatchObject({
      kind: ts.SyntaxKind.TemplateTail,
      text: 'c',
    })

    sourceFile = ts.createSourceFile('temp', 'a - 1', ts.ScriptTarget.Latest, true)
    expect(stringPlusToTemplateExpression(sourceFile.statements[0].expression)).toBe(undefined)
  })

  test('isMatchAccess', () => {
    const accesses = [
      mockAccess(['location', 'href']),
      mockAccess(['window', 'location', 'href']),
      mockAccess(['open']),
      mockAccess(['global', 'open']),
    ]
    expect(isMatchAccess(accesses[0], false, options)).toBeTruthy()
    expect(isMatchAccess(accesses[0], true, options)).toBeFalsy()
    expect(isMatchAccess(accesses[1], false, options)).toBeTruthy()

    expect(isMatchAccess(accesses[2], false, options)).toBeFalsy()
    expect(isMatchAccess(accesses[3], true, options)).toBeTruthy()
    expect(isMatchAccess(accesses[3], true, options)).toBeTruthy()
  })

  test('isIgnoreAccess', () => {
    const accesses = [
      mockAccess(['ignore', 'ignore']),
      mockAccess(['window', 'ignore', 'ignore']),
      mockAccess(['ignoreFunction']),
      mockAccess(['global', 'ignoreFunction']),
      mockAccess(['ignore', 'ignoreBlock']),
      mockAccess(['window', 'ignore', 'ignoreBlock']),
    ]
    expect(isIgnoreAccess(accesses[0], false, options)).toBeTruthy()
    expect(isIgnoreAccess(accesses[0], true, options)).toBeFalsy()
    expect(isIgnoreAccess(accesses[1], false, options)).toBeTruthy()

    expect(isIgnoreAccess(accesses[2], false, options)).toBeFalsy()
    expect(isIgnoreAccess(accesses[3], true, options)).toBeTruthy()
    expect(isIgnoreAccess(accesses[3], true, options)).toBeTruthy()

    expect(isIgnoreAccess(accesses[4], false, options)).toBeTruthy()
    expect(isIgnoreAccess(accesses[5], false, options)).toBeFalsy()
  })

  test('getAccess', () => {
    let node = ts.createPropertyAccess(ts.createPropertyAccess(ts.createIdentifier('a'), 'b'), 'c')
    let access = getAccess(node)
    expect(access).toHaveLength(3)
    expect(access[2]).toMatchObject({ text: 'c' })

    node = ts.createPropertyAccess(ts.createElementAccess(ts.createIdentifier('a'), 'b'), 'c')
    access = getAccess(node)
    expect(access[1]).toMatchObject({ text: 'b' })

    node = ts.createPropertyAccess(
      ts.createElementAccess(ts.createIdentifier('a'), ts.createTemplateExpression(ts.createTemplateHead('b'))),
      'c'
    )
    expect(getAccess(node)).toHaveLength(0)
  })

  test('isIgnoreFile', () => {
    options.transformerIgnorePathReg = /ignore\//i

    expect(isIgnoreFile('ignore/a', undefined, undefined, options)).toBeTruthy()

    expect(isIgnoreFile('a', '@esrt-ignore', undefined, options)).toBeFalsy()
    expect(isIgnoreFile('a', '// @esrt-ignore', undefined, options)).toBeTruthy()
    expect(isIgnoreFile('a', '/* @esrt-ignore */', undefined, options)).toBeTruthy()
    expect(isIgnoreFile('a', '@esrt-ignore', { sourcesContent: ['/* @esrt-ignore */'] }, options)).toBeTruthy()
  })

  test('printNode', () => {
    const code = `// test\nlet a = 'a';`
    const sourceFile = ts.createSourceFile('temp', code, ts.ScriptTarget.Latest, true)
    expect(printNode(sourceFile.statements[0], sourceFile)).toBe(code)
    expect(printNode(sourceFile, sourceFile, 0).trim()).toBe(code)
  })
})
