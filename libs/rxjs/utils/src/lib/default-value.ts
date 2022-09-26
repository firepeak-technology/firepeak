import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {nullOrUndefined} from './null-or-undefined';

export function toDefault<T>(defaultValue: T) {
  return (o: Observable<T | null | undefined>): Observable<NonNullable<T>> =>
    o.pipe(map(value => (nullOrUndefined(value) ? defaultValue : value))) as Observable<NonNullable<T>>;
}

// tslint:disable-next-line:no-any
export function valueOrDefault<T>(defaultValue: T, mapTo?: (value: any) => T) {
  return (o: Observable<T | null | undefined>): Observable<NonNullable<T>> =>
    o.pipe(map(value => (nullOrUndefined(value) ? defaultValue : mapTo ? mapTo(value) : value))) as Observable<NonNullable<T>>;
}


of([null, 'abc']).pipe(valueOrDefault(value => value, 'abc'))
