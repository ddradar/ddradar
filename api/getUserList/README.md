# Get User List API

日本語版は[こちら](./README-ja.md)にあります。

Get user list that match the specified conditions.

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

> GET api/v1/users?area=0&name=foo&code=10000000

## Parameters

|Name|Type|Description|
|----|:--:|-----------|
|`area`|integer|optional: [Area code](../../docs/db/users.md#area).|
|`name`|string|optional: User Name(partial match).|
|`code`|integer|optional: DDR CODE. Should be `10000000` - `99999999`.|

## Response

- Returns `400 Bad Request` if conditions are invalid.
- Returns `200 OK` with [JSON body](#response-body) otherwize.

### Response Body

<details>
  <summary>Sample</summary>

```json
[
  {
    "id": "afro0001",
    "name": "AFRO",
    "area": 13,
    "code": 10000000
  },
  {
    "id": "emi",
    "name": "TOSHIBA EMI",
    "area": 0
  },
]
```

</details>

Array of [User](#user)

#### User

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|User id|
|`name`|string|User Name|
|`area`|number|[Area code](../../docs/db/users.md#area)|
|`code`|number?|DDR CODE (optional)|
