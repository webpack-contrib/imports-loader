/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

import { SourceNode, SourceMapConsumer } from 'source-map';
import { getOptions, getCurrentRequest } from 'loader-utils';
import validateOptions from 'schema-utils';

import schema from './options.json';

import renderImport from './utils';

export default function loader(content, sourceMap) {
  const options = getOptions(this) || {};

  validateOptions(schema, options, {
    name: 'Imports loader',
    baseDataPath: 'options',
  });

  const callback = this.async();

  const moduleImport = options.imports;

  let moduleImports;

  let imports = '';

  if (moduleImport) {
    moduleImports = Array.isArray(moduleImport) ? moduleImport : [moduleImport];

    try {
      moduleImports.forEach((importEntry) => {
        imports += `${renderImport(importEntry)}\n`;
      });
    } catch (error) {
      callback(error, content, sourceMap);

      return;
    }
  }

  let importString = `/*** IMPORTS FROM imports-loader ***/\n${imports}`;

  const { additionalCode } = options;

  if (additionalCode) {
    importString += `\n${additionalCode}`;
  }

  let codeBeforeModule = '';
  let codeAfterModule = '';

  const { wrapper } = options;

  if (wrapper) {
    codeBeforeModule += '\n(function() {';
    codeAfterModule += `\n}.call(${wrapper.toString()}));`;
  }

  if (this.sourceMap && sourceMap) {
    const node = SourceNode.fromStringWithSourceMap(
      content,
      new SourceMapConsumer(sourceMap)
    );

    node.prepend(`${importString}${codeBeforeModule}\n`);
    node.add(codeAfterModule);

    const result = node.toStringWithSourceMap({
      file: getCurrentRequest(this),
    });

    callback(null, result.code, result.map.toJSON());

    return;
  }

  callback(
    null,
    `${importString}${codeBeforeModule}\n${content}${codeAfterModule}`,
    sourceMap
  );
}
