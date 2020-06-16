/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/

import { SourceNode, SourceMapConsumer } from 'source-map';
import { getOptions, getCurrentRequest } from 'loader-utils';
import validateOptions from 'schema-utils';

import schema from './options.json';

import { getImports, renderImports } from './utils';

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

    importsCode += Object.entries(imports).reduce(
      (accumulator, item) =>
        `${accumulator}${renderImports(this, type, item[0], item[1])}\n`,
      ''
    );
  }

  if (typeof options.additionalCode !== 'undefined') {
    importsCode += `\n${options.additionalCode}`;
  }

  let codeAfterModule = '';

  if (typeof options.wrapper !== 'undefined') {
    importsCode += '\n(function() {';
    codeAfterModule += `\n}.call(${options.wrapper.toString()}));\n`;
  }

  if (this.sourceMap && sourceMap) {
    const node = SourceNode.fromStringWithSourceMap(
      content,
      new SourceMapConsumer(sourceMap)
    );

    node.prepend(`${importsCode}\n`);
    node.add(codeAfterModule);

    const result = node.toStringWithSourceMap({
      file: getCurrentRequest(this),
    });

    callback(null, result.code, result.map.toJSON());

    return;
  }

  callback(null, `${importsCode}\n${content}${codeAfterModule}`, sourceMap);
}
