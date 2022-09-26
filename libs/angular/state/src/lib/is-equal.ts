export function isEqual<T>(value:T, other:T) {
  return value === other || (value !== value && other !== other);
}
