import { plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { mapKeys } from './map-cases';

export interface DeserializeOptions {
  camelCase: boolean;
}

const defaulteserializeOptions: DeserializeOptions = {
  camelCase: false,
};

function deserializeThis<T>(targetClass: ClassType<T>, value, options: DeserializeOptions) {
  const deserializeFunction = (result: T) => {
    const valueD = options.camelCase ? mapKeys(result, 'camel') : result;

    return plainToClass(targetClass, valueD);
  };

  if (value instanceof Observable) {
    return value.pipe(map(deserializeFunction));
  }

  return deserializeFunction(value);
}

// tslint:disable-next-line:naming-convention
export function Deserialize<T>(
  targetClass: ClassType<T>,
  options: DeserializeOptions = defaulteserializeOptions,
) {
  return (
    // tslint:disable-next-line:ban-types
    _target: Object,
    _propertyName: string,
    propertyDesciptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const method = propertyDesciptor.value;

    // tslint:disable-next-line:no-any
    propertyDesciptor.value = function(...args: any[]) {
      const result = method.apply(this, args);

      return deserializeThis(targetClass, result, options);
    };

    return propertyDesciptor;
  };
}
