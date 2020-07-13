# Import Scores from e-amusement GATE API

日本語版は[こちら](./README-ja.md)にあります。

Add or update extracted score information from HTML source of [official site](https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_single.html).

*Note: You need to subscribe to "[e-amusement basic course](https://p.eagate.573.jp/payment/p/select_course.html)" to browse score list from official site.*

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

> POST api/v1/scores

## Parameters

### Request Body

<details>
  <summary>Sample</summary>

```json
{
  "type": "eagate_music_data",
  "body": "<!DOCTYPE html>..."
}
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`type`|string|`eagate_music_data`|
|`body`|string|HTML source string|

## Response

- Returns `401 Unauthorized` if you are not logged in.
- Returns `400 Bad Request` if parameter body is invalid.
- Returns `404 Not Found` if user registration is not completed.
- Returns `200 OK` with [JSON body](#response-body) otherwize.

### Response Body

<details>
  <summary>Sample</summary>

```json
{
  "count": 20
}
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`count`|integer|Add/Update count|
