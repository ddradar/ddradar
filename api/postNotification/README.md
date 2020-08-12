# Post Notification API

日本語版は[こちら](./README-ja.md)にあります。

Add or update Notification.

- [Endpoint](#endpoint)
- [Parameters](#parameters)
- [Response](#response)
  - [Response Body](#response-body)
- Links
  - [Implements](index.ts)
  - [Settings](function.json)
  - [Unit Test](index.test.ts)

## Endpoint

Need [Authentication](../../docs/api/authentication.md#login) with `administrator` role.

> POST /api/v1/admin/notification

## Parameters

### Request Body

<details>
  <summary>Sample</summary>

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
|`id`|string?|Update target|
|`sender`|string|`SYSTEM`: global notification|
|`pinned`|boolean|`true`: show top page|
|`type`|string|Notification type|
|`icon`|string|Notification icon (Material Design Icon)|
|`title`|string|Notification title|
|`body`|string|Notification body|

## Response

- Returns `401 Unauthorized` if user is not authenticated or does not have `administrator` role.
- Returns `400 BadRequest` if body parameters are invalid.
- Returns `200 OK` with [updated JSON data](#response-body) if succeed add or update.

### Response Body

Response JSON schema equals to [Request Body](#request-body).
