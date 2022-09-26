function toCamel(value: string): string {
  return value.replace(/([-_][a-z])/gi, $1 => {
    return $1
      .toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
}

function isObject<T>(o: T | undefined): boolean {
  return o === Object(o) && !Array.isArray(o) && typeof o !== 'function';
}

function changeKeys<T>(o: T | T[], transform: (value: string) => string) {
  if (isObject(o)) {
    const n = {};

    Object.keys(o).forEach((k: string) => {
      n[transform(k)] = changeKeys(o[k], transform);
    });

    return n;
  } else if (Array.isArray(o)) {
    return o.map(i => {
      return changeKeys(i, transform);
    });
  }

  return o;
}

type MapFunction = (value: string) => string;

const functionMapper: Record<string, MapFunction> = {
  camel: toCamel,
};

export function mapKeys<T>(value: T | T[], mapTo: keyof typeof functionMapper) {
  return changeKeys(value, functionMapper[mapTo]);
}
