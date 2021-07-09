import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export function nullOrUndefined(value) {
  return value === undefined || value === null;
}

/***
 *
 Filter non null or undefined values
 ```typescript
 of(['abc', null, 'bcd', undefined, '' ]).pipe(
 isNotNullOrUndefined()
 ).subscribe(console.log)

 // 'abc', 'bcd', ''
 ```
 */
export function isNotNullOrUndefined<T>() {
  return (o: Observable<T | null | undefined>): Observable<NonNullable<T>> => {
    return o.pipe(filter(v => !nullOrUndefined(v))) as Observable<NonNullable<T>>;
  };
}

/**
 *
 Filter all null or undefined values
 ```typescript
 of(['abc', null, 'bcd', undefined, '' ]).pipe(
 nullOrUndefined()
 ).subscribe(console.log)

 // null, undefined
 ```
 */
export function isNullOrUndefined<T>() {
  return (o: Observable<T | null | undefined>): Observable<null | undefined> => {
    return o.pipe(filter(nullOrUndefined));
  };
}
