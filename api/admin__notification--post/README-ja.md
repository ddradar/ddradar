# Post Notification API

日本語版は[こちら](./README-ja.md)にあります。

通知情報を追加または更新します。

- [Endpoint](#endpoint)
- [Parameters](#parameters)
- [Response](#response)
  - [Response Body](#response-body)
- Links
  - [Implements](index.ts)
  - [Settings](function.json)
  - [Unit Test](index.test.ts)

## Endpoint

`administrator` ロールを持つユーザーで[認証](../../docs/api/authentication-ja.md#login)する必要があります。

> POST /api/v1/admin/notification

## Parameters

### Request Body

<details>
  <summary>サンプル</summary>

```json
{
  "id": "<Auto Generated>",
  "sender": "SYSTEM",
  "pinned": true,
  "type": "is-info",
  "icon": "info",
  "title": "このサイトはベータ版です",
  "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。",
}
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string?|更新対象|
|`sender`|string|`SYSTEM`: システム通知|
|`pinned`|boolean|`true`: トップページに常に表示|
|`type`|string|通知の種類|
|`icon`|string|アイコン (Material Design Icon)|
|`title`|string|タイトル|
|`body`|string|本文|

## Response

- 認証していないか、`administrator` ロールを持っていない場合は、`401 Unauthorized` を返します。
- BODYパラメータが規定のものと一致しない場合は、`400 BadRequest` を返します。
- 登録/更新に成功した場合は、`200 OK` と、[更新後のJSONデータ](#response-body)を返します。

### Response Body

[リクエスト本文](#request-body)と同一のスキーマです。
