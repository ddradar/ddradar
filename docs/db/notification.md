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
