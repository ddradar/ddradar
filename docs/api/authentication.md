# Authentication API

日本語版は[こちら](./authentication-ja.md)にあります。

This project uses a feature of *Azure Static Web App* for Authentication API.
For more details, see [Docs](https://docs.microsoft.com/azure/static-web-apps/authentication-authorization).

- [Login](#login)
  - [Endpoint](#endpoint---login)
  - [Parameters](#parameters---login)
- [Get Credentials](#get-credentials)
  - [Endpoint](#endpoint---get-credentials)
  - [Response](#response---get-credentials)
- [Logout](#logout)
  - [Endpoint](#endpoint---logout)
  - [Parameters](#parameters---logout)

## Login

Log in to this website using the specified authentication provider.

### Endpoint - Login

> GET /.auth/login/*:provider*?post_login_redirect_uri=foo

### Parameters - Login

|Name|Type|Description|
|----|:--:|---|
|`provider`|string|`github`: GitHub account, `twitter`: Twitter account|
|`post_login_redirect_uri`|string|Redirect URI after login (default:top page)|

## Get Credentials

Get current credentials.

### Endpoint - Get Credentials

> GET /.auth/me

### Response - Get Credentials

- Returns `200 OK` with body like below.

<details>
  <summary>Anonymous</summary>

```json
{
  "clientPrincipal": null
}
```

</details>

<details>
  <summary>Authenticated</summary>

```json
{
  "clientPrincipal": {
    "identityProvider": "twitter",
    "userId": "d75b260a64504067bfc5b2905e3b8182",
    "userDetails": "username",
    "userRoles": [ "anonymous", "authenticated" ]
  }
}
```

</details>

## Logout

Log out to this website.

### Endpoint - Logout

> GET /.auth/logout?post_logout_redirect_uri=foo

### Parameters - Logout

|Name|Type|Description|
|----|:--:|---|
|`post_logout_redirect_uri`|string|Redirect URI after logout (default:top page)|
