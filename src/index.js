/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

import { getOptions, getCurrentRequest } from 'loader-utils';
import validateOptions from 'schema-utils';

import schema from './options.json';

import renderImport from './utils';

const { SourceNode } = require('source-map');
const { SourceMapConsumer } = require('source-map');

export default function loader(content, sourceMap) {
  const options = getOptions(this) || {};

  validateOptions(schema, options, {
    name: 'Imports loader',
    baseDataPath: 'options',
  });

  const callback = this.async();

  const moduleImport = options.imports;

  let moduleImports;
  const imports = [];

  if (moduleImport) {
    moduleImports = Array.isArray(moduleImport) ? moduleImport : [moduleImport];

    try {
      moduleImports.forEach((importEntry) => {
        imports.push(renderImport(importEntry));
      });
    } catch (error) {
      callback(error, content, sourceMap);
      return;
    }
  }

  let prefix = '';
  let postfix = '';
  const { wrapper } = options;

  if (wrapper && wrapper.IIFE) {
    prefix += '\n(function() {';
    postfix += `\n}(${wrapper.IIFE}));`;
  }

  if (wrapper && wrapper.call) {
    prefix += '\n(function() {';
    postfix += `\n}.call(${wrapper.call}));`;
  }

  let importString = `/*** IMPORTS FROM imports-loader ***/\n${imports.join(
    '\n'
  )}`;

  const { additionalCode } = options;

  if (additionalCode) {
    importString += `\n${additionalCode}`;
  }

  if (sourceMap) {
    const node = SourceNode.fromStringWithSourceMap(
      content,
      new SourceMapConsumer(sourceMap)
    );
    node.prepend(`${importString}${prefix}`);
    node.add(postfix);
    const result = node.toStringWithSourceMap({
      file: getCurrentRequest(this),
    });
    callback(null, result.code, result.map.toJSON());
    return;
  }

  callback(null, `${importString}${prefix}\n${content}${postfix}`, sourceMap);
}
