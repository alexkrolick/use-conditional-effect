// eslint-disable react-hooks/exhaustive-deps

import React from 'react'

function shallowEquals(a, b) {
  let isEqual = true
  // technically equal but we always run effects with there are no dependencies
  if (a === undefined && b === undefined) {
    isEqual = false
    // compare array *values* and length
  } else if (Array.isArray(a) && Array.isArray(b)) {
    for (const i in a) {
      if (!Object.is(a[i], b[i])) isEqual = false
    }
    if (a.length !== b.length) isEqual = false
    // compare everything else by identity
  } else {
    isEqual = Object.is(a, b)
  }
  return isEqual
}

function getArtificialDependency() {
  return {}
}

function useConditionalEffect(callback, dependencies, isEqual = shallowEquals) {
  const lastDependenciesValue = React.useRef(undefined)
  const artificialDep = React.useRef(getArtificialDependency())
  const shouldRunEffect = !isEqual(dependencies, lastDependenciesValue.current)
  React.useEffect(
    callback,
    shouldRunEffect
      ? [(artificialDep.current = getArtificialDependency())]
      : [artificialDep.current],
  )
  lastDependenciesValue.current = dependencies
}

export default useConditionalEffect
