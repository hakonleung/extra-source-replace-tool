module.exports = (id, stats, childName) => {
  stats = stats.toJson({ source: true })
  const { modules } = childName ? stats.children.find((c) => c.name === childName) : stats
  const module = modules.find((m) => m.name.endsWith(id))
  let { source } = module

  source = source.replace(/\?\?.*!/g, '??[ident]!')

  return source
}
