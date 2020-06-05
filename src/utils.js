function getImportProfile(params) {
  const importEntry =
    typeof params === 'string'
      ? { moduleName: params, list: { name: params, nameType: 'default' } }
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
    ? [{ name: list, nameType: 'default' }]
    : [list];

  list.forEach((entry) => {
    const entryNormalized =
      typeof entry === 'string' ? { name: entry, alias: entry } : entry;

    if (entryNormalized.nameType === 'default' && entryNormalized.name) {
      result.type.default = true;
      result.importDefault.name = entryNormalized.name;
      return;
    }

    if (entryNormalized.nameType === 'namespace' && entryNormalized.name) {
      result.type.namespace = true;
      result.namespaceImport.name = entryNormalized.name;
      return;
    }

    if (entryNormalized.name) {
      result.type.namedImports = true;
      result.namedImports.push({
        name: entryNormalized.name,
        alias: entryNormalized.alias,
      });
    }
  });

  return result;
}

function renderImport(importEntry) {
  const importProfile = getImportProfile(importEntry);

  let result = 'import';

  const quantityImportsType = Object.keys(importProfile.type).filter(
    (key) => importProfile.type[key]
  ).length;

  if (quantityImportsType === 0) {
    throw new Error('No valid data for import');
  }

  if (importProfile.type.sideEffect) {
    result += ` "${importProfile.moduleName}";`;
    return result;
  }

  if (importProfile.type.default) {
    result += ` ${importProfile.importDefault.name}`;
  }

  if (quantityImportsType > 1) {
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

export default renderImport;
