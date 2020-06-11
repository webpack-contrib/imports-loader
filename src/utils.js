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
    result = { ...{ syntax: 'default' }, ...item };

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

function getImports(type, options) {
  const { imports, additionalCode, wrapper } = options;

  if (!imports && !additionalCode && !wrapper) {
    throw new Error(
      `You must fill out one of the options "imports", "wrapper" or "additionalCode" in "${options}" value`
    );
  }

  if (!imports) {
    return [];
  }

  let result = [];

  if (typeof imports === 'string') {
    result.push(resolveImports(type, imports));
  } else {
    result = [].concat(imports).map((item) => resolveImports(type, item));
  }

  return result;
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

  // 1. Import-side-effect
  if (sideEffectImports.length > 0) {
    return type === 'commonjs'
      ? `require(${stringifyRequest(loaderContext, moduleName)});`
      : `import ${stringifyRequest(loaderContext, moduleName)};`;
  }

  let code = type === 'commonjs' ? '' : 'import';

  // 2. Default import
  if (defaultImports.length > 0) {
    const [{ name }] = defaultImports;

    // eslint-disable-next-line default-case
    switch (type) {
      case 'commonjs':
        code += `var ${name} = require(${stringifyRequest(
          loaderContext,
          moduleName
        )});`;
        break;
      case 'module':
        code += ` ${name}`;
        break;
    }
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
      code += type === 'commonjs' ? '\nvar { ' : ', { ';
    } else {
      code += type === 'commonjs' ? 'var { ' : ' { ';
    }

    namedImports.forEach((namedImport, i) => {
      const comma = i > 0 ? ', ' : '';
      const { name, alias } = namedImport;
      const sep = type === 'commonjs' ? ': ' : ' as ';

      code += alias ? `${comma}${name}${sep}${alias}` : `${comma}${name}`;
    });

    code +=
      type === 'commonjs'
        ? ` } = require(${stringifyRequest(loaderContext, moduleName)});`
        : ' }';
  }

  if (type === 'commonjs') {
    return code;
  }

  code += ` from ${stringifyRequest(loaderContext, moduleName)};`;

  return code;
}

export { getImports, renderImports };
