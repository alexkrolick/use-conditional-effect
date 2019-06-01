import {renderHook, cleanup} from 'react-hooks-testing-library'
import useConditionalEffect from '../'

afterEach(cleanup)

describe('compatible with useEffect', () => {
  test('shallow compares dependency array values', () => {
    const callback = jest.fn()
    let deps = [1, 2]

    const {rerender} = renderHook(() => useConditionalEffect(callback, deps))

    expect(callback).toHaveBeenCalledTimes(1)
    callback.mockClear()

    deps = [2, 1]
    rerender()
    expect(callback).toHaveBeenCalledTimes(1)
    callback.mockClear()

    deps = [2, 1]
    rerender()
    expect(callback).toHaveBeenCalledTimes(0)
    callback.mockClear()

    deps = [2, 1, {a: 1}]
    rerender()
    expect(callback).toHaveBeenCalledTimes(1)
    callback.mockClear()
  })

  test('always runs with no dependencies are passed', () => {
    const callback = jest.fn()
    const {rerender} = renderHook(() => useConditionalEffect(callback))

    expect(callback).toHaveBeenCalledTimes(1)
    callback.mockClear()

    rerender()
    expect(callback).toHaveBeenCalledTimes(1)
    callback.mockClear()
  })
})

describe('custom comparison function', () => {
  test('uses custom comparison function when provided', () => {
    const callback = jest.fn()
    let deps = [1]
    const compare = jest.fn((a, b) => Object.is(a, b))

    const {rerender} = renderHook(() =>
      useConditionalEffect(callback, deps, compare),
    )

    expect(compare).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledTimes(1)
    callback.mockClear()

    // expect the effect to run here because the custom
    // comparison uses object identity on the whole array
    // instead of shallow comparison on the array values like the default
    deps = [1]
    rerender()
    expect(callback).toHaveBeenCalledTimes(1)
    callback.mockClear()
  })

  test('example: identity comparison', () => {
    const callback = jest.fn()
    let deps = [1]
    const compare = jest.fn((a, b) => Object.is(a, b))

    const {rerender} = renderHook(() =>
      useConditionalEffect(callback, deps, compare),
    )

    expect(compare).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledTimes(1)
    callback.mockClear()

    // expect the effect to run here because the custom
    // comparison uses object identity on the whole array
    // instead of shallow comparison on the array values like the default
    deps = [1]
    rerender()
    expect(callback).toHaveBeenCalledTimes(1)
    callback.mockClear()
  })

  test('example: deep comparison', () => {
    const callback = jest.fn()
    // note we can use an object for easier lookup
    let deps = {
      query: 'search',
      variables: {username: 'ak'},
    }
    const shouldRunEffect = (current, previous) => {
      if (!previous) return true
      if (
        current.query !== previous.query &&
        current.variables.username !== previous.variables.username
      ) {
        return true
      }
      return false
    }

    const {rerender} = renderHook(() =>
      useConditionalEffect(callback, deps, shouldRunEffect),
    )

    expect(callback).toHaveBeenCalledTimes(1)
    callback.mockClear()

    deps = {
      query: 'search',
      variables: {username: 'someone_else'},
    }
    rerender()
    expect(callback).toHaveBeenCalledTimes(1)
    callback.mockClear()
  })
})
