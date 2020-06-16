import { stringifyRequest } from 'loader-utils';

function resolveImports(type, item) {
  const defaultSyntax = type === 'module' ? 'default' : 'single';

  let result;

  if (typeof item === 'string') {
    const noWhitespaceItem = item.trim();

    if (noWhitespaceItem.length === 0) {
      throw new Error(`Invalid "${item}" value for import`);
    }

    const splittedItem = noWhitespaceItem.split(' ');

    if (splittedItem.length > 4) {
      throw new Error(`Invalid "${item}" value for import`);
    }

    if (splittedItem.length === 1) {
      result = {
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

    if (result.syntax === defaultSyntax && typeof result.name === 'undefined') {
      result.name = result.moduleName;
    }
  }

  if (typeof result.moduleName === 'undefined') {
    throw new Error(
      `Need to specify the "moduleName" option in "${item}" value`
    );
  }

  if (
    ['default', 'side-effects', 'single', 'pure'].includes(result.syntax) &&
    typeof result.alias !== 'undefined'
  ) {
    throw new Error(
      `The "${result.syntax}" syntax does not support "${result.alias}" alias in "${item}" value`
    );
  }

  if (
    ['side-effects', 'pure'].includes(result.syntax) &&
    typeof result.name !== 'undefined'
  ) {
    throw new Error(
      `The "${result.syntax}" syntax does not support "${result.name}" name in "${item}" value`
    );
  }

  if (
    ['default', 'namespace', 'named', 'side-effects'].includes(result.syntax) &&
    type === 'commonjs'
  ) {
    throw new Error(
      `The "commonjs" type not support "${result.syntax}" syntax import in "${item}" value`
    );
  }

  if (
    ['single', 'multiple', 'pure'].includes(result.syntax) &&
    type === 'module'
  ) {
    throw new Error(
      `The "${type}" format does not support "namespace" syntax import in "${item}" value`
    );
  }

  if (
    ['namespace', 'named', 'multiple'].includes(result.syntax) &&
    typeof result.name === 'undefined'
  ) {
    throw new Error(
      `The "${result.syntax}" syntax does not support the "name" option in "${item}" value`
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
    const { moduleName } = item;

    if (!sortedResults[moduleName]) {
      sortedResults[moduleName] = [];
    }

    const { syntax, name, alias } = item;

    sortedResults[moduleName].push({ syntax, name, alias });
  }

  const defaultSyntax = type === 'module' ? 'default' : 'single';

  for (const item of Object.entries(sortedResults)) {
    const defaultImports = item[1].filter(
      ({ syntax }) => syntax === defaultSyntax
    );

    const namespaceImports = item[1].filter(
      ({ syntax }) => syntax === 'namespace'
    );
    const sideEffectImports = item[1].filter(
      ({ syntax }) => syntax === 'side-effects'
    );

    const pure = item[1].filter((entry) => entry.syntax === 'pure');

    [defaultImports, namespaceImports, sideEffectImports, pure].forEach(
      (importsSyntax) => {
        if (importsSyntax.length > 1) {
          const [{ syntax }] = importsSyntax;

          throw new Error(
            `The "${syntax}" syntax format should not have multiple imports in "${item}" value`
          );
        }
      }
    );
  }

  return sortedResults;
}

function renderImports(loaderContext, type, moduleName, imports) {
  let code = '';

  if (type === 'commonjs') {
    const pure = imports.filter(({ syntax }) => syntax === 'pure');
    const singleImports = imports.filter(({ syntax }) => syntax === 'single');
    const multipleImports = imports.filter(
      ({ syntax }) => syntax === 'multiple'
    );

    // Pure
    if (pure.length > 0) {
      return `require(${stringifyRequest(loaderContext, moduleName)});`;
    }

    // Single
    if (singleImports.length > 0) {
      const [{ name }] = singleImports;

      code += `var ${name} = require(${stringifyRequest(
        loaderContext,
        moduleName
      )});`;
    }

    // Multiple
    if (multipleImports.length > 0) {
      code += `${singleImports.length > 0 ? '\n' : ''}var { `;

      multipleImports.forEach((multipleImport, i) => {
        const needComma = i > 0 ? ', ' : '';
        const { name, alias } = multipleImport;
        const separator = ': ';

        code += alias
          ? `${needComma}${name}${separator}${alias}`
          : `${needComma}${name}`;
      });

      code += ` } = require(${stringifyRequest(loaderContext, moduleName)});`;
    }

    return code;
  }

  const defaultImports = imports.filter(({ syntax }) => syntax === 'default');
  const namedImports = imports.filter(({ syntax }) => syntax === 'named');
  const namespaceImports = imports.filter(
    ({ syntax }) => syntax === 'namespace'
  );
  const sideEffectImports = imports.filter(
    ({ syntax }) => syntax === 'side-effects'
  );

  // Side-effects
  if (sideEffectImports.length > 0) {
    return `import ${stringifyRequest(loaderContext, moduleName)};`;
  }

  code += 'import';

  // Default import
  if (defaultImports.length > 0) {
    const [{ name }] = defaultImports;

    code += ` ${name}`;
  }

  // Namespace import
  if (namespaceImports.length > 0) {
    if (defaultImports.length > 0) {
      code += `,`;
    }

    const [{ name }] = namespaceImports;

    code += ` * as ${name}`;
  }

  // Named import
  if (namedImports.length > 0) {
    code += `${defaultImports.length > 0 ? ',' : ''} { `;

    namedImports.forEach((namedImport, i) => {
      const needComma = i > 0 ? ', ' : '';
      const { name, alias } = namedImport;
      const separator = ' as ';

      code += alias
        ? `${needComma}${name}${separator}${alias}`
        : `${needComma}${name}`;
    });

    code += ' }';
  }

  code += ` from ${stringifyRequest(loaderContext, moduleName)};`;

  return code;
}

export { getImports, renderImports };
