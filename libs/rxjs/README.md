# @firepeak/rxjs

In this library some additional rxjs operators are defined that are really usefull.


## NullOrUndefined

Filter non null or undefined values
```typescript
of(['abc', null, 'bcd', undefined, '' ]).pipe(
  isNotNullOrUndefined()
).subscribe(console.log)

// 'abc', 'bcd', ''
```

Filter all null or undefined values
```typescript
of(['abc', null, 'bcd', undefined, '' ]).pipe(
  nullOrUndefined()
).subscribe(console.log)

// null, undefined
```

## Default values
When value is undefined or null the default value will be shown

```typescript
of(['abc', null, 'bcd', undefined, '' ]).pipe(
  valueOrDefault('default')
).subscribe(console.log)

// 'abc', 'default', 'bcd', 'default', ''
```
