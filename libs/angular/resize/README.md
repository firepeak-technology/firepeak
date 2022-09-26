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
 
# HowTo use the library
To install 
`npm i @firepeak/angular-resize` or `yarn add @firepeak/angular-resize`
 

# License
MIT © Bo Vandersteene
