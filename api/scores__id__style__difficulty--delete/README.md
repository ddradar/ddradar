# Delete Chart Score API

日本語版は[こちら](./README-ja.md)にあります。

Delete scores that match the specified chart.

*Note: World record and area top score will not be deleted.*

- [Endpoint](#endpoint)
- [Parameters](#parameters)
- [Response](#response)
- Links
  - [Implements (index.ts)](index.ts)
  - [Settings (function.json)](function.json)
  - [Unit Test (index.test.ts)](index.test.ts)

## Endpoint

Need Authentication.

> DELETE api/v1/scores/*:songId*/*:playStyle*/*:difficulty*

## Parameters

|Name|Type|Description|
|----|:--:|-----------|
|`songId`|string|Song ID. Should match `^[01689bdiloqDIOPQ]{32}$` pattern.|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|

## Response

- Returns `401 Unauthorized` if you are not logged in.
- Returns `404 Not Found` if route parameters are invalid.
- Returns `404 Not Found` if user registration is not completed or no score.
- Returns `204 No Content` otherwize.
