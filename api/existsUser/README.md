# User Exists API

日本語版は[こちら](./README-ja.md)にあります。

Returns whether the specified user exists.

- [Endpoint](#endpoint)
- [Parameters](#parameters)
- [Response](#response)
  - [Response Body](#response-body)
- Links
  - [Implements (index.ts)](index.ts)
  - [Settings (function.json)](function.json)
  - [Unit Test (index.test.ts)](index.test.ts)

## Endpoint

Need Authentication.

> GET api/v1/users/exists/*:id*

## Parameters

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|User id `^[-a-z0-9_]+$`|

## Response

- Returns `401 Unauthorized` if you are not logged in.
- Returns `404 Not Found` if `id` does not match pattern.
- Returns `200 OK` with [JSON body](#response-body) otherwize.

### Response Body

<details>
  <summary>Sample</summary>

```json
{
  "id": "afro0001",
  "exists": true
}
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|User id (same as parameter)|
|`exists`|boolean|`true` if user exists (include private), `false` otherwize|
