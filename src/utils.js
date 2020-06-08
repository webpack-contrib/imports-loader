function renderImport(params) {
  const isCommonJs = params.type === 'commonjs';

  const importEntry =
    typeof params === 'string'
      ? { moduleName: params, list: { name: params, type: 'default' } }
      : { ...params };

  let { list } = importEntry;

  const { moduleName } = importEntry;

  // 1. Import-side-effect
  if (list === false) {
    return isCommonJs ? `require("${moduleName}");` : `import "${moduleName}";`;
  }

  list = Array.isArray(list) ? list : [list];

  let defaultImport = '';
  let namespaceImport = '';
  let namedImports = '';

  list.forEach((entry) => {
    const normalizedEntry =
      typeof entry === 'string' ? { name: entry, type: 'default' } : entry;

    // 2. Default import
    if (normalizedEntry.type === 'default' && normalizedEntry.name) {
      defaultImport += `${normalizedEntry.name}`;

      return;
    }

    // 3. Namespace import
    if (normalizedEntry.type === 'namespace' && normalizedEntry.name) {
      if (isCommonJs) {
        throw new Error('Commonjs not support namespace import');
      }

      namespaceImport += `* as ${normalizedEntry.name}`;

      return;
    }

    // 4. Named import
    if (normalizedEntry.name) {
      const sep = isCommonJs ? ': ' : ' as ';
      const comma = namedImports ? ', ' : '';

      namedImports += normalizedEntry.alias
        ? `${comma}${normalizedEntry.name}${sep}${normalizedEntry.alias}`
        : `${comma}${normalizedEntry.name}`;
    }
  });

  let notDefaultImport = namespaceImport;

  if (namedImports) {
    notDefaultImport = `{ ${namedImports} }`;
  }

  if (!defaultImport && !notDefaultImport) {
    throw new Error(`Not enough data to import \n${importEntry}`);
  }

  if (!isCommonJs) {
    const comma = defaultImport && notDefaultImport ? ', ' : '';

    return `import ${defaultImport}${comma}${notDefaultImport} from "${moduleName}";`;
  }

  if (defaultImport) {
    return `var ${defaultImport} = require("${moduleName}");`;
  }

  return `var { ${namedImports} } = require("${moduleName}");`;
}

export default renderImport;
