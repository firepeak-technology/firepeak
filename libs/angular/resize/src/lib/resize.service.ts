import { Injectable, NgZone } from '@angular/core';

import { ResizeListener } from './resize.listener';

interface ResizeElementParams {
  nativeElement: HTMLElement;
  onResize: () => void;
}
interface ResizeIdParams {
  /**
   * Id of the htmlElement where the resizeObserver should listen to
   */
  id: string;
  /**
   * Function that should be executed when resize occurs
   */
  onResize: () => void;
}
type ResizeParams = ResizeElementParams | ResizeIdParams;

@Injectable({
  providedIn: 'root',
})
export class ResizeService {
  private resizeMap = new Map<string, ResizeListener>();

  public constructor(private readonly zone: NgZone) {}

  /**
   *
   * @param id - unique id for the resizeObservers, later it can be easily destroyed
   * @param params
   */
  public registerObserver(id: string, params: ResizeParams): void {
    this.destroy(id);
    const element =
      'id' in params
        ? document.getElementById(params.id)
        : params.nativeElement;

    if (!element) {
      console.warn('element not found to resize');
    }

    this.resizeMap.set(
      id,
      new ResizeListener(this.zone, element!, params.onResize)
    );
  }

  public destroy(id: string): void {
    this.resizeMap.get(id)?.destroy();
    this.resizeMap.delete(id);
  }
}
