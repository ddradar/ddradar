# User Exists API

English version is [here](./README.md).

指定したユーザーが存在するかどうかを返します。

- [エンドポイント](#endpoint)
- [パラメータ](#parameters)
- [応答](#response)
  - [本文](#response-body)
- リンク
  - [実装 (index.ts)](./index.ts)
  - [設定 (function.json)](./function.json)
  - [単体テスト (index.test.ts)](./index.test.ts)

## Endpoint

認証が必要です。

> GET api/v1/users/exists/*:id*

## Parameters

|名前|型|説明|
|---|:--|---|
|`id`|string|ユーザーID `^[-a-z0-9_]+$`|

## Response

- 未認証の場合、`401 Unauthorized` を返します。
- `id` が正規表現にマッチしない場合、`404 Not Found` を返します。
- その他の場合、`200 OK` と [JSON](#response-body)を返します。

### Response Body

<details>
  <summary>サンプル</summary>

```json
{
  "id": "afro0001",
  "exists": true
}
```

</details>

|名前|型|説明|
|----|:--:|-----------|
|`id`|string|ユーザーID (パラメータと同一)|
|`exists`|boolean|ユーザーが存在する場合(非公開ユーザーも含む) `true`、存在しない場合 `false`|
