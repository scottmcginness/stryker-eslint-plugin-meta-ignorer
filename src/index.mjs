// @ts-check
import { PluginKind, declareValuePlugin } from '@stryker-mutator/api/plugin';

/** @param {{ name?: string, type: string }} expr */
const isMetaIdentifier = (expr) => expr.type === 'Identifier' && expr.name === 'meta';

/** @param {import('babel-types').LVal} left */
const refersToMeta = (left) =>
  isMetaIdentifier(left) || (left.type === 'MemberExpression' && isMetaIdentifier(left.property));

const metaKeys = {
  type: 'StringLiteral',
  docs: 'ObjectExpression',
  schema: 'ArrayExpression',
};

/** @param {import('babel-types').ObjectExpression} expression */
const isPluginMeta = (expression) =>
  expression.properties.filter(
    (p) =>
      p.type === 'ObjectProperty' &&
      // Stryker disable next-line ConditionalExpression -- Identifier needed to type-check conditions that follow.
      p.key.type === 'Identifier' &&
      p.key.name in metaKeys &&
      p.value.type === metaKeys[p.key.name],
  ).length === Object.keys(metaKeys).length;

/** @param {import('babel-traverse').NodePath} path */
const isObjectWithMeta = (path) =>
  path.isObjectProperty() &&
  // Stryker disable next-line ConditionalExpression -- Identifier needed to type-check conditions that follow.
  path.node.key.type === 'Identifier' &&
  path.node.key.name === 'meta' &&
  path.node.value.type === 'ObjectExpression' &&
  isPluginMeta(path.node.value);

/** @param {import('babel-traverse').NodePath} path */
const isAssignmentToMeta = (path) =>
  path.isAssignmentExpression() &&
  refersToMeta(path.node.left) &&
  path.node.right.type === 'ObjectExpression' &&
  isPluginMeta(path.node.right);

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
