# Stryker ESLint plugin meta ignorer

Provides an ignorer plugin for [Stryker](https://stryker-mutator.io/docs/stryker-js/getting-started/), for use in an [ESLint plugin](https://eslint.org/docs/latest/extend/plugins). It ignores the `meta` property of a rule, which contains a type, documentation and a schema.

## Installation

Assuming you have Stryker installed and configured:

`npm install --save-dev stryker-eslint-plugin-meta-ignorer`

In your `stryker.conf.mjs` file, add or update the following two sections:

```javascript
export default {
  ...,
  ignorers: ['ignore-meta'],
  plugins: ['@stryker-mutator/*', 'stryker-eslint-plugin-meta-ignorer']
};
```

## What happens

A typical ESLint plugin will export a rule with some metadata:

```javascript
export const theRule = {
  meta: {
    type: 'problem',
    docs: {
      description: '...',
    },
    schema: [],
  },
};
```

It's not very useful to have a coverage report for this data. Instead of manually asking Stryker to ignore (with [// Stryker disable](https://stryker-mutator.io/docs/stryker-js/disable-mutants/#using-a--stryker-disable-comment)), this plugin will ignore it for you.

![Ignored meta](./docs/meta-ignore.png)

It does this by looking for any object with a `meta` property that has at least the `type`, `docs` and `schema` properties (with the corresponding types).

A real example:

![Ignored meta full example](./docs/meta-ignore-full-example.png)
