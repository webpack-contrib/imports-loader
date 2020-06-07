function getImportProfile(params) {
  const importEntry =
    typeof params === 'string'
      ? { moduleName: params, list: { name: params, type: 'default' } }
      : { ...params };

  const result = {
    /*
    import-side-effect
    import-default
    name-space-import
    named-imports
    import-default , name-space-import
    import-default , named-imports
    */
    quantityImportsType: 0,
    moduleType: params.type || 'module',
    type: {
      default: false,
      sideEffect: false,
      namespaceImport: false,
      namedImports: false,
    },
    moduleName: importEntry.moduleName,
    importDefault: {
      // name: "defaultExport"
    },
    namespaceImport: {
      // name: "ns"
    },
    namedImports: [
      // {
      //   name: "exportName",
      //   alias: "shortName"
      // }
    ],
  };
  let { list } = importEntry;

  if (list === false) {
    result.type.sideEffect = true;
    return result;
  }

  list = Array.isArray(list)
    ? list
    : typeof list === 'string'
    ? [{ name: list, type: 'default' }]
    : [list];

  list.forEach((entry) => {
    if (entry.type === 'default' && entry.name) {
      result.type.default = true;
      result.importDefault.name = entry.name;
      return;
    }

    if (entry.type === 'namespace' && entry.name) {
      result.type.namespace = true;
      result.namespaceImport.name = entry.name;
      return;
    }

    if (entry.name) {
      result.type.namedImports = true;
      result.namedImports.push({
        name: entry.name,
        alias: entry.alias,
      });
    }
  });

  result.quantityImportsType = Object.keys(result.type).filter(
    (key) => result.type[key]
  ).length;

  if (result.quantityImportsType === 0) {
    throw new Error('Not enough data to import');
  }

  return result;
}

function renderImportModule(importProfile) {
  let result = 'import';

  if (importProfile.type.sideEffect) {
    result += ` "${importProfile.moduleName}";`;
    return result;
  }

  if (importProfile.type.default) {
    result += ` ${importProfile.importDefault.name}`;
  }

  if (importProfile.quantityImportsType > 1) {
    result += ', ';
  }

  if (importProfile.type.namedImports) {
    const namedImportString = importProfile.namedImports.map((entry) => {
      if (entry.alias) {
        return `${entry.name} as ${entry.alias}`;
      }

      return entry.name;
    });

    result += ` { ${namedImportString.join(', ')} }`;
  }

  if (importProfile.type.namespace) {
    result += ` * as ${importProfile.namespaceImport.name}`;
  }

  result += ` from "${importProfile.moduleName}";`;

  return result;
}

function renderImportCommonjs(importProfile) {
  if (importProfile.type.default) {
    return `var ${importProfile.importDefault.name} = require("${importProfile.moduleName}");`;
  }

  if (importProfile.type.namedImports) {
    const namedImportString = importProfile.namedImports.map((entry) => {
      if (entry.alias) {
        return `${entry.name}: ${entry.alias}`;
      }

      return entry.name;
    });

    return `var { ${namedImportString.join(', ')} } = require("${
      importProfile.moduleName
    }");`;
  }

  throw new Error('Not enough data to commonjs import');
}

function renderImport(importEntry) {
  const importProfile = getImportProfile(importEntry);

  if (importProfile.moduleType === 'module') {
    return renderImportModule(importProfile);
  }

  return renderImportCommonjs(importProfile);
}

export default renderImport;
