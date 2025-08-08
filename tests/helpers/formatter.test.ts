import { expect, test, vi } from 'vitest'
import { getHumanQuantity, formatDate, fromCurrentDate } from "@/helpers/formatter.ts";

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

test('formatDate', () => {
  expect(formatDate(new Date(2000, 0, 1))).toBe("01.01.2000")
})

test('fromCurrentDate', () => {
  const now = new Date("2000-01-01")
  vi.setSystemTime(now)
  expect(fromCurrentDate(now, "en")).toBe("1 Jan");
  expect(fromCurrentDate(new Date("1999-01-01"), "en")).toBe("1 Jan 1999");
  expect(fromCurrentDate(new Date("2001-01-01"), "en")).toBe("1 Jan 2001");
  vi.setSystemTime(new Date())
})
