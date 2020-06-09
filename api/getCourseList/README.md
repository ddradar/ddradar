# Get Course List API

日本語版は[こちら](./README-ja.md)にあります。

Get course information list.

- [Endpoint](#endpoint)
- [Response](#response)
  - [Response Body](#response-body)
- Links
  - Implements (index.ts)
  - Settings (function.json)
  - Unit Test (getCourseList.test.ts)

## Endpoint

No need Authentication.

> GET api/courses

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
