const ts = require('typescript')
const {
  stringPlusToTemplateExpression,
  isMatchAccess,
  isIgnoreAccess,
  getAccess,
  isIgnoreFile,
  printNode,
} = require('utils/ast')
const core = require('core/index')
const { coreOptions, mockAccess } = require('test/helper')

describe('ast', () => {
  core.config(coreOptions.default, true)

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
    expect(isMatchAccess(accesses[0])).toBeTruthy()
    expect(isMatchAccess(accesses[0], true)).toBeFalsy()
    expect(isMatchAccess(accesses[1])).toBeTruthy()

    expect(isMatchAccess(accesses[2])).toBeFalsy()
    expect(isMatchAccess(accesses[3], true)).toBeTruthy()
    expect(isMatchAccess(accesses[3], true)).toBeTruthy()
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
    expect(isIgnoreAccess(accesses[0])).toBeTruthy()
    expect(isIgnoreAccess(accesses[0], true)).toBeFalsy()
    expect(isIgnoreAccess(accesses[1])).toBeTruthy()

    expect(isIgnoreAccess(accesses[2])).toBeFalsy()
    expect(isIgnoreAccess(accesses[3], true)).toBeTruthy()
    expect(isIgnoreAccess(accesses[3], true)).toBeTruthy()

    expect(isIgnoreAccess(accesses[4])).toBeTruthy()
    expect(isIgnoreAccess(accesses[5])).toBeFalsy()
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
    core.config({ ignorePath: /ignore\//i }, true)

    expect(isIgnoreFile('ignore/a')).toBeTruthy()

    expect(isIgnoreFile('a', '@local-ignore')).toBeFalsy()
    expect(isIgnoreFile('a', '// @local-ignore')).toBeTruthy()
    expect(isIgnoreFile('a', '/* @local-ignore */')).toBeTruthy()
    expect(isIgnoreFile('a', '@local-ignore', { sourcesContent: ['/* @local-ignore */'] })).toBeTruthy()
  })

  test('printNode', () => {
    const code = `// test\nlet a = 'a';`
    const sourceFile = ts.createSourceFile('temp', code, ts.ScriptTarget.Latest, true)
    expect(printNode(sourceFile.statements[0], sourceFile)).toBe(code)
    expect(printNode(sourceFile, sourceFile, 0).trim()).toBe(code)
  })
})
