<div align="center">
<h1>use-conditional-effect 🎲</h1>

<p>

It's React's [useEffect][useeffect] hook, except you can pass a comparison
function.

</p>

</div>

<hr />

[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package] [![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)][contributors]
[![PRs Welcome][prs-badge]][prs] [![Code of Conduct][coc-badge]][coc]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

## The problem

React's built-in `useEffect` hook has a second argument called the "dependencies
array" and it allows you to decide when React will call your effect callback.
React will do a comparison between each of the values (using `Object.is`, which
is similar to `===`) to determine whether your effect callback should be called.

The idea behind the dependencies array is that the identity of the items in the
array will tell you when to run the effect.

There are several cases where object identity is not a good choice for
triggering effects:

- You want to call a callback function, which may change identity, _when certain
  things change_ (not when the function itself changes). Sometimes you can
  memoize the function with useCallback, or assume someone else has done that,
  but doing so couples your effect condition to external code.
- The values you need to compare require custom comparison (like a
  deep/recursive equality check).

Here's an example situation:

```jsx
function Query({query, variables}) {
  // some code...

  // Who knows if this is a stable reference!
  const getQueryResult = useMyGraphQlLibrary()

  React.useEffect(
    () => {
      getQueryResult(query, variables)
    },
    // ⚠️ PROBLEMS!
    // - variables is a new object every render but we only want
    //   to run the effect when the username property changes
    // - getQueryResult might change but we don't want to run the
    //   effect when that happens
    [query, variables, getQueryResult],
  )

  return <div>{/* awesome UI here */}</div>
}

function QueryPageThing({username}) {
  const query = `
    query getUserData($username: String!) {
      user(login: $username) {
        name
      }
    }
  `
  const variables = {username}
  // poof! Every render `variables` will be a new object!
  return <Query query={query} variables={variables} />
}
```

> **Note**
>
> You could also solve the first problem if the `QueryPageThing` created the
> variables object like this:
> `const variables = React.useMemo(() => ({username}), [username])`. Then you
> wouldn't need this package. But sometimes you're writing a custom hook and you
> don't have control on what kinds of things people are passing you (or you want
> to give them a nice ergonomic API that can handle new objects every render).
>
> In the second case, technically you don't have to add the callback to the
> dependencies array. But the [exhaustive-deps][exhaustive-deps-lint] ESLint
> rule automatically will add it unless you disable the rule.

## This solution

This is a replacement for `React.useEffect` that accepts a comparison function
in addition to the dependencies array. The comparison function gets the previous
value of the dependencies as well as the current value, and the effect only runs
if it returns true. Additionally, dependencies doesn't have to be an array, it
can be an object or any other value.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
  - [Compatibility with `React.useEffect`](#compatibility-with-reactuseeffect)
- [Other Solutions](#other-solutions)
- [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `dependencies`:

```
npm install --save use-conditional-effect
```

## Usage

You use it in place of `React.useEffect`.

Example:

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import useConditionalEffect from 'use-conditional-effect'

function Query({query, variables}) {
  // Example: using some external library's method
  const getQueryResult = useMyGraphQlLibrary()

  // We don't need to use an array for the second argument
  // The third argument is the comparison function
  useConditionalEffect(
    () => {
      getQueryResult(query, variables)
    },
    {query, variables, getQueryResult},
    (current, previous = {}) => {
      if (
        current.query !== previous.query ||
        current.variables.username !== previous.variables.username
      ) {
        return true
      }
    },
  )

  return <div>{/* awesome UI here */}</div>
}
```

### Compatibility with `React.useEffect`

- If you don't pass the third argument, the comparison function defaults to the
  same comparison function as useEffect (thus, the second argument has to be an
  array in this case).
- If you don't pass the second or third arguments, the effect always runs (same
  as useEffect).

## Other Solutions

- https://github.com/kentcdodds/use-deep-compare-effect

## LICENSE

MIT

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]:
  https://img.shields.io/travis/alexkrolick/use-conditional-effect.svg?style=flat-square
[build]: https://travis-ci.org/alexkrolick/use-conditional-effect
[coverage-badge]:
  https://img.shields.io/codecov/c/github/alexkrolick/use-conditional-effect.svg?style=flat-square
[coverage]: https://codecov.io/github/alexkrolick/use-conditional-effect
[version-badge]:
  https://img.shields.io/npm/v/use-conditional-effect.svg?style=flat-square
[package]: https://www.npmjs.com/package/use-conditional-effect
[downloads-badge]:
  https://img.shields.io/npm/dm/use-conditional-effect.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/use-conditional-effect
[license-badge]:
  https://img.shields.io/npm/l/use-conditional-effect.svg?style=flat-square
[license]:
  https://github.com/alexkrolick/use-conditional-effect/blob/master/LICENSE
[prs-badge]:
  https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[donate-badge]:
  https://img.shields.io/badge/$-support-green.svg?style=flat-square
[coc-badge]:
  https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]:
  https://github.com/alexkrolick/use-conditional-effect/blob/master/other/CODE_OF_CONDUCT.md
[github-watch-badge]:
  https://img.shields.io/github/watchers/alexkrolick/use-conditional-effect.svg?style=social
[github-watch]: https://github.com/alexkrolick/use-conditional-effect/watchers
[github-star-badge]:
  https://img.shields.io/github/stars/alexkrolick/use-conditional-effect.svg?style=social
[github-star]: https://github.com/alexkrolick/use-conditional-effect/stargazers
[twitter]:
  https://twitter.com/intent/tweet?text=Check%20out%20use-conditional-effect%20by%20%40alexkrolick%20https%3A%2F%2Fgithub.com%2Falexkrolick%2Fuse-conditional-effect%20%F0%9F%91%8D
[twitter-badge]:
  https://img.shields.io/twitter/url/https/github.com/alexkrolick/use-conditional-effect.svg?style=social
[emojis]: https://github.com/alexkrolick/all-contributors#emoji-key
[all-contributors]: https://github.com/alexkrolick/all-contributors
[contributors]:
  https://github.com/alexkrolick/use-conditional-effect/blob/master/CONTRIBUTORS.md
[useeffect]: https://reactjs.org/docs/hooks-reference.html#useeffect
[exhaustive-deps-lint]:
  https://github.com/facebook/react/issues/14920#issuecomment-471070149
