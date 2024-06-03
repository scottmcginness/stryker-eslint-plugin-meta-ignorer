// @ts-check
import { PluginKind, declareValuePlugin } from '@stryker-mutator/api/plugin';

const metaKeys = new Set(['type', 'docs', 'schema']);

/** @param {import('babel-types').ObjectExpression} expression */
const isPluginMeta = (expression) =>
  expression.properties.filter(
    (p) => p.type === 'ObjectProperty' && p.key.type === 'Identifier' && metaKeys.has(p.key.name),
  ).length === metaKeys.size;

/** @param {import('babel-traverse').NodePath} path */
const isObjectWithMeta = (path) =>
  path.isObjectProperty() && path.node.value.type === 'ObjectExpression' && isPluginMeta(path.node.value);

/** @param {import('babel-traverse').NodePath} path */
const isAssignmentToMeta = (path) =>
  path.isAssignmentExpression() && path.node.right.type === 'ObjectExpression' && isPluginMeta(path.node.right);

export const strykerPlugins = [
  declareValuePlugin(PluginKind.Ignore, 'ignore-meta', {
    /** @param {import('babel-traverse').NodePath} path */
    shouldIgnore(path) {
      if (isObjectWithMeta(path) || isAssignmentToMeta(path)) {
        return "Anything inside the 'meta' property of an ESLint rule definition can be ignored.";
      }

      return undefined;
    },
  }),
];
