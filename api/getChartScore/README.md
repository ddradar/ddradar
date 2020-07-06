# Get Chart Score API

日本語版は[こちら](./README-ja.md)にあります。

Get scores that match the specified chart.

- [Endpoint](#endpoint)
- [Parameters](#parameters)
- [Response](#response)
  - [Response Body](#response-body)
- Links
  - [Implements (index.ts)](index.ts)
  - [Settings (function.json)](function.json)
  - [Unit Test (index.test.ts)](index.test.ts)

## Endpoint

No need Authentication. Authenticated users can get their own data even if they are private.

> GET api/v1/scores/*:songId*/*:playStyle*/*:difficulty*?scope=full

## Parameters

|Name|Type|Description|
|----|:--:|-----------|
|`songId`|string|Song ID. Should match `^[01689bdiloqDIOPQ]{32}$` pattern.|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`scope`|string?|`medium`(default): Only user's best score, area top, and world top `full`: All scores|

## Response

- Returns `404 Not Found` if parameters are invalid.
- Returns `404 Not Found` if no score that matches parameters.
- Returns `200 OK` with [JSON body](#response-body) otherwize.

### Response Body

<details>
  <summary>Sample</summary>

```json
[
  {
    "userId": "0",
    "userName": "全国トップ",
    "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
    "songName": "愛言葉",
    "playStyle": 1,
    "difficulty": 0,
    "score": 1000000,
    "exScore": 402,
    "maxCombo": 122,
    "clearLamp": 7,
    "rank": "AAA"
  },
  {
    "userId": "13",
    "userName": "東京都トップ",
    "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
    "songName": "愛言葉",
    "playStyle": 1,
    "difficulty": 0,
    "score": 999980,
    "exScore": 400,
    "maxCombo": 122,
    "clearLamp": 6,
    "rank": "AAA"
  },
  {
    "userId": "public_user",
    "userName": "AFRO",
    "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
    "songName": "愛言葉",
    "playStyle": 1,
    "difficulty": 0,
    "score": 999950,
    "clearLamp": 6,
    "rank": "AAA"
  }
]
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`userId`|string|User ID|
|`userName`|string|User name|
|`songId`|string|Song id that depend on official site. `^([01689bdiloqDIOPQ]*){32}$`|
|`songName`|string|Song name|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`score`|integer|Normal score|
|`exScore`|integer?|EX SCORE (optional)|
|`maxCombo`|integer?|MAX COMBO (optional)|
|`clearLamp`|integer|`0`: Failed, `1`: Assisted Clear `2`: Clear, `3`: LIFE4, `4`: Good FC (Full Combo), `5`: Great FC, `6`: PFC, `7`: MFC|
|`rank`|string|Clear rank (`E`～`AAA`)|
