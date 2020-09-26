# User Details Collection

English version is [here](./user-details.md).

ユーザーのスコア統計を格納するコレクションです。

## Schema

**太字**のプロパティは partition key です。

|名前|型|説明|
|----|:--:|----|
|**userId**|string|ユーザーID|
|type|string|下記参照|

### Groove Radar

|名前|型|説明|
|----|:--:|----|
|**userId**|string|ユーザーID|
|type|string|`'radar'`|
|stream|number|Groove Radar STREAM (小数点第2位で切り捨て)|
|voltage|number|Groove radar VOLTAGE (小数点第2位で切り捨て)|
|air|number|Groove radar AIR (小数点第2位で切り捨て)|
|freeze|number|Groove radar FREEZE (小数点第2位で切り捨て)|
|chaos|number|Groove radar CHAOS (小数点第2位で切り捨て)|

### Clear Status

|名前|型|説明|
|----|:--:|----|
|**userId**|string|ユーザーID|
|type|string|`'clear'`|
|playStyle|integer|`1`: SINGLE, `2`: DOUBLE|
|level|integer|譜面のレベル|
|clearLamp|integer|`0`: プレー済未クリア, `1`: アシストクリア, `2`: クリア, `3`: LIFE4, `4`: (Good) フルコンボ, `5`: グレートフルコンボ, `6`: PFC, `7`: MFC|
|count|integer|クリア数|

### Score Status

|Name|Type|Description|
|----|:--:|-----------|
|**userId**|string|ユーザーID|
|type|string|`'score'`|
|playStyle|integer|`1`: SINGLE, `2`: DOUBLE|
|level|integer|譜面のレベル|
|rank|string|クリアランク (`"E"`～`"AAA"`)|
|count|integer|クリア数|
