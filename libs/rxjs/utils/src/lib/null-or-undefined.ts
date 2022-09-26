import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

export function nullOrUndefined<T>(value: T | null | undefined) {
  return value === undefined || value === null;
}

/**
 * Operator to check if the value is not null or undefined.
 *
 */
export function isNotNullOrUndefined<T>() {
  return (o: Observable<T | null | undefined>): Observable<NonNullable<T>> =>
    o.pipe(filter(v => !nullOrUndefined(v))) as Observable<NonNullable<T>>;
}

export function isNullOrUndefined<T>() {
  return (o: Observable<T | null | undefined>): Observable<null | undefined> =>
    o.pipe(filter(v => nullOrUndefined(v))) as Observable<null | undefined>;
}
