const ts = require('typescript')


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
};

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

  return false;
}

function stringPlusToTemplateExpression(exp: any): any {
  const isStringPlusExp = ts.isBinaryExpression(exp) && exp.operatorToken.kind === ts.SyntaxKind.PlusToken;
  if (!isStringPlusExp) return;

  let canTransform = true;
  // 检查是否满足条件，并将节点变成数组
  const nodes: Array<any> = [];
  function visit(node: any) {
    if (ts.isBinaryExpression(node)) {
      if (node.operatorToken.kind !== ts.SyntaxKind.PlusToken) {
        canTransform = false;
        return;
      }

      ts.forEachChild(node, visit);
    } else if (ts.isStringLiteral(node)) {
      nodes.push(node);
    } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
      nodes.push(node);
    } else if (node.kind !== ts.SyntaxKind.PlusToken) {
      nodes.push(node);
    }
  }

  ts.forEachChild(exp, visit);
  if (!canTransform || nodes.length < 2) return;


  // 预处理：保证变量一定是字符串间隔的，并将字符串中的$换成\\$
  const combined = nodes.reduce((pre: Array<any>, cur: any) => {
    if (ts.isStringLiteral(cur)) {
      if (typeof pre[pre.length - 1] === 'string') {
        pre[pre.length - 1] += cur.text;
      } else {
        pre.push(cur.text);
      }
    } else if (ts.isNoSubstitutionTemplateLiteral(cur)) {
      if (typeof pre[pre.length - 1] === 'string') {
        pre[pre.length - 1] += cur.rawText;
      } else {
        pre.push(cur.text);
      }
    } else {
      if (typeof pre[pre.length - 1] === 'string') pre.push(cur);
      else pre.push('', cur);
    }

    return pre;
  }, ['']).map(i => typeof i === 'string' ? i.replace(/\$/g, '\\$') : i);

  if (typeof combined[combined.length - 1] !== 'string') combined.push('');
  if (combined.length === 1) return ts.createStringLiteral(combined[0]);

  const head = ts.createTemplateHead(combined[0], combined[0]);
  const tspan: Array<any> = [];
  combined.forEach((node, index) => {
    if (index === 0) return;

    if (typeof node !== 'string') {
      let tail;
      if (index + 1 === combined.length - 1) {
        tail = ts.createTemplateTail(combined[index + 1], combined[index + 1]);
      } else {
        tail = ts.createTemplateMiddle(combined[index + 1], combined[index + 1])
      }
      tspan.push(ts.createTemplateSpan(node, tail));
    }
  });

  return ts.createTemplateExpression(head, tspan);
}

