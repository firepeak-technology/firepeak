import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import {ResizeModule} from "@fp-tools/angular-resize";

@NgModule({
  declarations: [AppComponent, NxWelcomeComponent],
  imports: [BrowserModule, ResizeModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
