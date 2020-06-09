import { stringifyRequest } from 'loader-utils';

function getImports(options) {
  const { imports, additionalCode, wrapper } = options;
  const moduleImports = Array.isArray(imports) ? imports : [imports];

  if (!imports && !additionalCode && !wrapper) {
    throw new Error(
      `You must fill out one of the options "imports", "wrapper" or "additionalCode"`
    );
  }

  if (!imports) {
    return [];
  }

  const result = [];

  for (const params of moduleImports) {
    const isCommonJs = params.type === 'commonjs';

    const importsEntry =
      typeof params === 'string'
        ? { moduleName: params, list: { name: params, type: 'default' } }
        : { ...params };

    let { list } = importsEntry;

    if (list === false) {
      result.push(importsEntry);
      break;
    }

    list = Array.isArray(list) ? list : [list];

    importsEntry.list = list.map((entry) => {
      const normalizedEntry =
        typeof entry === 'string' ? { name: entry, type: 'default' } : entry;

      // 2. Default import
      if (normalizedEntry.type === 'default') {
        if (!normalizedEntry.name) {
          throw new Error(`Skipped the "name" option for default import`);
        }

        return normalizedEntry;
      }

      // 3. Namespace import
      if (normalizedEntry.type === 'namespace') {
        if (isCommonJs) {
          throw new Error('Commonjs not support namespace import');
        }

        if (!normalizedEntry.name) {
          throw new Error(`Skipped the "name" option for namespace import`);
        }

        return normalizedEntry;
      }

      // 4. Named import
      if (!normalizedEntry.name) {
        throw new Error(`Skipped the "name" option for named import`);
      }

      return normalizedEntry;
    });

    result.push(importsEntry);
  }

  return result;
}

function renderImports(loaderContext, importsEntry) {
  const isCommonJs = importsEntry.type === 'commonjs';
  const { list, moduleName } = importsEntry;

  // 1. Import-side-effect
  if (list === false) {
    return isCommonJs
      ? `require(${stringifyRequest(loaderContext, moduleName)});`
      : `import ${stringifyRequest(loaderContext, moduleName)};`;
  }

  let defaultImport = '';
  let namespaceImport = '';
  let namedImports = '';

  list.forEach((entry) => {
    // 2. Default import
    if (entry.type === 'default') {
      defaultImport += `${entry.name}`;

      return;
    }

    // 3. Namespace import
    if (entry.type === 'namespace') {
      namespaceImport += `* as ${entry.name}`;

      return;
    }

    // 4. Named import
    const sep = isCommonJs ? ': ' : ' as ';
    const comma = namedImports ? ', ' : '';

    namedImports += entry.alias
      ? `${comma}${entry.name}${sep}${entry.alias}`
      : `${comma}${entry.name}`;
  });

  let notDefaultImport = namespaceImport;

  if (namedImports) {
    notDefaultImport = `{ ${namedImports} }`;
  }

  if (!isCommonJs) {
    const comma = defaultImport && notDefaultImport ? ', ' : '';

    return `import ${defaultImport}${comma}${notDefaultImport} from ${stringifyRequest(
      loaderContext,
      moduleName
    )};`;
  }

  let commonjsImports = '';

  if (defaultImport) {
    commonjsImports += `var ${defaultImport} = require(${stringifyRequest(
      loaderContext,
      moduleName
    )});`;
  }

  if (!namedImports) {
    return commonjsImports;
  }

  commonjsImports += commonjsImports ? '\n' : '';

  commonjsImports += `var { ${namedImports} } = require(${stringifyRequest(
    loaderContext,
    moduleName
  )});`;

  return commonjsImports;
}

export { getImports, renderImports };
