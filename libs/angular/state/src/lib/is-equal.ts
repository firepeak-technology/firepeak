export function isEqual(value, other) {
  return value === other || (value !== value && other !== other);
}
