import path from "path";

import strip from "strip-comments";

const matchRelativePath = /^\.\.?[/\\]/;

function isAbsolutePath(str) {
  return path.posix.isAbsolute(str) || path.win32.isAbsolute(str);
}

function isRelativePath(str) {
  return matchRelativePath.test(str);
}

// TODO simplify for the next major release
function stringifyRequest(loaderContext, request) {
  if (
    typeof loaderContext.utils !== "undefined" &&
    typeof loaderContext.utils.contextify === "function"
  ) {
    return JSON.stringify(
      loaderContext.utils.contextify(loaderContext.context, request)
    );
  }

  const splitted = request.split("!");
  const { context } = loaderContext;

  return JSON.stringify(
    splitted
      .map((part) => {
        // First, separate singlePath from query, because the query might contain paths again
        const splittedPart = part.match(/^(.*?)(\?.*)/);
        const query = splittedPart ? splittedPart[2] : "";
        let singlePath = splittedPart ? splittedPart[1] : part;

        if (isAbsolutePath(singlePath) && context) {
          singlePath = path.relative(context, singlePath);

          if (isAbsolutePath(singlePath)) {
            // If singlePath still matches an absolute path, singlePath was on a different drive than context.
            // In this case, we leave the path platform-specific without replacing any separators.
            // @see https://github.com/webpack/loader-utils/pull/14
            return singlePath + query;
          }

          if (isRelativePath(singlePath) === false) {
            // Ensure that the relative path starts at least with ./ otherwise it would be a request into the modules directory (like node_modules).
            singlePath = `./${singlePath}`;
          }
        }

        return singlePath.replace(/\\/g, "/") + query;
      })
      .join("!")
  );
}

function forError(item) {
  return typeof item === "string"
    ? item
    : `\n${JSON.stringify(item, null, " ")}\n`;
}

function sourceHasUseStrict(source) {
  const str = strip(source).trim();

  return str.startsWith("'use strict'") || str.startsWith('"use strict"');
}

function splitCommand(command) {
  const result = command
    .split("|")
    .map((item) => item.split(" "))
    .reduce((acc, val) => acc.concat(val), []);

  for (const item of result) {
    if (!item) {
      throw new Error(
        `Invalid command "${item}" in "${command}" for imports. There must be only one separator: " ", or "|"`
      );
    }
  }

  return result;
}

function resolveImports(type, item) {
  const defaultSyntax = type === "module" ? "default" : "single";

  let result;

  if (typeof item === "string") {
    const noWhitespaceItem = item.trim();

    if (noWhitespaceItem.length === 0) {
      throw new Error(`Invalid "${item}" value for import`);
    }

    const splittedItem = splitCommand(noWhitespaceItem);

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

  if (result.syntax === defaultSyntax && typeof result.name === "undefined") {
    result.name = result.moduleName;
  }

  if (
    ["default", "side-effects", "single", "pure"].includes(result.syntax) &&
    typeof result.alias !== "undefined"
  ) {
    throw new Error(
      `The "${result.syntax}" syntax does not support "${
        result.alias
      }" alias in "${forError(item)}" value`
    );
  }

  if (
    ["side-effects", "pure"].includes(result.syntax) &&
    typeof result.name !== "undefined"
  ) {
    throw new Error(
      `The "${result.syntax}" syntax does not support "${
        result.name
      }" name in "${forError(item)}" value`
    );
  }

  if (
    ["default", "namespace", "named", "side-effects"].includes(result.syntax) &&
    type === "commonjs"
  ) {
    throw new Error(
      `The "${type}" type does not support the "${
        result.syntax
      }" syntax in "${forError(item)}" value`
    );
  }

  if (
    ["single", "multiple", "pure"].includes(result.syntax) &&
    type === "module"
  ) {
    throw new Error(
      `The "${type}" format does not support the "${
        result.syntax
      }" syntax in "${forError(item)}" value`
    );
  }

  if (
    ["namespace", "named", "multiple"].includes(result.syntax) &&
    typeof result.name === "undefined"
  ) {
    throw new Error(
      `The "${result.syntax}" syntax needs the "name" option in "${forError(
        item
      )}" value`
    );
  }

  return result;
}

function getIdentifiers(array) {
  return array.reduce((accumulator, item) => {
    if (typeof item.alias !== "undefined") {
      accumulator.push({ type: "alias", value: item.alias });

      return accumulator;
    }

    if (typeof item.name !== "undefined") {
      accumulator.push({ type: "name", value: item.name });
    }

    return accumulator;
  }, []);
}

function duplicateBy(array, key) {
  return array.filter(
    (a, aIndex) =>
      array.filter((b, bIndex) => b[key] === a[key] && aIndex !== bIndex)
        .length > 0
  );
}

function getImports(type, imports) {
  let result;
  const importItems =
    typeof imports === "string" && imports.includes(",")
      ? imports.split(",")
      : imports;

  if (typeof importItems === "string") {
    result = [resolveImports(type, importItems)];
  } else {
    result = [].concat(importItems).map((item) => resolveImports(type, item));
  }

  const identifiers = getIdentifiers(result);
  const duplicates = duplicateBy(identifiers, "value");

  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate ${duplicates
        .map((identifier) => `"${identifier.value}" (as "${identifier.type}")`)
        .join(", ")} identifiers found in "\n${JSON.stringify(
        importItems,
        null,
        " "
      )}\n" value`
    );
  }

  const sortedResults = Object.create(null);

  for (const item of result) {
    const { moduleName } = item;

    if (!sortedResults[moduleName]) {
      sortedResults[moduleName] = [];
    }

    const { syntax, name, alias } = item;

    sortedResults[moduleName].push({ syntax, name, alias });
  }

  return sortedResults;
}