function initProcessor(sourceFile: any, options?: any) {
  function findReplaceRange(target) {
    const changeset: Array<any> = []

    options = Object.assign({
      prefix: '',
      ignoreLost: false,
      debug: false,
    }, options)

    const newAst = ts.transform(target, [(context) => (rootNode) => {

      function nodeVisitor(node): any {
        const ignoreResult = ignoreNode(node, sourceFile)
        if (ignoreResult !== false) {
          // options.debug && logger.debug(`[Ignore] reason: ${ignoreResult}, node: ` + ts.createPrinter().printNode(ts.EmitHint.Unspecified, node, sourceFile));
          return node
        }

        const processor = []
        processor.push(
          stringPlusProc,
          stringProc,
          templateProc,
          // 被ts-loader转换后不会有jsx了
          jsxTextProc
        )

        let result: any
        processor.some(proc => {
          result = proc(node)
          return !!result
        })

        if (result) {
          changeset.push(result)
          if (result.exIdentifier) {
            result.exIdentifier.forEach(i => {
              changeset.push({
                identifier: i.id,
                text: i.text,
              })
            })
          }
          return result.node
        }

        const visitBack = ts.visitEachChild(node, nodeVisitor, context)

        return visitBack
      }

      return ts.visitNode(rootNode, nodeVisitor)
    }])

    return { changeset, newAst }
  }


  /**
   * 将参数数组转换为对象的形式（容易查找对应代码）
   * @param args 参数节点数组
   */
  function arrayArgsToObject(args: Array<any>) {
    if (args.length === 0) return []

    const props: Array<any> = []
    args.forEach((arg, i) => {
      if (!arg) return;

      const lineCode = arg.end === -1 || arg.pos === -1 ? '' : sourceFile.text.substr(arg.pos, arg.end - arg.pos);
      if (ChineseRegex.test(lineCode)) {
        // 递归替换，这里直接替换
        const cs = findReplaceRange(arg);
        // @ts-ignore
        arg = cs.newAst.transformed[0];
      }
      props.push(ts.createPropertyAssignment(`${i}`, arg));
    });

    return [ts.createObjectLiteral(props)];
  }


  /**
   * 将中文提取为带占位符的字符串
   * 
   * @param text 带占位符的字符串
   * @param args 占位符对应的参数表达式列表
   */
  function wordToArgs(text: string, args: Array<any> = [], node: any, exIdentifier: Array<{ id: string, text: string }>, path?: string) {
    let targetText: string = text;
    const removeSet = new Set<number>();

    function _getChinese(matchText: string, tpl: string): string {
      const subArgs: Array<any> = [];
      if (/\{\d+\}/.test(matchText)) {
        matchText = matchText.replace(/\{(\d+)\}/g, ($0: string, $index: string) => {
          const i = parseInt($index);
          if (!args[i]) throw new Error(`Found placeholder in string "${matchText}", but lost its value.`);

          subArgs.push(args[i]);
          removeSet.add(i);
          return `{${subArgs.length - 1}}`;
        });
      }

      // debugger;
      const { identifier, call } = i18nCall(matchText, arrayArgsToObject(subArgs), node, options, path);
      if (identifier) {
        exIdentifier.push({
          id: identifier,
          text: matchText,
        });
      }
      args.push(call);
      return tpl.replace(/\{0\}/, `{${args.length - 1}}`);
    }

    // html
    if (/<.*?>/.test(text)) {
      // 非严格的html中文提取
      targetText = text
        .replace(/>([^<]+)</mg, ($0: string, $1: string) => {
          if (!ChineseRegex.test($1)) return $0;

          return _getChinese($1.trim(), `>{0}<`);
        })
        .replace(/(\w+)="([^"]+)"/mg, ($0, $name, $value) => {
          if (/^(id)$/.test($name)) return $0;
          if (!ChineseRegex.test($value)) return $0;

          return _getChinese($value, `${$name}="{0}"`);
        })
        .replace(/(\w+)='([^']+)'/mg, ($0, $name, $value) => {
          if (/^(id)$/.test($name)) return $0;
          if (!ChineseRegex.test($value)) return $0;

          return _getChinese($value, `${$name}='{0}'`);
        });
    }

    removeSet.forEach(i => args[i] = null);

    return targetText;
  }

  function traverseTemplateString(node: any, path: string, exIdentifier: Array<{ id: string, text: string }>) {
    const buf: Array<string> = [];
    const nextNode: { text: string, args: Array<any> } = {
      text: '',
      args: [],
    };
    let counter = 0;

    const visitor = function (chNode: any) {
      switch (chNode.kind) {
        case ts.SyntaxKind.TemplateHead:
          buf.push((<any>chNode).text, '{');
          break;
        case ts.SyntaxKind.TemplateMiddle:
          buf.push('}', (<any>chNode).text, '{');
          break;
        case ts.SyntaxKind.TemplateTail:
          buf.push('}', (<any>chNode).text);
          break;
        case ts.SyntaxKind.TemplateSpan:
          break;
        default:
          buf.push(`${counter++}`);
          nextNode.args.push(chNode);
          return;
      }
      ts.forEachChild(chNode, visitor);
    };

    ts.forEachChild(node, visitor);
    nextNode.text = wordToArgs(buf.join(''), nextNode.args, node, exIdentifier, path);
    return nextNode;
  }

  function toResObject(text: string, identifier: string, newNode: any, codeStart: number, codeEnd: number, exIdentifier?: Array<{ id: string, text: string }>) {
    if (!newNode) return;

    return {
      text,
      identifier,
      exIdentifier,
      start: codeStart,
      end: codeEnd,
      node: newNode,
      code: ts.createPrinter().printNode(ts.EmitHint.Unspecified, newNode, sourceFile),
    }
  }

  function stringPlusProc(node: any): any {
    const sourceFile = node.getSourceFile();
    // 字符串拼接转模版字符串
    const templateAst = stringPlusToTemplateExpression(node);
    if (templateAst) {
      let result: any;
      if (ts.isTemplateExpression(templateAst)) {
        result = templateProc(templateAst, sourceFile.fileName);
        if (!result) return;
      } else {
        result = stringProc(templateAst, sourceFile.fileName);
        if (!result) return;
      }

      result.start = node.pos === -1 ? -1 : node.pos;
      result.end = node.end;
      return result;
    }
  }

  function stringProc(node: any, path?: string): any {
    // 普通字符串
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && ChineseRegex.test(node.text) && !cssDetect(node.text)) {
      const args: Array<any> = [];
      const exIdentifier: Array<{ id: string, text: string }> = [];
      const text = wordToArgs(node.text, args, node, exIdentifier, path);

      if (node.parent && ts.isJsxAttribute(node.parent)) {
        
        const { identifier, call } = i18nCall(text, [], node, options, path);

        return toResObject(text, identifier, ts.createJsxExpression(undefined, call), node.pos === -1 ? -1 : node.pos, node.end, exIdentifier);
      } else {
        let wrapLineText = text;
        if (!ts.isNoSubstitutionTemplateLiteral(node)) {
          wrapLineText = text.replace(/\n/mg, '\\n');
        }
        const { identifier, call } = i18nCall(wrapLineText, arrayArgsToObject(args), node, options, path);

        return toResObject(text, identifier, call, node.pos === -1 ? -1 : node.pos, node.end, exIdentifier);
      }

    }
  }

  // 传递path是因为模版语法的node可能是生成的临时node，无法取得原始文件
  function templateProc(node: any, filePath?: string): any {
    // 模版字符串
    if (ts.isTemplateExpression(node)) {
      const rawTplText = ts.createPrinter({
        removeComments: true, // 防止下面中文正则匹配时匹配了注释上的中文
      }).printNode(4, node, sourceFile);
      if (!ChineseRegex.test(rawTplText)) return;
      const path = filePath ? filePath : node.getSourceFile().fileName;
      const exIdentifier: Array<{ id: string, text: string }> = [];
      const tplSplitResult = traverseTemplateString(node, path, exIdentifier);
      const text = tplSplitResult.text;

      const { identifier, call } = i18nCall(
        text,
        arrayArgsToObject(tplSplitResult.args),
        node,
        options,
        path,
      );

      return toResObject(text, identifier, call, node.pos === -1 ? -1 : node.pos, node.end, exIdentifier);
    }

    // return genResult();
  }

  function jsxTextProc(node): any {
    // jsx text
    if (ts.isJsxText(node) && ChineseRegex.test(node.text)) {
      const text = node.text.trim();
      const leadingWhitespace = (/^\s+/.exec(node.text) || [''])[0];
      const tailingWhitespace = (/\s+$/.exec(node.text) || [''])[0];
      const sourceFile = node.getSourceFile();
      const { identifier, call } = i18nCall(text, [], node, options);

      const retNode = ts.createJsxExpression(undefined, call);
      return toResObject(
        text, 
        identifier, 
        retNode, 
        /* start */node.pos === -1 ? -1 : node.pos + leadingWhitespace.length, 
        /* end */node.end - tailingWhitespace.length
      );
    }
  }


  return findReplaceRange;
}

