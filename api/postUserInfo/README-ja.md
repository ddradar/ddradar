# Post User Information API

English version is [here](./README.md).

現在ログインしているユーザー自身の情報を追加/更新します。

- [エンドポイント](#endpoint)
- [パラメータ](#parameters)
  - [本文](#request-body)
- [応答](#response)
  - [本文](#response-body)
- リンク
  - [実装 (index.ts)](./index.ts)
  - [設定 (function.json)](./function.json)
  - [単体テスト (index.test.ts)](./index.test.ts)

## Endpoint

認証が必要です。

> POST api/v1/user

## Parameters

### Request Body

<details>
  <summary>サンプル</summary>

```json
{
  "id": "afro0001",
  "name": "AFRO",
  "area": 13,
  "code": 10000000,
  "isPublic": false
}
```

</details>

|名前|型|説明|
|----|:--:|-----------|
|`id`|string|ユーザーID (ユーザーページのURL等に用いる)|
|`name`|string|ユーザー名|
|`area`|number|[エリアコード](../../docs/db/users-ja.md#area)|
|`code`|number?|DDR CODE (省略可)|
|`isPublic`|boolean|ユーザーを一般公開する場合は`true`、本人のみ閲覧できる場合には`false`|

## Response

- 未認証の場合、`401 Unauthorized` を返します。
- パラメータが不正である場合、`400 Bad Request` を返します。
- 追加/更新に成功した場合、`200 OK` と [JSON](#response-body)を返します。

### Response Body

[リクエスト本文](#request-body)と同一のスキーマです。
