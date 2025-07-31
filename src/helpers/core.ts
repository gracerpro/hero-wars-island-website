// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isObject(o: any) {
  return o !== null && typeof o === "object" && !Array.isArray(o);
}
