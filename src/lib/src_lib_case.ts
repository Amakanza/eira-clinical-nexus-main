/**
 * Case conversion utilities
 * DB columns: snake_case
 * App objects: camelCase
 */

export const toCamel = (s: string): string =>
  s.replace(/[_-]([a-z0-9])/gi, (_: string, c: string) => (c ? c.toUpperCase() : ""));

export const toSnake = (s: string): string =>
  s
    // normalize spaces and dashes
    .replace(/[\s-]+/g, "_")
    // split camelCase/PascalCase boundaries
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    // collapse multiple underscores
    .replace(/__+/g, "_")
    .toLowerCase();

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (Object.prototype.toString.call(value) !== "[object Object]") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

export function camelKeys<T = any>(input: unknown): T {
  if (Array.isArray(input)) return input.map(camelKeys) as T;
  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) out[toCamel(k)] = camelKeys(v);
    return out as T;
  }
  return input as T;
}

export function snakeKeys<T = any>(input: unknown): T {
  if (Array.isArray(input)) return input.map(snakeKeys) as T;
  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) out[toSnake(k)] = snakeKeys(v);
    return out as T;
  }
  return input as T;
}
