# Search Charts API

日本語版は[こちら](./README-ja.md)にあります。

Get charts that match the specified conditions.

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

> GET /api/v1/charts/*:playStyle*/*:level*

## Parameters

|Name|Type|Description|
|----|:--:|---|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`level`|integer|Chart level|

## Response

- Returns `404 Not Found` if `playStyle` or `level` is undefined or invalid type.
- Returns `404 Not Found` if no chart that matches conditions.
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
    "series": "DanceDanceRevolution A",
    "playStyle": 1,
    "difficulty": 3,
    "level": 12
  }
]
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|Song id that depend on official site. `^[01689bdiloqDIOPQ]{32}$`|
|`name`|string|Song name|
|`series`|string|Series title|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`level`|integer|Chart level|
