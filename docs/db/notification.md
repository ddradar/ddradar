# Notification Collection

日本語版は[こちら](./notification-ja.md)にあります。

The collection that stores notification.

## Schema

**Bolded** property is the partition key.

|Name|Type|Description|
|----|:--:|-----------|
|id|string|Auto Generated|
|**sender**|string|`SYSTEM`: global notification|
|pinned|boolean|`true`: show top page|
|type|string|Notification type|
|icon|string|Notification icon (Material Design Icon)|
|title|string|Notification title|
|body|string|Notification body|
|_ts|integer|Created or Updated time (UNIX time)|

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
      "path": "/_ts",
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
  "_ts": 1597028400
}
```
