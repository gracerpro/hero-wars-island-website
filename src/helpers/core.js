export function isObject(o) {
  return o !== null && typeof o === "object" && !Array.isArray(o);
}
