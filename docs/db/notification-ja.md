# Notification Collection

English version is [here](./notification.md).

ユーザーに通知する情報を格納するコレクションです。

## Schema

**太字**のプロパティは partition key です。

|名前|型|説明|
|----|:--:|--|
|id|string|自動生成|
|**sender**|string|`SYSTEM`: システム通知|
|pinned|boolean|`true`: トップページに常に表示|
|type|string|通知の種類|
|icon|string|アイコン (Material Design Icon)|
|title|string|タイトル|
|body|string|本文|
|timeStamp|integer|作成/更新日時 (UNIX time)|

## Indexes

```json
{
  "indexingMode": "consistent",
  "automatic": true,
  "includedPaths": [
    {
      "path": "/*"
    }
  ],
  "excludedPaths": [
    {
      "path": "/\"_etag\"/?"
    }
  ],
  "compositeIndexes": [
    {
      "path": "/pinned",
      "order": "ascending"
    },
    {
      "path": "/timeStamp",
      "order": "descending"
    }
  ]
}
```

## Sample

```json
{
  "id": "<Auto Generated>",
  "sender": "SYSTEM",
  "pinned": true,
  "type": "is-info",
  "icon": "info",
  "title": "このサイトはベータ版です",
  "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。",
  "timeStamp": 1597028400
}
```
