class Changeset {
  constructor(sourceFile) {
    // {
    //   start: 0,
    //   end: 0,
    //   text: '',
    //   target: '',
    //   node: null,
    //   meta: null
    // }
    this.sourceFile = sourceFile
    this._changesets = []
  }

  get value() {
    return this._changesets.map((cs, i) => {
      const preCsEnd = i ? this._changesets[i - 1].end : 0
      return {
        relativeStart: cs.start - preCsEnd,
        relativeEnd: cs.end - preCsEnd,
        ...cs
      }
    })
  }

  add(cs) {
    // 不存在区间重合的情况
    const { start, end } = cs
    const index = this.findInsertIndex(start, end)
    this._changesets.splice(index, 0, cs)
  }

  findInsertIndex(start, end) {
    if (!this._changesets.length) return 0
    let s = 0
    let e = this._changesets.length - 1
    let i
    while (s <= e) {
      i = Math.floor((s + e) / 2)
      const startMt = i ? start >= this._changesets[i - 1].end : true
      if (startMt && end <= this._changesets[i].start) {
        s = i
        break
      } else if (!startMt) {
        e = i - 1
      } else {
        s = i + 1
      }
    }
    return s
  }
}

module.exports = Changeset