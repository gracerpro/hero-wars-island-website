import { assert, expect, test } from 'vitest'
import { isObject } from "@/helpers/core.ts";

// Edit an assertion and save to see HMR in action

test('isObject', () => {
  expect(isObject({})).toBe(true)
  expect(isObject({a: 1})).toBe(true)

  expect(isObject(null)).toBe(false)
  expect(isObject(undefined)).toBe(false)
  expect(isObject(10)).toBe(false)
  expect(isObject(10.0)).toBe(false)
  expect(isObject("aaa")).toBe(false)
  expect(isObject([])).toBe(false)
  expect(isObject([1,2,3])).toBe(false)
  expect(isObject(true)).toBe(false)
})

test('JSON', () => {
  const input = {
    foo: 'hello',
    bar: 'world',
  }

  const output = JSON.stringify(input)

  expect(output).eq('{"foo":"hello","bar":"world"}')
  assert.deepEqual(JSON.parse(output), input, 'matches original')
})