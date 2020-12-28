# Get Groove Radar API

日本語版は[こちら](./README-ja.md)にあります。

Get Groove Radar that match the specified user ID and play style.

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

> GET api/v1/users/*:id*/radar/*:playStyle*

## Parameters

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|User id|
|`playStyle`|number?|`1`: SINGLE, `2`: DOUBLE, `undefined`: all|

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
    "stream": 100,
    "voltage": 100,
    "air": 100,
    "freeze": 100,
    "chaos": 100
  },
  {
    "playStyle": 2,
    "stream": 100,
    "voltage": 100,
    "air": 100,
    "freeze": 100,
    "chaos": 100
  }
]
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`stream`|integer|Groove Radar STREAM|
|`voltage`|integer|Groove radar VOLTAGE|
|`air`|integer|Groove radar AIR|
|`freeze`|integer|Groove radar FREEZE|
|`chaos`|integer|Groove radar CHAOS|
