# @guello/oxlint-plugin

## 0.2.1

### Patch Changes

- 5ed8759: `no-inferrable-return-type` reports only keyword return types, such as `string`, `boolean[]` and `Promise<void>`. It preserves named types such as `Result<T>`, because they can set a contract that inference loses.

## 0.2.0

### Minor Changes

- 4b72ac0: `no-inferrable-return-type` allows exported return types when the nearest `tsconfig.json` turns on `isolatedDeclarations`. Set `allowExported` to ignore the tsconfig value.

## 0.1.0

### Minor Changes

- f2db67f: Add the `@guello/func-style` and `@guello/no-inferrable-return-type` rules.
