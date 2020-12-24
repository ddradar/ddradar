# Get User Information API

日本語版は[こちら](./README-ja.md)にあります。

Get user information that match the specified ID.

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

> GET api/v1/users/*:id*

## Parameters

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|User id|

## Response

- Returns `404 Not Found` if `id` is not defined.
- Returns `404 Not Found` if no user that matches `id` or user is private.
- Returns `200 OK` with [JSON body](#response-body) if found.

### Response Body

<details>
  <summary>Sample</summary>

```json
{
  "id": "afro0001",
  "name": "AFRO",
  "area": 13,
  "code": 10000000
}
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|User id (used for user page URL)|
|`name`|string|User name|
|`area`|number|[Area code](../../docs/db/users.md#area)|
|`code`|number?|DDR CODE (optional)|
