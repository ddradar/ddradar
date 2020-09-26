# User Details Collection

日本語版は[こちら](./user-details-ja.md)です。

The collection that stores user score statistics.

## Schema

**Bolded** property is the partition key.

|Name|Type|Description|
|----|:--:|-----------|
|**userId**|string|User ID|
|type|string|See below|

### Groove Radar

|Name|Type|Description|
|----|:--:|-----------|
|**userId**|string|User ID|
|type|string|`'radar'`|
|stream|number|Groove Radar STREAM (truncate to two decimal places)|
|voltage|number|Groove radar VOLTAGE (truncate to two decimal places)|
|air|number|Groove radar AIR (truncate to two decimal places)|
|freeze|number|Groove radar FREEZE (truncate to two decimal places)|
|chaos|number|Groove radar CHAOS (truncate to two decimal places)|

### Clear Status

|Name|Type|Description|
|----|:--:|-----------|
|**userId**|string|User ID|
|type|string|`'clear'`|
|playStyle|integer|`1`: SINGLE, `2`: DOUBLE|
|level|integer|Chart level|
|clearLamp|integer|`0`: Failed, `1`: Assisted Clear `2`: Clear, `3`: LIFE4, `4`: Good FC (Full Combo), `5`: Great FC, `6`: PFC, `7`: MFC|
|count|integer|count|

### Score Status

|Name|Type|Description|
|----|:--:|-----------|
|**userId**|string|User ID|
|type|string|`'score'`|
|playStyle|integer|`1`: SINGLE, `2`: DOUBLE|
|level|integer|Chart level|
|rank|string|Clear rank (`"E"`～`"AAA"`)|
|count|integer|count|
