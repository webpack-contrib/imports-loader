import { stringifyRequest } from 'loader-utils';

function resolveImports(type, item) {
  let result;

  if (typeof item === 'string') {
    const splittedItem = item.split(' ');

    if (splittedItem.length > 4) {
      throw new Error(`Invalid "${item}" for import`);
    }

    if (splittedItem.length === 1) {
      result = {
        type,
        syntax: 'default',
        moduleName: splittedItem[0],
        name: splittedItem[0],
        // eslint-disable-next-line no-undefined
        alias: undefined,
      };
    } else {
      result = {
        syntax: splittedItem[0],
        moduleName: splittedItem[1],
        name: splittedItem[2],
        // eslint-disable-next-line no-undefined
        alias: splittedItem[3] ? splittedItem[3] : undefined,
      };
    }
  } else {
    result = { syntax: 'default', ...item };

    if (result.syntax === 'default' && !result.name) {
      result.name = result.moduleName;
    }
  }

  if (!result.moduleName) {
    throw new Error(
      `The import should have "moduleName" option in "${item}" value`
    );
  }

  if (
    ['default', 'side-effect'].includes(result.syntax) &&
    typeof result.alias !== 'undefined'
  ) {
    throw new Error(
      `The "${result.syntax}" syntax can't have "${result.alias}" alias in "${item}" value`
    );
  }

  if (
    ['side-effect'].includes(result.syntax) &&
    typeof result.name !== 'undefined'
  ) {
    throw new Error(
      `The "${result.syntax}" syntax can't have "${result.name}" name in "${item}" value`
    );
  }

  if (['namespace'].includes(result.syntax) && type === 'commonjs') {
    throw new Error(
      `The "commonjs" type not support "namespace" syntax import in "${item}" value`
    );
  }

  if (
    ['namespace', 'named'].includes(result.syntax) &&
    typeof result.name === 'undefined'
  ) {
    throw new Error(
      `The "${result.syntax}" syntax should have "name" option in "${item}" value`
    );
  }

  return result;
}

function getImports(type, imports) {
  let result = [];

  if (typeof imports === 'string') {
    result.push(resolveImports(type, imports));
  } else {
    result = [].concat(imports).map((item) => resolveImports(type, item));
  }

  const sortedResults = {};

  for (const item of result) {
    if (!sortedResults[item.moduleName]) {
      sortedResults[item.moduleName] = [];
    }

    sortedResults[item.moduleName].push(item);
  }

  for (const item of Object.entries(sortedResults)) {
    const defaultImports = item[1].filter(
      (entry) => entry.syntax === 'default'
    );
    const namespaceImports = item[1].filter(
      (entry) => entry.syntax === 'namespace'
    );
    const sideEffectImports = item[1].filter(
      (entry) => entry.syntax === 'side-effect'
    );

    [defaultImports, namespaceImports, sideEffectImports].forEach(
      (importsSyntax) => {
        if (importsSyntax.length > 1) {
          const [{ syntax }] = importsSyntax;

          throw new Error(
            `The "${syntax}" syntax format can't have multiple import in "${item}" value`
          );
        }
      }
    );
  }

  return sortedResults;
}

function renderImports(loaderContext, type, imports) {
  const [{ moduleName }] = imports;
  const defaultImports = imports.filter((item) => item.syntax === 'default');
  const namedImports = imports.filter((item) => item.syntax === 'named');
  const namespaceImports = imports.filter(
    (item) => item.syntax === 'namespace'
  );
  const sideEffectImports = imports.filter(
    (item) => item.syntax === 'side-effect'
  );
  const isModule = type === 'module';

  // 1. Import-side-effect
  if (sideEffectImports.length > 0) {
    return isModule
      ? `import ${stringifyRequest(loaderContext, moduleName)};`
      : `require(${stringifyRequest(loaderContext, moduleName)});`;
  }

  let code = isModule ? 'import' : '';

  // 2. Default import
  if (defaultImports.length > 0) {
    const [{ name }] = defaultImports;

    code += isModule
      ? ` ${name}`
      : `var ${name} = require(${stringifyRequest(
          loaderContext,
          moduleName
        )});`;
  }

  // 3. Namespace import
  if (namespaceImports.length > 0) {
    if (defaultImports.length > 0) {
      code += `,`;
    }

    const [{ name }] = namespaceImports;

    code += ` * as ${name}`;
  }

  // 4. Named import
  if (namedImports.length > 0) {
    if (defaultImports.length > 0) {
      code += isModule ? ', { ' : '\nvar { ';
    } else {
      code += isModule ? ' { ' : 'var { ';
    }

    namedImports.forEach((namedImport, i) => {
      const comma = i > 0 ? ', ' : '';
      const { name, alias } = namedImport;
      const sep = isModule ? ' as ' : ': ';

      code += alias ? `${comma}${name}${sep}${alias}` : `${comma}${name}`;
    });

    code += isModule
      ? ' }'
      : ` } = require(${stringifyRequest(loaderContext, moduleName)});`;
  }

  if (!isModule) {
    return code;
  }

  code += ` from ${stringifyRequest(loaderContext, moduleName)};`;

  return code;
}

export { getImports, renderImports };