function renderImports(loaderContext, type, moduleName, imports) {
  let code = "";

  if (type === "commonjs") {
    const pure = imports.filter(({ syntax }) => syntax === "pure");

    // Pure
    if (pure.length > 0) {
      pure.forEach((_, i) => {
        const needNewline = i < pure.length - 1 ? "\n" : "";

        code += `require(${stringifyRequest(
          loaderContext,
          moduleName
        )});${needNewline}`;
      });
    }

    const singleImports = imports.filter(({ syntax }) => syntax === "single");

    // Single
    if (singleImports.length > 0) {
      code += pure.length > 0 ? "\n" : "";

      singleImports.forEach((singleImport, i) => {
        const { name } = singleImport;
        const needNewline = i < singleImports.length - 1 ? "\n" : "";

        code += `var ${name} = require(${stringifyRequest(
          loaderContext,
          moduleName
        )});${needNewline}`;
      });
    }

    const multipleImports = imports.filter(
      ({ syntax }) => syntax === "multiple"
    );

    // Multiple
    if (multipleImports.length > 0) {
      code += pure.length > 0 || singleImports.length > 0 ? "\n" : "";
      code += `var { `;

      multipleImports.forEach((multipleImport, i) => {
        const needComma = i > 0 ? ", " : "";
        const { name, alias } = multipleImport;
        const separator = ": ";

        code += alias
          ? `${needComma}${name}${separator}${alias}`
          : `${needComma}${name}`;
      });

      code += ` } = require(${stringifyRequest(loaderContext, moduleName)});`;
    }

    return code;
  }

  const sideEffectsImports = imports.filter(
    ({ syntax }) => syntax === "side-effects"
  );

  // Side-effects
  if (sideEffectsImports.length > 0) {
    sideEffectsImports.forEach((_, i) => {
      const needNewline = i < sideEffectsImports.length - 1 ? "\n" : "";

      code += `import ${stringifyRequest(
        loaderContext,
        moduleName
      )};${needNewline}`;
    });

    return code;
  }

  const defaultImports = imports.filter(({ syntax }) => syntax === "default");
  const namedImports = imports.filter(({ syntax }) => syntax === "named");
  const namespaceImports = imports.filter(
    ({ syntax }) => syntax === "namespace"
  );

  // Default
  if (defaultImports.length > 0) {
    defaultImports.forEach((defaultImport, i) => {
      const { name } = defaultImport;
      const needNewline = i < defaultImports.length - 1 ? "\n" : "";

      code += `import ${name} from ${stringifyRequest(
        loaderContext,
        moduleName
      )};${needNewline}`;
    });
  }

  // Named
  if (namedImports.length > 0) {
    code += defaultImports.length > 0 ? "\n" : "";
    code += "import { ";

    namedImports.forEach((namedImport, i) => {
      const needComma = i > 0 ? ", " : "";
      const { name, alias } = namedImport;
      const separator = " as ";

      code += alias
        ? `${needComma}${name}${separator}${alias}`
        : `${needComma}${name}`;
    });

    code += ` } from ${stringifyRequest(loaderContext, moduleName)};`;
  }

  // Namespace
  if (namespaceImports.length > 0) {
    code += defaultImports.length > 0 || namedImports.length > 0 ? "\n" : "";

    namespaceImports.forEach((namespaceImport, i) => {
      const { name } = namespaceImport;
      const needNewline = i < namespaceImports.length - 1 ? "\n" : "";

      code += `import * as ${name} from ${stringifyRequest(
        loaderContext,
        moduleName
      )};${needNewline}`;
    });
  }

  return code;
}

export { sourceHasUseStrict, getImports, renderImports };
