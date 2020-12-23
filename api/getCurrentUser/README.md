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
  "password": "********"
}
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|User id|
|`name`|string|User name|
|`area`|number|[Area code](../../docs/db/users.md#area)|
|`code`|number?|DDR CODE (optional)|
|`isPublic`|boolean|`true` if this user info is public, otherwize `false`.|
|`password`|string?|Use for External API (optional)|
