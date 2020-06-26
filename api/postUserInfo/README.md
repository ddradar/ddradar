# Post User Information API

日本語版は[こちら](./README-ja.md)にあります。

Add or Update information about the currently logged in user.

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

> GET api/v1/user

## Parameters

### Request Body

<details>
  <summary>Sample</summary>

```json
{
  "id": "afro0001",
  "name": "AFRO",
  "area": 13,
  "code": 10000000,
  "isPublic": false
}
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|User id (used for user page URL) Ignored on update.|
|`name`|string|User name|
|`area`|number|[Area code](../../docs/db/users.md#area) Ignored on update.|
|`code`|number?|DDR CODE (optional)|
|`isPublic`|boolean|`true` if this user info is public, otherwize `false`.|

## Response

- Returns `401 Unauthorized` if you are not logged in.
- Returns `400 Bad Request` if parameter is invalid.
- Returns `200 OK` with [JSON body](#response-body) if succeed.

### Response Body

Same schema as [request body](#request-body).
