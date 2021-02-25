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
    if (cs.start === undefined) {
      cs.start = cs.node.pos
      cs.end = cs.node.end
    }
    const [index, replace] = this.findInsertIndex(cs.start, cs.end)
    this._changesets.splice(index, replace, cs)
  }

  findInsertIndex(start, end) {
    if (!this._changesets.length) return [0, 0]
    let s = 0
    let e = this._changesets.length - 1
    let i
    while (s <= e) {
      i = Math.floor((s + e) / 2)
      const startMt = i ? start >= this._changesets[i - 1].end : true
      if (start <= this._changesets[i].start && end >= this._changesets[i].end) {
        let t = i + 1
        while (t < this._changesets.length && end >= this._changesets[t].end) {
          t += 1
        }
        // 重叠区间，替换
        return [i, t - i]
      } else if (startMt && end <= this._changesets[i].start) {
        s = i
        break
      } else if (!startMt) {
        e = i - 1
      } else {
        s = i + 1
      }
    }
    return [s, 0]
  }
}

module.exports = Changeset