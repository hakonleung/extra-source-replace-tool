module.exports = (id, stats) => {
  const { modules } = stats.toJson({ source: true })
  const module = modules.find((m) => m.name.endsWith(id))
  let { source } = module

  source = source.replace(/\?\?.*!/g, '??[ident]!')

  return source
}
