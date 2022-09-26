import { Injectable, OnDestroy } from '@angular/core';
import {
  combineLatest,
  EMPTY,
  firstValueFrom,
  merge,
  Observable,
  of,
  ReplaySubject,
  Subject,
} from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { makeState } from './state';

const enum Actions {
  LOAD = 'LOAD',
}

export interface UpdateAll<Item> {
  new?: Array<Partial<Item>>;
  update: Array<Partial<Item>>;
  delete?: Array<Partial<Item>>;
}

export interface CollectionStatus {
  lastCreatedId?: number;
  loading: boolean;
  loadingSave: boolean;
  error: boolean;
  errorSave: boolean;
  successSave: boolean;
  successDelete: boolean;
}

interface State<Item> {
  items?: Item[];
  status: CollectionStatus;
}

// tslint:disable-next-line:no-any
const INITIAL_STATE: State<any> = {
  status: {
    error: false,
    errorSave: false,
    loading: true,
    loadingSave: false,
    successDelete: false,
    successSave: false,
  },
};

export interface WithId {
  id: number;
}

export function mergeStatus(...status$: Array<Observable<CollectionStatus>>) {
  return combineLatest([...status$]).pipe(
    map(statusses => {
      return {
        loading: statusses.every(l => l.loading),
        loadingSave: statusses.every(l => l.loadingSave),
        error: statusses.every(l => l.error),
        errorSave: statusses.every(l => l.errorSave),
        successSave: statusses.every(l => l.successSave),
        successDelete: statusses.every(l => l.successDelete),
      };
    }),
  );
}

@Injectable()
export abstract class Collection<Item extends WithId> implements OnDestroy {
  public loading$: Observable<boolean>;
  public loaded$: Observable<boolean>;
  public error$: Observable<boolean>;
  public status$: Observable<CollectionStatus>;

  // TODO add while we are adding more things
  public loadEffects$: Observable<unknown>;
  protected _destroy$ = new Subject<void>();

  protected constructor(
    protected readonly _sentryService: SentryService,
    protected readonly _snackbar?: SnackbarService,
  ) {
    this.loading$ = this._state.select(state => state.status.loading);
    this.loaded$ = this._state.select(state => !state.status.loading);
    this.error$ = this._state.select(state => state.status.error);

    this.status$ = this._state.select(state => state.status);

    this.loadEffects$ = this._actions$.pipe(
      debounceTime(200),
      filter(action => action === Actions.LOAD),
      tap(() => this._state.reset()),
      tap(() => this._currentValues.clear()),
      switchMap(() => this._fetchApi()),
      tap(items => {
        items.forEach(item => {
          this._currentValues.set(item.id, item);
        });

        this._state.set(state => ({
          ...state,
          items,
          status: { ...INITIAL_STATE.status, loading: false },
        }));
      }),
      catchError(error => {
        console.error(error);

        this._state.set(state => ({
          ...state,
          error: true,
        }));

        return of(false);
      }),
    );
  }

  public find(id: number) {
    return this.getItems().pipe(map(items => items.find(item => item.id === id)));
  }

  public findCurrent(id: number) {
    return this._currentValues.get(id);
  }

  public getItems(): Observable<Item[]> {
    return this._items$;
  }

  public initialize() {
    this._initCollectiion();
  }

  public load() {
    this._actions$.next(Actions.LOAD);
  }

  public reset() {
    this._state.reset();
  }

  public ngOnDestroy(): void {
    this.destroy();
  }

  public reload() {
    this.reset();
    this.load();
  }

  public destroy() {
    this._destroy$.next();
  }

  public create(partialData: Partial<Item>) {
    this._changeStatus({
      errorSave: false,
      lastCreatedId: undefined,
      loadingSave: true,
      successSave: false,
    });
    this._createApi(partialData)
      .pipe(
        take(1),
        tap(item => this._addItem(item)),
        tap(value =>
          this._changeStatus({ lastCreatedId: value.id, loadingSave: false, successSave: true }),
        ),
        tap(item => this._sendMessage(this._createNotify(item), false)),
        catchError(error => {
          this._sentryService.captureError(error);
          this._changeStatus({ loadingSave: false, errorSave: true });
          this._sendMessage(this._createErrorNotify(partialData), true);

          return EMPTY;
        }),
      )
      .subscribe();
  }

  public async delete(id: number): Promise<void> {
    this._changeStatus({ loadingSave: true, errorSave: false, successDelete: false });
    await firstValueFrom(
      this._deleteApi(id).pipe(
        take(1),
        tap(() => this._deleteItem(id)),
        tap(() => this._changeStatus({ loadingSave: false, successDelete: true })),
        tap(() => this._sendMessage(this._deleteNotify(id), false)),
        catchError(error => {
          this._sentryService.captureError(error);
          this._changeStatus({ loadingSave: false, errorSave: true });
          this._sendMessage(this._deleteErrorNotify(id), true);

          return EMPTY;
        }),
      ),
    );

    return;
  }

