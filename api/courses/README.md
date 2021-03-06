# Get Course List API

日本語版は[こちら](./README-ja.md)にあります。

Get course information list.

- [Endpoint](#endpoint)
- [Parameters](#parameters)
- [Response](#response)
  - [Response Body](#response-body)
- Links
  - [Implements (index.ts)](./index.ts)
  - [Settings (function.json)](./function.json)
  - [Unit Test (index.test.ts)](./index.test.ts)

## Endpoint

No need Authentication.

> GET api/v1/courses?series=16&type=1

## Parameters

|Name|Type|Description|
|----|:--:|---|
|`series`|integer?|`16`: Dance Dance Revolution A20, `17`: Dance Dance Revolution A20 PLUS (optional)|
|`type`|integer?|`1`: NONSTOP, `2`: 段位認定 (optional)|

## Response

- Returns `200 OK` with [JSON body](#response-body) if found.

### Response Body

<details>
  <summary>Sample</summary>

```json
[
  {
    "id": "qbbOOO1QibO1861bqQII9lqlPiIoqb98",
    "name": "FIRST",
    "orders": [
      {
        "playStyle": 1,
        "difficulty": 0,
        "level": 4
      },
      {
        "playStyle": 1,
        "difficulty": 1,
        "level": 8
      },
      {
        "playStyle": 1,
        "difficulty": 2,
        "level": 9
      },
      {
        "playStyle": 1,
        "difficulty": 3,
        "level": 12
      },
      {
        "playStyle": 2,
        "difficulty": 1,
        "level": 9
      },
      {
        "playStyle": 2,
        "difficulty": 2,
        "level": 13
      },
      {
        "playStyle": 2,
        "difficulty": 3,
        "level": 11
      }
    ]
  }
]
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|Course id that depend on official site. `^[01689bdiloqDIOPQ]{32}$`|
|`name`|string|Course name|
|`orders`|Order\[\]|Course order list by play style and difficulty. [see below](#order)|

#### Order

|Name|Type|Description|
|----|:--:|-----------|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`level`|integer|Course level|
