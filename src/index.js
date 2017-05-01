/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
import loaderUtils from 'loader-utils';
import { SourceNode, SourceMapConsumer } from 'source-map';

const HEADER = '/*** IMPORTS FROM imports-loader ***/\n';

export default function (content, sourceMap) {
  const query = loaderUtils.getOptions(this) || {};
  const imports = [];
  const postfixes = [];

  Object.keys(query).forEach((name) => {
    let value;
    if (typeof query[name] === 'string' && query[name].substr(0, 1) === '>') {
      value = query[name].substr(1);
    } else {
      let mod = name;
      if (typeof query[name] === 'string') {
        mod = query[name];
      }
      value = `require(${JSON.stringify(mod)})`;
    }
    if (name === 'this') {
      imports.push('(function() {');
      postfixes.unshift(`}.call(${value}));`);
    } else if (name.includes('.')) {
      name.split('.').reduce((previous, current, index, names) => {
        const expr = previous + current;

        if (previous.length === 0) {
          imports.push(`var ${expr} = (${current} || {});`);
        } else if (index < names.length - 1) {
          imports.push(`${expr} = ${expr} || {};`);
        } else {
          imports.push(`${expr} = ${value};`);
        }

        return `${previous + current}.`;
      }, '');
    } else {
      imports.push(`var ${name} = ${value};`);
    }
  });

  const prefix = `${HEADER + imports.join('\n')}\n\n`;
  const postfix = `\n${postfixes.join('\n')}`;
  if (sourceMap) {
    const currentRequest = loaderUtils.getCurrentRequest(this);
    const node = SourceNode.fromStringWithSourceMap(content, new SourceMapConsumer(sourceMap));
    node.prepend(prefix);
    node.add(postfix);
    const result = node.toStringWithSourceMap({
      file: currentRequest,
    });
    this.callback(null, result.code, result.map.toJSON());
    return;
  }
  return prefix + content + postfix; // eslint-disable-line consistent-return
}
