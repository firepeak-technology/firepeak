import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function serialize<T>(serializer: (value: T) => T) {
  return (o: Observable<T>): Observable<T> => {
    return o.pipe(map(serializer));
  };
}

export function serializeArray<T>(serializer: (value: T) => T) {
  return (o: Observable<T[]>): Observable<T[]> => {
    return o.pipe(map(values => values.map(serializer)));
  };
}

export function deserialize<T>(deserializer: (value: T) => T) {
  return (o: Observable<T>): Observable<T> => {
    return o.pipe(map(deserializer));
  };
}

export function deserializeArray<T>(deserializer: (value: T) => T) {
  return (o: Observable<T[]>): Observable<T[]> => {
    return o.pipe(map(values => values.map(deserializer)));
  };
}
