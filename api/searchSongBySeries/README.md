# Search Song by Series API

日本語版は[こちら](./README-ja.md)にあります。

Get a list of song information that matches the specified conditions.

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

> GET /api/songs/series/0&name=0

## Parameters

|Name|Type|Description|
|----|:--:|---|
|`series`|integer|`0`: DDR 1st, `1`: DDR 2ndMIX, ..., `16`: Dance Dance Revolution A20|
|`name`|integer|`0`: あ行, `1`: か行, ..., `9`: わ行, `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号|

## Response

- Returns `404 Not Found` if `series` is undefined or invalid type.
  - If `name` is invalid, it is ignored.
- Returns `404 Not Found` if no song that matches conditions.
- Returns `200 OK` with [JSON body](#response-body) if found.

### Response Body

Object array that match conditions.

Array order is `nameIndex`, `nameKana` ascending.

<details>
  <summary>Sample</summary>

```json
[
  {
    "id": "61oIP0QIlO90d18ObDP1Dii6PoIQoOD8",
    "name": "イーディーエム・ジャンパーズ",
    "nameKana": "いーでぃーえむ じゃんぱーず",
    "nameIndex": 0,
    "artist": "かめりあ feat. ななひら",
    "series": "DanceDanceRevolution A",
    "minBPM": 72,
    "maxBPM": 145
  }
]
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|Song id that depend on official site. `^[01689bdiloqDIOPQ]{32}$`|
|`name`|string|Song name|
|`nameKana`|string|Song furigana for sorting. `^([A-Z0-9 .ぁ-んー]*)$`|
|`nameIndex`|integer|Index for sorting. Associated with the "Choose by Name" folder.<br />`0`: あ行, `1`: か行, ..., `9`: わ行, `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号|
|`artist`|string|Artist name|
|`series`|string|Series title|
|`minBPM`|integer \| null|Displayed min BPM (Beet Per Minutes). Set to `null` if not revealed, such as "???".|
|`maxBPM`|integer \| null|Displayed max BPM (Beet Per Minutes). Set to `null` if not revealed, such as "???".|
