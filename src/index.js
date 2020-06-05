/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

import { getOptions, getCurrentRequest } from 'loader-utils';
import validateOptions from 'schema-utils';

import schema from './options.json';

import getImportString from './utils';

const { SourceNode } = require('source-map');
const { SourceMapConsumer } = require('source-map');

export default function loader(content, sourceMap) {
  const options = getOptions(this) || {};

  validateOptions(schema, options, {
    name: 'Imports loader',
    baseDataPath: 'options',
  });

  const moduleImport = options.import;
  const { wrapper, additionalCode } = options;

  const HEADER = '/*** IMPORTS FROM imports-loader ***/\n';
  const prefixes = [];
  const postfixes = [];
  const imports = [];

  let moduleImports;

  if (moduleImport) {
    moduleImports = Array.isArray(moduleImport) ? moduleImport : [moduleImport];

    moduleImports.forEach((importEntry) => {
      imports.push(getImportString(importEntry));
    });
  }

  if (wrapper) {
    prefixes.push(`(function() {`);
    postfixes.unshift(`}.call(${wrapper}));`);
  }

  if (additionalCode) {
    prefixes.push(`${additionalCode}\n`);
  }

  const prefix = prefixes.join('\n');
  const postfix = postfixes.join('\n');
  const importString = imports.join('\n');

  const callback = this.async();

  if (sourceMap) {
    const node = SourceNode.fromStringWithSourceMap(
      content,
      new SourceMapConsumer(sourceMap)
    );
    node.prepend(prefix);
    node.prepend(HEADER);
    node.add(postfix);
    const result = node.toStringWithSourceMap({
      file: getCurrentRequest(this),
    });
    callback(null, result.code, result.map.toJSON());
    return;
  }

  callback(
    null,
    `${HEADER}\n${importString}\n${prefix}\n${content}\n${postfix}`,
    sourceMap
  );
}