class TsTransform {
  filename: string
  code: string
  sourceFile: any
  processor: (sourceFile: any, options?: any) => any
  changeset: Array<any>
  transformedCode: string
  constructor(filename, code, options) {
    this.filename = filename
    this.code = code
    this.sourceFile = ts.createSourceFile(
      filename,
      code,
      ts.ScriptTarget.Latest,
      /*setParentNodes */ true
    )
    this.processor = initProcessor(this.sourceFile, Object.assign({}, options))
    this.transform(options)
  }

  transform(options) {
    const { changeset } = this.processor(this.sourceFile)
    let transformedCode = this.code
    
    if (changeset.length > 0 && this.filename) {
      // logger.replace(`file: ${this.filename}\n`);
    }
  
    changeset
      .filter(i => Number.isInteger(i.start))
      .sort((a, b) => b.start - a.start)
      .filter((word, index, array) => {
        if (!word.node) return true;
        
        // 去掉重叠部分
        return !array.some(i => i.start < word.start && word.end <= i.end);
      })
      .forEach(word => {
        if (!word.node) return true;
  
        const source = transformedCode.substr(word.start, word.end - word.start);
        const space = source.match(/^\s+/) || ['']; // 恢复前导空格
  
        // logger.replace(`from: ${source.trim()}`);
        // logger.replace(`to: ${word.code}\n`);
  
        transformedCode = transformedCode.substr(0, word.start) + space[0] + word.code + transformedCode.substr(word.end);
      })
  
    this.changeset = changeset
    this.transformedCode = transformedCode
  }
}

module.exports = TsTransform