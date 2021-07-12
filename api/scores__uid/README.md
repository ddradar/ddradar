# Get User Scores API

日本語版は[こちら](./README-ja.md)にあります。

Get user scores that match the specified conditions.

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

> GET api/v1/scores/*:userId*?style=1&diff=1&lv=5&lamp=5&rank=AAA

## Parameters

|Name|Type|Description|
|----|:--:|-----------|
|`userId`|string|User id|
|`style`|integer?|`1`: SINGLE, `2`: DOUBLE|
|`diff`|integer?|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`lv`|integer?|Chart level|
|`lamp`|integer?|`0`: Failed, `1`: Assisted Clear `2`: Clear, `3`: LIFE4, `4`: Good FC (Full Combo), `5`: Great FC, `6`: PFC, `7`: MFC|
|`rank`|string?|Clear rank (`E`～`AAA`)|

## Response

- Returns `404 Not Found` if no score that matches parameters.
- Returns `200 OK` with [JSON body](#response-body) otherwize.

### Response Body

<details>
  <summary>Sample</summary>

```json
[
  {
    "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
    "songName": "愛言葉",
    "playStyle": 1,
    "difficulty": 0,
    "level": 3,
    "score": 999950,
    "clearLamp": 6,
    "rank": "AAA",
    "isCourse": false
  }
]
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`songId`|string|Song id that depend on official site. `^([01689bdiloqDIOPQ]*){32}$`|
|`songName`|string|Song name|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`level`|integer|Chart level|
|`score`|integer|Normal score|
|`exScore`|integer?|EX SCORE (optional)|
|`maxCombo`|integer?|MAX COMBO (optional)|
|`clearLamp`|integer|`0`: Failed, `1`: Assisted Clear `2`: Clear, `3`: LIFE4, `4`: Good FC (Full Combo), `5`: Great FC, `6`: PFC, `7`: MFC|
|`rank`|string|Clear rank (`E`～`AAA`)|
|`deleted`|boolean?|Song is deleted or not|
|`isCourse`|boolean|Course or not|
