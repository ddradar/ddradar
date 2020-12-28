# Get Groove Radar API

English version is [here](./README.md).

指定したユーザーID、プレースタイルと一致する、グルーブレーダーの値を取得します。

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

> GET api/v1/users/*:id*/radar/*:playStyle*

## Parameters

|名前|型|説明|
|---|:--|---|
|`id`|string|ユーザーID|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|

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
    "stream": 100,
    "voltage": 100,
    "air": 100,
    "freeze": 100,
    "chaos": 100
  },
  {
    "playStyle": 2,
    "stream": 100,
    "voltage": 100,
    "air": 100,
    "freeze": 100,
    "chaos": 100
  }
]
```

</details>

|名前|型|説明|
|---|:--:|---|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`stream`|integer|グルーヴレーダー値 STREAM|
|`voltage`|integer|グルーヴレーダー値 VOLTAGE|
|`air`|integer|グルーヴレーダー値 AIR|
|`freeze`|integer|グルーヴレーダー値 FREEZE|
|`chaos`|integer|グルーヴレーダー値 CHAOS|
