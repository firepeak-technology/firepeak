# Angular resize util

Angular 14 service and directive for detecting changes on an element size.

You can use it as directive, inside your angular template
```html
<div (fpResized)="onResized($event)"></div>
 ```
 or as a service, if you use a third party library and need to observe to an id of the htmlElement
```typescript
this.resiseService.registerObserver('my-id', {id: 'htmlId', onResize: (event) => console.log(event)})
```
 


# Howto use the library
To install 
`npm i @firepeak/angular-resize` or `yarn add @firepeak/angular-resize`

## Running unit tests

Run `nx test angular-resize` to execute the unit tests.
