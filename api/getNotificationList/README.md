# Get Notification List API

日本語版は[こちら](./README-ja.md)にあります。

Get system notification list.

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

> GET api/v1/notification?scope=top

## Parameters

|Name|Type|Description|
|----|:--:|-----------|
|`scope`|string|`top`: only pinned notification `full`(default): all data|

## Response

- Returns `200 OK` with [JSON body](#response-body).

### Response Body

<details>
  <summary>Sample</summary>

```json
[
  {
    "id": "<Auto Generated>",
    "type": "is-info",
    "icon": "info",
    "title": "このサイトはベータ版です",
    "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。",
    "timeStamp": 1597028400
  },
  {
    "id": "<Auto Generated>",
    "type": "is-warning",
    "icon": "warning",
    "title": "システムメンテナンスのお知らせ",
    "body": "2020/8/11 10:00よりメンテナンスを行います。",
    "timeStamp": 1597024800
  },
]
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|id|string|Auto Generated|
|type|string|Notification type|
|icon|string|Notification icon (Material Design Icon)|
|title|string|Notification title|
|body|string|Notification body|
|timeStamp|integer|Created or Updated time (UNIX time)|
