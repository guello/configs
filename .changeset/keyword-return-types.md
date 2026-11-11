---
'@guello/oxlint-plugin': patch
---

`no-inferrable-return-type` reports only keyword return types, such as `string`, `boolean[]` and `Promise<void>`. It preserves named types such as `Result<T>`, because they can set a contract that inference loses.
