import {Injectable, OnDestroy} from '@angular/core';
import {firstValueFrom, merge, Observable, of, ReplaySubject, Subject,} from 'rxjs';
import {catchError, debounceTime, filter, switchMap, takeUntil, tap,} from 'rxjs/operators';
import {makeState} from './state';
import {LoggingService} from "./logging.service";
import {SnackbarService} from "./snackbar.service";
import {LoadingStatus} from "./loading-status";

const enum Actions {
  LOAD = 'LOAD',
}

interface State<Item> {
  data?: Item | null;
  loading: LoadingStatus;
}

const INITIALLOADINGSTATE = (loading: Partial<LoadingStatus> = {}): LoadingStatus => {
  return {
    ...loading,
    data: false,
    create: false,
    update: false,
    delete: false
  }
}

function INITIALSTATE<T>(): State<T> {
  return {
    loading: INITIALLOADINGSTATE()
  };
}


@Injectable()
export abstract class AbstractState<Item, ID, SINGLEITEM = Item> implements OnDestroy {
  private readonly actions$ = new ReplaySubject(1);

  private readonly state = makeState<State<Item>>(INITIALSTATE());

  private readonly loadEffects$: Observable<unknown>;
  protected destroy$ = new Subject<void>();

  protected abstract clearCurrentValue(): void;

  protected abstract setCurrentValue(item: Item): void;


  protected abstract createItem(item: SINGLEITEM): void;

  protected abstract updateItem(item: SINGLEITEM): void;

  protected abstract deleteItem(item: ID): void;

  protected constructor(
    protected readonly loggingService: LoggingService,
    protected readonly snackbarService?: SnackbarService,
  ) {

    this.loadEffects$ = this.actions$.pipe(
      debounceTime(200),
      filter(action => action === Actions.LOAD),
      tap(() => this.state.reset()),
      tap(() => this.clearCurrentValue()),
      switchMap(() => this.fetchApi()),
      tap(item => {
        this.setCurrentValue(item);
        this.updateLoading({data: false})
      }),
      catchError(error => {
        console.error(error);

        this.state.set(state => ({
          ...state,
          error: true,
        }));

        return of(false);
      }),
    );
  }


  public initialize() {
    this.initCollectiion();
  }

  public load() {
    this.actions$.next(Actions.LOAD);
  }

  public reset() {
    this.state.reset();
  }

  public ngOnDestroy(): void {
    this.destroy();
  }

  public reload() {
    this.reset();
    this.load();
  }

  public destroy() {
    this.destroy$.next();
  }

  public async create(partialData: Partial<SINGLEITEM>) {
    this.updateLoading({create: true});

    const saved = await firstValueFrom(this.saveApi(partialData)).catch(error => {
      console.error(error)
      return {error: error}
    });
    this.updateLoading({create: false});

    if ('error' in saved) {
      const {error} = saved
      this.sendMessage(this.createErrorNotify(partialData), true);
      this.loggingService.captureError(error)
      throw new Error(error);
    }

    this.createItem(saved);
    this.sendMessage(this.createNotify(saved), false);

    return saved;
  }

  public async delete(id: ID)  {

    this.updateLoading({delete: true});

    const deleted = await firstValueFrom(this.deleteApi(id)).catch(error => {
      console.error(error)
      return {error}
    });
    this.updateLoading({delete: false});

    if ('error' in deleted) {
      const {error} = deleted
      this.sendMessage(this.deleteErrorNotify(id), true);
      this.loggingService.captureError(error)
      throw new Error(error);
    }

    this.deleteItem(id);
    this.sendMessage(this.deleteNotify(id), false);

    return id;
  }

  public async save(partialData: Partial<SINGLEITEM>) {
    this.updateLoading({update: true});

    const saved = await firstValueFrom(this.saveApi(partialData)).catch(error => {
      console.error(error)
      return {error}
    });
    this.updateLoading({update: false});


    if ('error' in saved) {
      const {error} = saved
      this.sendMessage(this.saveErrorNotify(partialData), true);
      this.loggingService.captureError(error)
      throw new Error(error);
    }

    this.updateItem(saved);
    this.sendMessage(this.saveNotify(saved), false);

    return saved;
  }

  protected initCollectiion() {
    merge(this.loadEffects$).pipe(takeUntil(this.destroy$)).subscribe();
  }

  protected updateLoading(loading: Partial<LoadingStatus>) {
    this.state.set(state => ({...state, loading: {...state.loading, ...loading}}));
  }

  protected getData(){
    return this.state.get('data')
  }

  protected updateData(data: Item | null) {
    this.state.set(state => ({...state, data: data}));
  }

  protected abstract fetchApi(): Observable<Item>;

  protected createApi(partialData: Partial<SINGLEITEM>): Observable<SINGLEITEM> {
    throw Error('implement the create api');
  }

  protected createNotify(item: Partial<SINGLEITEM>): string | null {
    return null;
  }

  protected createErrorNotify(item: Partial<SINGLEITEM>): string | null {
    return null;
  }

  protected saveApi(partialData: Partial<SINGLEITEM>): Observable<SINGLEITEM> {
    throw Error('implement the save api');
  }

  protected saveNotify(item: Partial<SINGLEITEM>): string | null {
    return null;
  }

  protected saveErrorNotify(item: Partial<SINGLEITEM>): string | null {
    return null;
  }

  protected deleteApi(id: ID): Observable<SINGLEITEM | ID> {
    throw Error('implement the delete api');
  }

  protected deleteNotify(id: ID): string | null {
    return null;
  }

  protected deleteErrorNotify(id: ID): string | null {
    return null;
  }


  protected sendMessage(message: string | undefined | null, error: boolean) {
    if (!this.snackbarService || !message) {
      return;
    }

    if (error) {
      this.snackbarService?.error(message);

      return;
    }

    this.snackbarService?.success(message);
  }


}
