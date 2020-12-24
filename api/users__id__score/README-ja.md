# Get Score Status API

English version is [here](./README.md).

指定したユーザーID、プレースタイル、レベルと一致する、スコア状況を取得します。

- [エンドポイント](#endpoint)
- [パラメータ](#parameters)
- [応答](#response)
  - [本文](#response-body)
- リンク
  - [実装 (index.ts)](./index.ts)
  - [設定 (function.json)](./function.json)
  - [単体テスト (index.test.ts)](./index.test.ts)

## Endpoint

認証は不要です。認証済ユーザーの場合は、非公開の場合でも自身のデータを取得できます。

> GET api/v1/users/*:id*/score?playStyle=*:playStyle*&level=*:level*

## Parameters

|名前|型|説明|
|---|:--|---|
|`id`|string|ユーザーID|
|`playStyle`|integer?|`1`: SINGLE, `2`: DOUBLE (省略可)|
|`level`|integer?|譜面のレベル (省略可)|

## Response

- `id` が未指定の場合、`404 Not Found` を返します。
- `id` と一致するユーザーが存在しないか、非公開の場合、`404 Not Found` を返します。
- その他の場合、`200 OK` と [JSON](#response-body)を返します。

### Response Body

<details>
  <summary>サンプル</summary>

```json
[
  {
    "playStyle": 1,
    "level": 1,
    "rank": "AA+",
    "count": 10
  },
  {
    "playStyle": 1,
    "level": 1,
    "rank": "AAA",
    "count": 20
  }
]
```

</details>

|名前|型|説明|
|---|:--:|---|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`level`|integer|譜面のレベル|
|`rank`|string|クリアランク (`"E"`～`"AAA"`)|
|`count`|integer|譜面数|
