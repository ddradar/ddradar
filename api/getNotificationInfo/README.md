# Get Notification Info API

日本語版は[こちら](./README-ja.md)にあります。

Get notification that match the specified ID.

- [Endpoint](#endpoint)
- [Parameters](#parameters)
- [Response](#response)
  - [Response Body](#response-body)
- Links
  - [Implements (index.ts)](index.ts)
  - [Settings (function.json)](function.json)
  - [Unit Test (index.test.ts)](index.test.ts)

## Endpoint

No need Authentication.

> GET api/v1/notification/*:id*

## Parameters

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|Notification id|

## Response

- Returns `404 Not Found` if no data that matches `id`.
- Returns `200 OK` with [JSON body](#response-body) if found.

### Response Body

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
  "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。"
}
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|id|string|Auto Generated|
|sender|string|`SYSTEM`: global notification|
|pinned|boolean|`true`: show top page|
|type|string|Notification type|
|icon|string|Notification icon (Material Design Icon)|
|title|string|Notification title|
|body|string|Notification body|
