# Get Notification Info API

English version is [here](./README.md).

指定したIDと一致する、通知情報を取得します。

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

> GET api/v1/notification/*:id*

## Parameters

|名前|型|説明|
|---|:--|---|
|`id`|string|通知ID|

## Response

- `id` と一致するデータがない場合、`404 Not Found` を返します。
- `id` と一致するデータが見つかった場合、`200 OK` と [JSON](#response-body)を返します。

### Response Body

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
  "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。"
}
```

</details>

|名前|型|説明|
|----|:--:|--|
|id|string|自動生成|
|sender|string|`SYSTEM`: システム通知|
|pinned|boolean|`true`: トップページに常に表示|
|type|string|通知の種類|
|icon|string|アイコン (Material Design Icon)|
|title|string|タイトル|
|body|string|本文|
