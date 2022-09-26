import { NgZone } from '@angular/core';

export class ResizeListener {
  private observer: ResizeObserver;
  private oldRect?: DOMRectReadOnly;

  public constructor(
    private readonly zone: NgZone,
    private readonly element: HTMLElement,
    private readonly onResize: () => void
  ) {
    this.observer = new ResizeObserver((entries) =>
      this.zone.run(() => this.observe(entries))
    );
    this.observer.observe(element);
  }

  public destroy(): void {
    this.observer.disconnect();
  }

  private observe(entries: ResizeObserverEntry[]): void {
    const domSize = entries[0];
    this.oldRect = domSize.contentRect;
    this.onResize();
  }
}
