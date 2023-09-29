# Daguerreotype 📸

> This is an **experimental** library not ready for public consumption. Please use at your own risk.

_Daguerreotype_ is a modern JavaScript library for snapshot testing in JavaScript.

It is currently compatible with Mocha and provides customizable paths for configuration and snapshot output unlike other libraries.

## Usage

To get started, install `daguerreotype` through `npm` (or whatever package manager you use):

```sh
npm i daguerreotype
```

Then in your tests, do

```ts
import {deepStrictEqualSnapshot} from 'daguerreotype';

describe(..., () => {
    it(..., async () => {
        const someData = ...;

        deepStrictEqualSnapshot(someData);
    })
})
```
