import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {ResizeModule} from "@fp-tools/angular-resize";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, ResizeModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
