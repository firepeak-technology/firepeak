import {
  Directive,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { ResizeService } from './resize.service';

@Directive({
  selector: '[fpResize]',
})
export class ResizedDirective implements OnInit, OnDestroy {
  @Output()
  public readonly resized = new EventEmitter<void>();

  private readonly id = uuidv4();
  public constructor(
    private readonly element: ElementRef,
    private readonly resizeService: ResizeService
  ) {}

  public ngOnInit(): void {
    this.resizeService.registerObserver(this.id, {
      onResize: () => this.resized.emit(),
      nativeElement: this.element.nativeElement,
    });
  }

  public ngOnDestroy(): void {
    this.resizeService.destroy(this.id);
  }
}
