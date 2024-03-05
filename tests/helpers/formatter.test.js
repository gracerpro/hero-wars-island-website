import { expect, test } from 'vitest'
import { getHumanQuantity } from "../../src/helpers/formatter.js";

test('getHumanQuantity', () => {
  expect(getHumanQuantity(0)).toBe("0")
  expect(getHumanQuantity(10)).toBe("10")
  expect(getHumanQuantity(999)).toBe("999")
  expect(getHumanQuantity(1000)).toBe("1K")
  expect(getHumanQuantity(1100)).toBe("1.1K")
  //expect(getHumanQuantity(1110)).toBe("1.1K") TODO
  expect(getHumanQuantity(1000000)).toBe("1M")
  expect(getHumanQuantity(1000000000)).toBe("1000M")
})
