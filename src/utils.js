import { stringifyRequest } from 'loader-utils';

function resolveImports(type, item) {
  const defaultSyntax = type === 'module' ? 'default' : 'single';
  let result;

  if (typeof item === 'string') {
    const splittedItem = item.split(' ');

    if (splittedItem.length > 4) {
      throw new Error(`Invalid "${item}" for import`);
    }

    if (splittedItem.length === 1) {
      result = {
        type,
        syntax: defaultSyntax,
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
    result = { syntax: defaultSyntax, ...item };

    if (result.syntax === defaultSyntax && !result.name) {
      result.name = result.moduleName;
    }
  }

  if (!result.moduleName) {
    throw new Error(
      `The import should have "moduleName" option in "${item}" value`
    );
  }

  if (
    ['default', 'single', 'side-effect', 'pure-require'].includes(
      result.syntax
    ) &&
    typeof result.alias !== 'undefined'
  ) {
    throw new Error(
      `The "${result.syntax}" syntax can't have "${result.alias}" alias in "${item}" value`
    );
  }

  if (
    ['side-effect', 'pure-require'].includes(result.syntax) &&
    typeof result.name !== 'undefined'
  ) {
    throw new Error(
      `The "${result.syntax}" syntax can't have "${result.name}" name in "${item}" value`
    );
  }

  if (
    ['default', 'namespace', 'named', 'side-effect'].includes(result.syntax) &&
    type === 'commonjs'
  ) {
    throw new Error(
      `The "commonjs" type not support "${result.syntax}" syntax import in "${item}" value`
    );
  }

  if (
    ['single', 'multiple', 'pure-require'].includes(result.syntax) &&
    type === 'module'
  ) {
    throw new Error(
      `The "module" type not support "${result.syntax}" syntax import in "${item}" value`
    );
  }

  if (
    ['namespace', 'named', 'multiple'].includes(result.syntax) &&
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

  const defaultSyntax = type === 'module' ? 'default' : 'single';

  for (const item of Object.entries(sortedResults)) {
    const defaultImports = item[1].filter(
      (entry) => entry.syntax === defaultSyntax
    );

    const namespaceImports = item[1].filter(
      (entry) => entry.syntax === 'namespace'
    );
    const sideEffectImports = item[1].filter(
      (entry) => entry.syntax === 'side-effect'
    );

    const pureRequire = item[1].filter(
      (entry) => entry.syntax === 'pure-require'
    );

    [defaultImports, namespaceImports, sideEffectImports, pureRequire].forEach(
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
  const singleImports = imports.filter((item) => item.syntax === 'single');
  const namedImports = imports.filter((item) => item.syntax === 'named');
  const multipleImports = imports.filter((item) => item.syntax === 'multiple');
  const namespaceImports = imports.filter(
    (item) => item.syntax === 'namespace'
  );
  const sideEffectImports = imports.filter(
    (item) => item.syntax === 'side-effect'
  );
  const pureRequire = imports.filter((item) => item.syntax === 'pure-require');
  const isModule = type === 'module';

  // 1. Module import-side-effect
  if (sideEffectImports.length > 0) {
    return `import ${stringifyRequest(loaderContext, moduleName)};`;
  }

  // 2. CommonJs pure-require
  if (pureRequire.length > 0) {
    return `require(${stringifyRequest(loaderContext, moduleName)});`;
  }

  let code = isModule ? 'import' : '';

  // 3. Module default import
  if (defaultImports.length > 0) {
    const [{ name }] = defaultImports;

    code += ` ${name}`;
  }

  // 4. CommonJs single import
  if (singleImports.length > 0) {
    const [{ name }] = singleImports;

    code += `var ${name} = require(${stringifyRequest(
      loaderContext,
      moduleName
    )});`;
  }

  // 5. Module namespace import
  if (namespaceImports.length > 0) {
    if (defaultImports.length > 0) {
      code += `,`;
    }

    const [{ name }] = namespaceImports;

    code += ` * as ${name}`;
  }

  // 6. Module named import
  if (namedImports.length > 0) {
    if (defaultImports.length > 0) {
      code += ', { ';
    } else {
      code += ' { ';
    }

    namedImports.forEach((namedImport, i) => {
      const comma = i > 0 ? ', ' : '';
      const { name, alias } = namedImport;
      const sep = ' as ';

      code += alias ? `${comma}${name}${sep}${alias}` : `${comma}${name}`;
    });

    code += ' }';
  }

  // 7. CommonJs multiple import
  if (multipleImports.length > 0) {
    if (singleImports.length > 0) {
      code += '\nvar { ';
    } else {
      code += 'var { ';
    }

    multipleImports.forEach((multipleImport, i) => {
      const comma = i > 0 ? ', ' : '';
      const { name, alias } = multipleImport;
      const sep = ': ';

      code += alias ? `${comma}${name}${sep}${alias}` : `${comma}${name}`;
    });

    code += ` } = require(${stringifyRequest(loaderContext, moduleName)});`;
  }

  if (!isModule) {
    return code;
  }

  code += ` from ${stringifyRequest(loaderContext, moduleName)};`;

  return code;
}

export { getImports, renderImports };
