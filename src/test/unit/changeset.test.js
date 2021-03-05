const Changeset = require('utils/changeset')

describe('changeset', () => {
  let cs = new Changeset()
  const originData = [
    { start: 3, end: 4 },
    { start: 0, end: 1 },
    { start: 5, end: 10 },
  ]
  originData.forEach((v) => cs.add(v))

  test('normal range insert', () => {
    expect(cs._changesets).toHaveLength(3)

    expect(cs._changesets[0]).toMatchObject(originData[1])
    expect(cs._changesets[1]).toMatchObject(originData[0])
    expect(cs._changesets[2]).toMatchObject(originData[2])

    expect(cs.value[1]).toMatchObject({
      relativeStart: 2,
      relativeEnd: 3,
    })

    expect(cs.value[2]).toMatchObject({
      relativeStart: 1,
      relativeEnd: 6,
    })
  })

  test('contain range insert', () => {
    const containData = { start: 0, end: 5 }
    cs.add(containData)

    expect(cs._changesets).toHaveLength(2)

    expect(cs._changesets[0]).toMatchObject(containData)
    expect(cs._changesets[1]).toMatchObject(originData[2])
  })

  test('start is undefined', () => {
    const nodeData = { node: { pos: 0, end: 1 } }
    cs = new Changeset()
    cs.add(nodeData)

    expect(cs._changesets[0]).toMatchObject({
      start: nodeData.node.pos,
      end: nodeData.node.end,
    })

    expect(() => cs.add({})).toThrow()
  })
})
