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
  }

  if (result.syntax === defaultSyntax && typeof result.name === 'undefined') {
    result.name = result.moduleName;
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
      `The "${type}" type does not support the "${result.syntax}" syntax in "${
        typeof item === 'string' ? item : JSON.stringify(item)
      }" value`
    );
  }

  if (
    ['single', 'multiple', 'pure'].includes(result.syntax) &&
    type === 'module'
  ) {
    throw new Error(
      `The "${type}" format does not support the "${
        result.syntax
      }" syntax in "${
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

  for (const item of Object.entries(sortedResults)) {
    const names = item[1]
      // TODO test
      .filter(({ syntax }) => syntax !== 'side-effects' && syntax !== 'pure')
      .map(({ name }) => name);
    const duplicates = names.filter(
      (name, index) => names.indexOf(name) !== index
    );

    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate ${
          duplicates.length === 1
            ? `"${duplicates}" name`
            : `${duplicates
                .map((duplicate) => `"${duplicate}"`)
                .join(', ')} names`
        } found in "${JSON.stringify(item)}" value`
      );
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
      code += pure.length > 0 ? '\n' : '';

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
      code += pure.length > 0 || singleImports.length > 0 ? '\n' : '';
      code += `var { `;

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

  // Default
  if (defaultImports.length > 0) {
    defaultImports.forEach((defaultImport, i) => {
      const { name } = defaultImport;
      const needNewline = i < defaultImports.length - 1 ? '\n' : '';

      code += `import ${name} from ${stringifyRequest(
        loaderContext,
        moduleName
      )};${needNewline}`;
    });
  }

  // Named
  if (namedImports.length > 0) {
    code += defaultImports.length > 0 ? '\n' : '';
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

  // Namespace
  if (namespaceImports.length > 0) {
    code += defaultImports.length > 0 || namedImports.length > 0 ? '\n' : '';

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
