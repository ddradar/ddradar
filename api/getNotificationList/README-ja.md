# Get Notification List API

English version is [here](./README.md).

システムからの通知情報の一覧を取得します。

- [エンドポイント](#endpoint)
- [パラメータ](#parameters)
- [応答](#response)
  - [本文](#response-body)
- リンク
  - [実装 (index.ts)](./index.ts)
  - [設定 (function.json)](./function.json)
  - [単体テスト (index.test.ts)](./index.test.ts)

## Endpoint

認証は不要です。

> GET api/v1/notification?scope=top

## Parameters

|名前|型|説明|
|---|:--|---|
|`scope`|string|`top`: ピン留めされた通知のみ `full`(既定): 全データ|

## Response

- `200 OK` と [JSON](#response-body)を返します。

### Response Body

<details>
  <summary>サンプル</summary>

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

|名前|型|説明|
|----|:--:|--|
|id|string|自動生成|
|type|string|通知の種類|
|icon|string|アイコン (Material Design Icon)|
|title|string|タイトル|
|body|string|本文|
|timeStamp|integer|作成/更新日時 (UNIX time)|
