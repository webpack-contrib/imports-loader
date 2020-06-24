/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/

import { SourceNode, SourceMapConsumer } from 'source-map';
import { getOptions } from 'loader-utils';
import validateOptions from 'schema-utils';

import schema from './options.json';

import { getImports, renderImports, sourceHasUseStrict } from './utils';

const HEADER = '/*** IMPORTS FROM imports-loader ***/\n';

export default function loader(content, sourceMap) {
  const options = getOptions(this);

  validateOptions(schema, options, {
    name: 'Imports Loader',
    baseDataPath: 'options',
  });

  const type = options.type || 'module';
  const callback = this.async();

  let importsCode = HEADER;

  let imports;

  if (typeof options.imports !== 'undefined') {
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
      directive ? "'use strict';\n" : ''
    );
  }

  if (typeof options.additionalCode !== 'undefined') {
    importsCode += `\n${options.additionalCode}\n`;
  }

  let codeAfterModule = '';

  if (typeof options.wrapper !== 'undefined') {
    let thisArg;
    let args;

    if (typeof options.wrapper === 'boolean') {
      thisArg = '';
      args = '';
    } else if (typeof options.wrapper === 'string') {
      thisArg = options.wrapper;
      args = '';
    } else {
      ({ thisArg, args } = options.wrapper);
      args = args.join(', ');
    }

    importsCode += `\n(function(${args}) {`;
    codeAfterModule += `\n}.call(${thisArg}${args ? `, ${args}` : ''}));\n`;
  }

  if (this.sourceMap && sourceMap) {
    const node = SourceNode.fromStringWithSourceMap(
      content,
      new SourceMapConsumer(sourceMap)
    );

    node.prepend(`${importsCode}\n`);
    node.add(codeAfterModule);

    const result = node.toStringWithSourceMap({ file: this.resourcePath });

    callback(null, result.code, result.map.toJSON());

    return;
  }

  callback(null, `${importsCode}\n${content}${codeAfterModule}`, sourceMap);
}
