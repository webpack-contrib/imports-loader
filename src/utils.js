function getImportProfile(params) {
  const importEntry =
    typeof params === 'string'
      ? { moduleName: params, names: { name: params, default: true } }
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
      nameSpaceImport: false,
      namedImports: false,
    },
    moduleName: importEntry.moduleName,
    importDefault: {
      // name: "defaultExport"
    },
    nameSpaceImport: {
      // alias: "ns"
    },
    namedImports: [
      // {
      //   name: "exportName",
      //   alias: "shortName"
      // }
    ],
  };
  let { names } = importEntry;

  if (names === false) {
    result.type.sideEffect = true;
    return result;
  }

  names = Array.isArray(names)
    ? names
    : typeof names === 'string'
    ? [{ name: names, default: true }]
    : [names];

  names.forEach((entry) => {
    const entryNormalized =
      typeof entry === 'string' ? { name: entry, alias: entry } : entry;

    if (entryNormalized.default) {
      result.type.default = true;
      result.importDefault.name = entryNormalized.name;
      return;
    }

    if (entryNormalized.nameSpace) {
      result.type.nameSpace = true;
      result.nameSpaceImport.alias = entryNormalized.alias;
      return;
    }

    result.type.namedImports = true;
    result.namedImports.push({
      name: entryNormalized.name,
      alias: entryNormalized.alias,
    });
  });

  return result;
}

function getImportString(importEntry) {
  const importProfile = getImportProfile(importEntry);

  const result = ['import'];

  const quantityImportsType = Object.keys(importProfile.type).filter(
    (key) => importProfile.type[key]
  ).length;

  if (importProfile.type.sideEffect) {
    result.push(`"${importProfile.moduleName}";`);
    return result.join(' ');
  }

  if (importProfile.type.default) {
    result.push(importProfile.importDefault.name);
  }

  if (quantityImportsType > 1) {
    result.push(',');
  }

  if (importProfile.type.namedImports) {
    const namedImportString = importProfile.namedImports.map((entry) => {
      if (entry.alias) {
        return `${entry.name} as ${entry.alias}`;
      }

      return entry.name;
    });

    result.push(`{ ${namedImportString.join(', ')} }`);
  }

  if (importProfile.type.nameSpace) {
    result.push(`* as ${importProfile.nameSpaceImport.alias}`);
  }

  result.push(`from "${importProfile.moduleName}";`);

  return result.join(' ');
}

export default getImportString;
