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

/***
 *
 When value is undefined or null the default value will be shown

 ```typescript
 of(['abc', null, 'bcd', undefined, '' ]).pipe(
 valueOrDefault('default')
 ).subscribe(console.log)

 // 'abc', 'default', 'bcd', 'default', ''
 ```
 */
export function valueOrDefault<T>(mapTo: (value: any) => T, defaultValue: T) {
  return (o: Observable<T | null | undefined>): Observable<NonNullable<T>> => {
    return o.pipe(
      map(value => (nullOrUndefined(value) ? defaultValue : mapTo(value))),
    ) as Observable<NonNullable<T>>;
  };
}
