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

  if (
    ['default', 'side-effects', 'single', 'pure'].includes(result.syntax) &&
    typeof result.alias !== 'undefined'
  ) {
    throw new Error(
      `The "${result.syntax}" syntax does not support "${
        result.alias
      }" alias in "${
        typeof item === 'string' ? item : JSON.stringify(item)
      }" value`
    );
  }

  if (
    ['side-effects', 'pure'].includes(result.syntax) &&
    typeof result.name !== 'undefined'
  ) {
    throw new Error(
      `The "${result.syntax}" syntax does not support "${
        result.name
      }" name in "${
        typeof item === 'string' ? item : JSON.stringify(item)
      }" value`
    );
  }

  if (
    ['default', 'namespace', 'named', 'side-effects'].includes(result.syntax) &&
    type === 'commonjs'
  ) {
    throw new Error(
      `The "${type}" type not support "${result.syntax}" syntax import in "${
        typeof item === 'string' ? item : JSON.stringify(item)
      }" value`
    );
  }

  if (
    ['single', 'multiple', 'pure'].includes(result.syntax) &&
    type === 'module'
  ) {
    throw new Error(
      `The "${type}" format does not support "namespace" syntax import in "${
        typeof item === 'string' ? item : JSON.stringify(item)
      }" value`
    );
  }

  if (
    ['namespace', 'named', 'multiple'].includes(result.syntax) &&
    typeof result.name === 'undefined'
  ) {
    throw new Error(
      `The "${result.syntax}" syntax needs the "name" option in "${
        typeof item === 'string' ? item : JSON.stringify(item)
      }" value`
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

  if (type === 'module') {
    for (const item of Object.entries(sortedResults)) {
      const defaultImports = item[1].filter(
        ({ syntax }) => syntax === 'default'
      );

      [defaultImports].forEach((importsSyntax) => {
        if (importsSyntax.length > 1) {
          const [{ syntax }] = importsSyntax;

          throw new Error(
            `The "${syntax}" syntax format should not have multiple imports in "${JSON.stringify(
              item
            )}" value`
          );
        }
      });
    }
  }

  return sortedResults;
}

function renderImports(loaderContext, type, moduleName, imports) {
  let code = '';

  if (type === 'commonjs') {
    const pure = imports.filter(({ syntax }) => syntax === 'pure');

    // Pure
    if (pure.length > 0) {
      pure.forEach((_, i) => {
        const needNewline = i < pure.length - 1 ? '\n' : '';

        code += `require(${stringifyRequest(
          loaderContext,
          moduleName
        )});${needNewline}`;
      });
    }

    const singleImports = imports.filter(({ syntax }) => syntax === 'single');

    // Single
    if (singleImports.length > 0) {
      singleImports.forEach((singleImport, i) => {
        const { name } = singleImport;
        const needNewline = i < singleImports.length - 1 ? '\n' : '';

        code += `var ${name} = require(${stringifyRequest(
          loaderContext,
          moduleName
        )});${needNewline}`;
      });
    }

    const multipleImports = imports.filter(
      ({ syntax }) => syntax === 'multiple'
    );

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

  const sideEffectsImports = imports.filter(
    ({ syntax }) => syntax === 'side-effects'
  );

  // Side-effects
  if (sideEffectsImports.length > 0) {
    sideEffectsImports.forEach((_, i) => {
      const needNewline = i < sideEffectsImports.length - 1 ? '\n' : '';

      code += `import ${stringifyRequest(
        loaderContext,
        moduleName
      )};${needNewline}`;
    });

    return code;
  }

  const defaultImports = imports.filter(({ syntax }) => syntax === 'default');
  const namedImports = imports.filter(({ syntax }) => syntax === 'named');
  const namespaceImports = imports.filter(
    ({ syntax }) => syntax === 'namespace'
  );

  // Default import
  if (defaultImports.length > 0) {
    const [{ name }] = defaultImports;
    const needNewline =
      namedImports.length > 0 || namespaceImports.length > 0 ? '\n' : '';

    code += `import ${name} from ${stringifyRequest(
      loaderContext,
      moduleName
    )};${needNewline}`;
  }

  // Named import
  if (namedImports.length > 0) {
    code += 'import { ';

    namedImports.forEach((namedImport, i) => {
      const needComma = i > 0 ? ', ' : '';
      const { name, alias } = namedImport;
      const separator = ' as ';

      code += alias
        ? `${needComma}${name}${separator}${alias}`
        : `${needComma}${name}`;
    });

    code += ` } from ${stringifyRequest(loaderContext, moduleName)};`;
  }

  // Namespace import
  if (namespaceImports.length > 0) {
    namespaceImports.forEach((namespaceImport, i) => {
      const { name } = namespaceImport;
      const needNewline = i < namespaceImports.length - 1 ? '\n' : '';

      code += `import * as ${name} from ${stringifyRequest(
        loaderContext,
        moduleName
      )};${needNewline}`;
    });
  }

  return code;
}

export { getImports, renderImports };
