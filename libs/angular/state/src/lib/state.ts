// tslint:disable:no-any
// tslint:disable:no-unsafe-any
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import {isEqual} from "./is-equal";

type Reducer<T> = (state: T) => T;
type Selector<T, R> = (state: T) => R;

/**
 * A simple State/Store object which wraps an `rxjs` `BehaviorSubject` and which can be used to
 * easily manage state (in services, for exaple).
 */
export interface State<T extends Record<string, any>> {
  /**
   * The current value of the state.
   */
  readonly value: T;
  /**
   * The initial value of the state.
   */
  readonly initialValue: T;

  /**
   * Resets the state to the initial value.
   */
  reset(): void;

  /**
   * Sets a new the state by reducing the current state.
   *
   * @param reducer
   *    Reducer function which receives the current state and should return the new state.
   *
   * @returns The new state.
   */
  set(reducer: (state: T) => T): T;

  /**
   * Sets a slice of the state to the specified value in an immutable way.
   *
   * @param key
   *    The key whose value is to be updated.
   * @param value
   *    The value which is to be set.
   *
   * @returns The new state.
   */
  set<K extends keyof T>(key: K, value: T[K]): T;

  /**
   * Gets an observable which maps the state using the specified selector.
   *
   * @param selector
   *    A function which receives the current state and returns the selected/computed value which is
   *    to be emitted.
   */
  select<U>(selector: (state: T) => U): Observable<U>;

  // tslint:disable-next-line:unified-signatures
  select<U>(selector: (state: T) => U, condition: (state: T) => boolean): Observable<U>;

  /**
   * Gets an observable which emits a slice of the state.
   *
   * @param key
   *    The slice of the state which is to be emitted.
   */
  select<K extends keyof T>(key: K): Observable<T[K]>;

  /**
   * Selects a part of the state synchronously.
   *
   * @param selector
   *    A function which receives the current state and returns the selected/computed value which is
   *    to be returned immediately.
   */
  get<U>(selector: (state: T) => U): U;

  /**
   * Gets a slice of the state.
   *
   * @param key
   *    The slice of the state which is to be returned immediately.
   */
  get<K extends keyof T>(key: K): T[K];
}

/**
 * Actual implementation of the `State` interface which is not part of the public API of the module.
 * We use a class to make it faster and easier to deal with overloads, etc.
 */
class StateImpl<T extends Record<string, any>> implements State<T> {
  public get value(): T {
    return this._state$.value;
  }
  public readonly initialValue: T;

  public constructor(initialValue: T) {
    this.initialValue = initialValue;
    this._state$ = new BehaviorSubject<T>(initialValue);
  }

  public reset(): void {
    this._state$.next(this.initialValue);
  }

  public set: State<T>['set'] = (reducer: string | Reducer<T>, value?: any): T => {
    const state = this.value;
    const nextState = typeof reducer === 'string' ? { ...state, [reducer]: value } : reducer(state);

    if (nextState !== state) {
      this._state$.next(nextState);
    }

    return nextState;
  };

  public select: State<T>['select'] = (
    selector: string | Selector<T, any>,
    condition?: (state: T) => boolean,
  ): Observable<any> => {
    if (condition) {
      return this._state$.pipe(
        filter(condition),
        map(typeof selector === 'string' ? s => s[selector] : selector),
        distinctUntilChanged(isEqual),
      );
    }

    return this._state$.pipe(
      map(typeof selector === 'string' ? s => s[selector] : selector),
      distinctUntilChanged(isEqual),
    );
  };

  // tslint:disable-next-line:no-any
  public get: State<T>['get'] = (selector: string | Selector<T, any>): any =>
    typeof selector === 'string' ? this.value[selector] : selector(this.value);

  private readonly _state$: BehaviorSubject<T>;
}

/**
 * Makes a new `Store` object.
 *
 * @param initialState
 *    The initial state to be set on the `State`.
 */
export function makeState<T>(initialState: T): State<T> {
  return new StateImpl(initialState);
}
