# Angular resize util

Angular 14 service and directive for detecting changes on an element size.
Internally it use the [Resize observer](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).


You can use it as directive, inside your angular template
```html
<div (fpResized)="onResized($event)"></div>
 ```
 or as a service, if you use a third party library and need to observe to an id of the htmlElement
```typescript
this.resiseService.registerObserver('my-id', {id: 'htmlId', onResize: (event) => console.log(event)})
```

# Working example
https://stackblitz.com/edit/fp-toolsangular-resize
 
# HowTo use the library
To install 
`npm i @firepeak/angular-resize` or `yarn add @firepeak/angular-resize`
 

## Use the directive

First add `ResizeModule` to your modules import

```typescript
import { ResizeModule } from '@fp-tools/angular-resize';

@NgModule({
imports: [..., ResizeModule],
declarations: [...],
bootstrap: [...],
})
export class MyModule {}
```

Then use the directive on the element where you want to listen. The ResizeObservable will automatically unsubscribe whenever the directive is destroyed.

```html
<div (fpResize)="onResize()">I'm a div with the resize directive</div>
```

```typescript 

@Component({...})
export class MyComponent { 
  onResize() {
    console.log('resize');
  }
}
```

## Use the service
In some cases a non-angular library may have an issue with resizing. F.E. if you resize your window a map should be resized as wel, for some reason this is not the case and you should manual trigger the `map.resize()`. In this case it can be easily done with the ResizeService

```typescript

import { ResizeModule } from '@fp-tools/angular-resize';

@Injectable()
class MyService{
    
}
```

# License
MIT © Bo Vandersteene
