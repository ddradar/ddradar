# Get Score Status API

日本語版は[こちら](./README-ja.md)にあります。

Get Score status that match the specified user ID, play style and level.

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

> GET api/v1/users/*:id*/score?playStyle=*:playStyle*&level=*:level*

## Parameters

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|User id|
|`playStyle`|integer?|`1`: SINGLE, `2`: DOUBLE (optional)|
|`level`|integer?|Chart level (optional)|

## Response

- Returns `404 Not Found` if `id` is not defined.
- Returns `404 Not Found` if no user that matches `id` or user is private.
- Returns `200 OK` with [JSON body](#response-body) if found.

### Response Body

<details>
  <summary>Sample</summary>

```json
[
  {
    "playStyle": 1,
    "level": 1,
    "rank": "-",
    "count": 20
  },
  {
    "playStyle": 1,
    "level": 1,
    "rank": "AA+",
    "count": 10
  },
  {
    "playStyle": 1,
    "level": 1,
    "rank": "AAA",
    "count": 20
  }
]
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`level`|integer|Chart level|
|`rank`|string|Clear rank (`"E"`～`"AAA"`), or `"-"`(NoPlay)|
|`count`|integer|Chart count|
