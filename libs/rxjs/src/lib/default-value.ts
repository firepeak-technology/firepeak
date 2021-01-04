import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { nullOrUndefined } from './null-or-undefined';

export function toDefault<T>(defaultValue: T) {
  return (o: Observable<T | null | undefined>): Observable<NonNullable<T>> => {
    return o.pipe(map(value => (nullOrUndefined(value) ? defaultValue : value))) as Observable<
      NonNullable<T>
    >;
  };
}
export function valueOrDefault<T>(mapTo: (value: any) => T, defaultValue: T) {
  return (o: Observable<T | null | undefined>): Observable<NonNullable<T>> => {
    return o.pipe(
      map(value => (nullOrUndefined(value) ? defaultValue : mapTo(value))),
    ) as Observable<NonNullable<T>>;
  };
}
