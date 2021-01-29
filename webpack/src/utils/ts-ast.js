const ts = require('typescript')

class TsTransform {
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
  
        logger.replace(`from: ${source.trim()}`);
        logger.replace(`to: ${word.code}\n`);
  
        transformedCode = transformedCode.substr(0, word.start) + space[0] + word.code + transformedCode.substr(word.end);
      });
  
    // if (changeset.length > 0) {
    //   if (/\.(ts|tsx)$/.test(this.filename)) {
    //     transformedCode = `import * as I18N from '${pkgName}'; ${transformedCode}`
    //   } else {
    //     transformedCode = `const I18N = require('${pkgName}'); ${transformedCode}`
    //   }
    // }
  
    this.changeset = changeset
    this.transformedCode = transformedCode
  }
}

module.exports = TsTransform