# RxJs utils

Additional operators for RxJs that makes your code more readable
 
# HowTo use the library
To install
`npm i @fp-tools/rxjs` or `yarn add @fp-tools/rxjs`

## Filter operators

Filter values that are not null
```typescript
import {isNotNullOrUndefined} from '@fp-tools/rxjs';

of([null, 'abc', false]).pipe(
      isNotNullOrUndefined()
).subscribe(value => console.log(value));

// ['abc', false]
```

Filter values that are null

```typescript
import {isNullOrUndefined} from '@fp-tools/rxjs';

of([null, 'abc', false]).pipe(
      isNotNullOrUndefined()
).subscribe(value => console.log(value));

// [null]
```

## Transform operators
If a value is null or undefined, a default value will be returned.

```typescript
import {valueOrDefault} from '@fp-tools/rxjs';

of([null, 'abc', false]).pipe(
    valueOrDefault('abc')
).subscribe(value => console.log(value));

// ['abc', 'abc', false]
```

If a value is null or undefined, a default value will be returned, otherwise the value will be transformed.

```typescript
import {valueOrDefault} from '@fp-tools/rxjs';

of([null, 0, 1, 4]).pipe(
  valueOrDefault('abc', value => value * 2)
).subscribe(value => console.log(value));

// ['abc', 0, 2, 8]
```

# License
MIT © Bo Vandersteene
