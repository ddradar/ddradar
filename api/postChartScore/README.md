# Post Chart Score API

日本語版は[こちら](./README-ja.md)にあります。

Add or update score that match the specified chart.

- [Endpoint](#endpoint)
- [Parameters](#parameters)
  - [Request Body](#request-body)
- [Response](#response)
  - [Response Body](#response-body)
- Links
  - [Implements (index.ts)](index.ts)
  - [Settings (function.json)](function.json)
  - [Unit Test (index.test.ts)](index.test.ts)

## Endpoint

Need Authentication.

> POST api/v1/scores/*:songId*/*:playStyle*/*:difficulty*

## Parameters

|Name|Type|Description|
|----|:--:|-----------|
|`songId`|string|Song ID. Should match `^[01689bdiloqDIOPQ]{32}$` pattern.|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|

### Request Body

<details>
  <summary>Sample</summary>

```json
{
  "score": 1000000,
  "exScore": 402,
  "maxCombo": 122,
  "clearLamp": 7,
  "rank": "AAA"
}
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`score`|integer|Normal score|
|`exScore`|integer?|EX SCORE (optional)|
|`maxCombo`|integer?|MAX COMBO (optional)|
|`clearLamp`|integer|`0`: Failed, `1`: Assisted Clear `2`: Clear, `3`: LIFE4, `4`: Good FC (Full Combo), `5`: Great FC, `6`: PFC, `7`: MFC|
|`rank`|string|Clear rank (`E`～`AAA`)|

## Response

- Returns `401 Unauthorized` if you are not logged in.
- Returns `404 Not Found` if route parameters are invalid or no chart.
- Returns `400 Bad Request` if parameter body is invalid.
- Returns `404 Not Found` if user registration is not completed.
- Returns `200 OK` with [JSON body](#response-body) otherwize.

### Response Body

<details>
  <summary>Sample</summary>

```json
{
  "id": "public_user-QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl-1-0",
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
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|`${userId}-${songId}-${playStyle}-${difficulty}`|
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
