// tslint:disable:no-any
// tslint:disable:no-unsafe-any
import {BehaviorSubject, Observable} from 'rxjs';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {isEqual} from "./is-equal";

type Reducer<T> = (state: T) => T;
type Selector<T, R> = (state: T) => R;


export interface State<T extends Record<string, any>> {
  readonly value: T;
  readonly initialValue: T;

  reset(): void;

  set(reducer: (state: T) => T): T;

  set<K extends keyof T>(key: K, value: T[K]): T;


  select<U>(selector: (state: T) => U): Observable<U>;

  select<U>(selector: (state: T) => U, condition: (state: T) => boolean): Observable<U>;

  select<K extends keyof T>(key: K): Observable<T[K]>;

  get<U>(selector: (state: T) => U): U;

  get<K extends keyof T>(key: K): T[K];
}

class StateImpl<T extends Record<string, any>> implements State<T> {
  private readonly state: BehaviorSubject<T>;

  public get value(): T {
    return this.state.value;
  }

  public readonly initialValue: T;

  public constructor(initialValue: T) {
    this.initialValue = initialValue;
    this.state = new BehaviorSubject<T>(initialValue);
  }

  public reset(): void {
    this.state.next(this.initialValue);
  }

  public set: State<T>['set'] = (reducer: string | Reducer<T>, value?: any): T => {
    const state = this.value;
    const nextState = typeof reducer === 'string' ? {...state, [reducer]: value} : reducer(state);

    if (nextState !== state) {
      this.state.next(nextState);
    }

    return nextState;
  };

  public select: State<T>['select'] = (
    selector: string | Selector<T, any>,
    condition?: (state: T) => boolean,
  ): Observable<any> => {
    if (condition) {
      return this.state.pipe(
        filter(condition),
        map(typeof selector === 'string' ? s => s[selector] : selector),
        distinctUntilChanged(isEqual),
      );
    }

    return this.state.pipe(
      map(typeof selector === 'string' ? s => s[selector] : selector),
      distinctUntilChanged(isEqual),
    );
  };

  // tslint:disable-next-line:no-any
  public get: State<T>['get'] = (selector: string | Selector<T, any>): any =>
    typeof selector === 'string' ? this.value[selector] : selector(this.value);

}

export function makeState<T extends Record<string, any>>(initialState: T): State<T> {
  return new StateImpl(initialState);
}
