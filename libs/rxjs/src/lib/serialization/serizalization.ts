import { classToPlain } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { mapKeys } from './map-cases';

export interface SerializationOption {
  camelCase: boolean;
}

const defaulteserializeOptions: SerializationOption = {
  camelCase: false,
};

function deserializeThis<T>(targetClass: ClassType<T>, value, options: SerializationOption) {
  const deserializeFunction = (result: T) => {
    const valueD = options.camelCase ? mapKeys(result, 'camel') : result;

    return classToPlain(targetClass, valueD);
  };

  if (value instanceof Observable) {
    return value.pipe(map(deserializeFunction));
  }
  return deserializeFunction(value);
}

export function Serialize<T>(
  targetClass: ClassType<T>,
  options: SerializationOption = defaulteserializeOptions,
) {
  return function(
    target: Object,
    propertyName: string,
    propertyDesciptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const method = propertyDesciptor.value;

    propertyDesciptor.value = function(...args: any[]) {
      // convert list of greet arguments to string
      const params = args.map(a => JSON.stringify(a)).join();

      // invoke greet() and get its return value
      const result = method.apply(this, args);

      // return the result of invoking the method
      return deserializeThis(targetClass, result, options);
    };

    return propertyDesciptor;
  };
}
