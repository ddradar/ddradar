# Post Song Scores API

日本語版は[こちら](./README-ja.md)にあります。

Add or update the scores of the specified songs all at once.
It will be merged with the previous score.

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

> POST api/v1/scores/*:songId*

## Parameters

|Name|Type|Description|
|----|:--:|-----------|
|`songId`|string|Song ID. Should match `^[01689bdiloqDIOPQ]{32}$` pattern.|

### Request Body

<details>
  <summary>Sample</summary>

```json
[
  {
    "playStyle": 1,
    "difficulty": 0,
    "score": 1000000,
    "exScore": 402,
    "maxCombo": 122,
    "clearLamp": 7,
    "rank": "AAA"
  },
  {
    "playStyle": 1,
    "difficulty": 1,
    "score": 999990,
    "exScore": 617,
    "maxCombo": 194,
    "clearLamp": 6,
    "rank": "AAA",
    "topScore": 1000000
  }
]
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`score`|integer|Normal score|
|`exScore`|integer?|EX SCORE (optional)|
|`maxCombo`|integer?|MAX COMBO (optional)|
|`clearLamp`|integer|`0`: Failed, `1`: Assisted Clear `2`: Clear, `3`: LIFE4, `4`: Good FC (Full Combo), `5`: Great FC, `6`: PFC, `7`: MFC|
|`rank`|string|Clear rank (`E`～`AAA`)|
|`topScore`|integer?|World record score (optional)|

## Response

- Returns `401 Unauthorized` if you are not logged in.
- Returns `404 Not Found` if route parameters are invalid or no song.
- Returns `400 Bad Request` if parameter body is invalid.
- Returns `404 Not Found` if user registration is not completed.
- Returns `200 OK` with [JSON body](#response-body) otherwize.

### Response Body

<details>
  <summary>Sample</summary>

```json
[
  {
    "id": "public_user-QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl-1-0",
    "userId": "public_user",
    "userName": "AFRO",
    "isPublic": true,
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
    "id": "public_user-QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl-1-1",
    "userId": "public_user",
    "userName": "AFRO",
    "isPublic": true,
    "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
    "songName": "愛言葉",
    "playStyle": 1,
    "difficulty": 1,
    "score": 999990,
    "exScore": 617,
    "maxCombo": 194,
    "clearLamp": 6,
    "rank": "AAA"
  }
]
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|`${userId}-${songId}-${playStyle}-${difficulty}`|
|`userId`|string|User ID|
|`userName`|string|User name|
|`isPublic`|boolean|`true` if this score is public, otherwize `false`|
|`songId`|string|Song id that depend on official site. `^([01689bdiloqDIOPQ]*){32}$`|
|`songName`|string|Song name|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`score`|integer|Normal score|
|`exScore`|integer?|EX SCORE (optional)|
|`maxCombo`|integer?|MAX COMBO (optional)|
|`clearLamp`|integer|`0`: Failed, `1`: Assisted Clear `2`: Clear, `3`: LIFE4, `4`: Good FC (Full Combo), `5`: Great FC, `6`: PFC, `7`: MFC|
|`rank`|string|Clear rank (`E`～`AAA`)|
