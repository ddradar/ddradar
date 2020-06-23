# Get Current User Data API

日本語版は[こちら](./README-ja.md)にあります。

Get information about the currently logged in user.

- [Endpoint](#endpoint)
- [Response](#response)
  - [Response Body](#response-body)
- Links
  - [Implements (index.ts)](index.ts)
  - [Settings (function.json)](function.json)
  - [Unit Test (index.test.ts)](index.test.ts)

## Endpoint

Need Authentication.

> GET api/v1/user

## Response

- Returns `401 Unauthorized` if you are not logged in.
- Returns `404 Not Found` if user registration is not completed.
- Returns `200 OK` with [JSON body](#response-body) if found.

### Response Body

<details>
  <summary>Sample</summary>

```json
{
  "id": "afro0001",
  "name": "AFRO",
  "area": 13,
  "code": 10000000,
  "isPublic": false,
  "totalClear": {
    "single": {
      "0": [0, 0, 0, 0, 0, 0, 0, 0],
      "1": [0, 0, 0, 0, 0, 0, 0, 0],
      "2": [0, 0, 0, 0, 0, 0, 0, 0],
      "3": [0, 0, 0, 0, 0, 0, 0, 0],
      "4": [0, 0, 0, 0, 0, 0, 0, 0]
    },
    "double": {
      "1": [0, 0, 0, 0, 0, 0, 0, 0],
      "2": [0, 0, 0, 0, 0, 0, 0, 0],
      "3": [0, 0, 0, 0, 0, 0, 0, 0],
      "4": [0, 0, 0, 0, 0, 0, 0, 0]
    }
  },
  "totalScore": {
    "single": {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0
    },
    "double": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0
    }
  }
}
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|User id (used for user page URL)|
|`name`|string|User name|
|`area`|number|[Area code](../../docs/db/users.md#area)|
|`code`|number?|DDR CODE (optional)|
|`isPublic`|boolean|`true` if this user info is public, otherwize `false`.|
|`totalClear.single`<br />`totalClear.double`|integer\[8\]\[5\]|\[0\]\[0\]: BEGINNER/Failed count, \[1\]\[0\]: BEGINNER/Assisted Clear count, ..., \[7\]\[0\]: BEGINNER/MFC count, \[0\]\[1\]: BASIC/Failed count, ..., \[7\]\[4\]: CHALLENGE/MFC count|
|`totalScore.single`<br />`totalScore.double`|integer\[5\]|\[0\]: BEGINNER total score, \[1\]: BASIC total score, ..., \[4\]: CHALLENGE total score|
