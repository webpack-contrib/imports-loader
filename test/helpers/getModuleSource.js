export default (name, stats) => {
  const { modules } = stats.toJson({ source: true });

  const module = modules.find((m) => m.name.indexOf(name) !== -1);

  return module.source;
};
