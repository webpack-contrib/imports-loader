/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/

import schema from "./options.json";

import { getImports, renderImports, sourceHasUseStrict } from "./utils";

const HEADER = "/*** IMPORTS FROM imports-loader ***/\n";

export default function loader(content, sourceMap) {
  const options = this.getOptions(schema);
  const type = options.type || "module";
  const callback = this.async();

  let importsCode = HEADER;

  let imports;

  if (typeof options.imports !== "undefined") {
    try {
      imports = getImports(type, options.imports);
    } catch (error) {
      callback(error);

      return;
    }

    // We don't need to remove 'use strict' manually, because `terser` do it
    const directive = sourceHasUseStrict(content);

    importsCode += Object.entries(imports).reduce(
      (accumulator, item) =>
        `${accumulator}${renderImports(this, type, item[0], item[1])}\n`,
      directive ? "'use strict';\n" : "",
    );
  }

  if (typeof options.additionalCode !== "undefined") {
    importsCode += `\n${options.additionalCode}\n`;
  }

  let codeAfterModule = "";

  if (typeof options.wrapper !== "undefined") {
    let thisArg;
    let args;
    let params;

    if (typeof options.wrapper === "boolean") {
      thisArg = "";
      params = "";
      args = "";
    } else if (typeof options.wrapper === "string") {
      thisArg = options.wrapper;
      params = "";
      args = "";
    } else {
      ({ thisArg, args } = options.wrapper);

      if (Array.isArray(args)) {
        params = args.join(", ");
        args = params;
      } else {
        params = Object.keys(args).join(", ");
        args = Object.values(args).join(", ");
      }
    }

    importsCode += `\n(function(${params}) {`;
    codeAfterModule += `\n}.call(${thisArg}${args ? `, ${args}` : ""}));\n`;
  }

  if (this.sourceMap) {
    const {
      SourceNode,
      SourceMapConsumer,
      SourceMapGenerator,
    } = require("source-map-js"); // eslint-disable-line global-require

    if (sourceMap) {
      const node = SourceNode.fromStringWithSourceMap(
        content,
        new SourceMapConsumer(sourceMap),
      );

      node.prepend(`${importsCode}\n`);
      node.add(codeAfterModule);

      const result = node.toStringWithSourceMap({ file: this.resourcePath });

      callback(null, result.code, result.map.toJSON());

      return;
    }

    const generator = new SourceMapGenerator();

    generator.setSourceContent(this.resourcePath, content);
    generator.addMapping({
      generated: { line: importsCode.split("\n").length + 1, column: 0 },
      original: { line: 1, column: 0 },
      source: this.resourcePath,
    });

    callback(
      null,
      `${importsCode}\n${content}\n${codeAfterModule}`,
      generator.toJSON(),
    );

    return;
  }

  callback(null, `${importsCode}\n${content}${codeAfterModule}`, sourceMap);
}