  public save(partialData: Partial<Item>) {
    this._changeStatus({ loadingSave: true, errorSave: false, successSave: false });
    this._saveApi(partialData)
      .pipe(
        take(1),
        tap(() => this._changeStatus({ loadingSave: false, successSave: true })),
        tap(item => this._updateItem(item)),
        tap(item => this._sendMessage(this._saveNotify(item), false)),
        catchError(error => {
          this._sentryService.captureError(error);
          this._changeStatus({ loadingSave: false, errorSave: true });
          this._sendMessage(this._saveErrorNotify(partialData), true);

          return EMPTY;
        }),
      )
      .subscribe();
  }

  public saveAll(list: Array<Partial<Item>>) {
    this._changeStatus({ loadingSave: true, errorSave: false, successSave: false });
    this._saveAllApi(list)
      .pipe(
        take(1),
        tap(() => this._changeStatus({ loadingSave: false, successSave: true })),
        catchError(error => {
          this._sentryService.captureError(error);
          this._changeStatus({ loadingSave: false, errorSave: true });

          return EMPTY;
        }),
        // TODO update the new item    tap(() => this.load()),
      )
      .subscribe();
  }

  public updateAll(items: UpdateAll<Item>): void {
    if (isEmpty(items.new) && isEmpty(items.update) && isEmpty(items.delete)) {
      return;
    }

    const newItems = isEmpty(items.new)
      ? []
      : items.new.map(item => this._createApi(item).pipe(tap(i => this._addItem(i))));
    const updateItems = isEmpty(items.update)
      ? []
      : items.update.map(item => this._saveApi(item).pipe(tap(i => this._updateItem(i))));
    const deleteItems = isEmpty(items.delete)
      ? []
      : items.delete.map(item => this._deleteApi(item.id).pipe(tap(i => this._deleteItem(i.id))));

    this._changeStatus({ loadingSave: true, errorSave: false, successSave: false });

    combineLatest([...newItems, ...updateItems, ...deleteItems])
      .pipe(
        take(1),
        tap(() => this._changeStatus({ loadingSave: false, successSave: true })),
        catchError(error => {
          this._sentryService.captureError(error);
          this._changeStatus({ loadingSave: false, errorSave: true });

          return EMPTY;
        }),
        // TODO update the new item    tap(() => this.load()),
      )
      .subscribe();
  }

  protected _initCollectiion() {
    merge(this.loadEffects$).pipe(takeUntil(this._destroy$)).subscribe();
  }

  protected _changeStatus(statusPart: Partial<CollectionStatus>) {
    this._state.set(state => ({ ...state, status: { ...state.status, ...statusPart } }));
  }

  protected abstract _fetchApi(): Observable<Item[]>;

  protected _createApi(_partialData: Partial<Item>): Observable<Item> {
    throw Error('implement the create api');
  }

  protected _createNotify(_item: Partial<Item>): string {
    return undefined;
  }

  protected _createErrorNotify(_item: Partial<Item>): string {
    return undefined;
  }

  protected _saveApi(_partialData: Partial<Item>): Observable<Item> {
    throw Error('implement the save api');
  }

  protected _saveNotify(_item: Partial<Item>): string {
    return undefined;
  }

  protected _saveErrorNotify(_item: Partial<Item>): string {
    return undefined;
  }

  protected _saveAllApi(_list: Array<Partial<Item>>): Observable<Item[]> {
    throw Error('implement the save api');
  }

  protected _deleteApi(_id: number): Observable<Item> {
    throw Error('implement the delete api');
  }

  protected _deleteNotify(_id: number): string {
    return undefined;
  }

  protected _deleteErrorNotify(_id: number): string {
    return undefined;
  }

  protected _updateItem(item: Item) {
    const items = this._state.get('items');
    const newItems = items.map(it => (it.id === item.id ? item : it));

    this._state.set('items', newItems);

    this._currentValues.set(item.id, item);
  }

  protected _sendMessage(message: string | undefined, error: boolean) {
    if (!this._snackbar || !message) {
      return;
    }

    if (error) {
      this._snackbar.error(message);

      return;
    }

    this._snackbar.success(message);
  }

  protected _deleteItem(id: number) {
    this._state.set(
      'items',
      this._state.get('items').filter(i => i.id !== id),
    );
    this._currentValues.delete(id);
  }

  private readonly _currentValues = new Map<number, Item>();
  private readonly _state = makeState<State<Item>>(INITIAL_STATE);
  private readonly _actions$ = new ReplaySubject(1);
  private readonly _items$: Observable<Item[]> = this._state.select(
    state => state.items,
    state => !state.status.loading,
  );

  protected _addItem(item: Item) {
    this._state.set('items', [...this._state.get('items'), item]);
    this._currentValues.set(item.id, item);
  }
}
