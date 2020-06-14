# Authentication API

English version is [here](./authentication.md).

このプロジェクトでは、認証APIに *Azure Static Web App* の機能を使用しています。
機能の詳細については、[ドキュメント](https://docs.microsoft.com/ja-jp/azure/static-web-apps/authentication-authorization)を参照してください。

- [ログイン](#login)
  - [エンドポイント](#endpoint---login)
  - [パラメータ](#parameters---login)
- [認証情報の取得](#get-credentials)
  - [エンドポイント](#endpoint---get-credentials)
  - [応答](#response---get-credentials)
- [ログアウト](#logout)
  - [エンドポイント](#endpoint---logout)
  - [パラメータ](#parameters---logout)

## Login

指定した認証プロバイダーを使用して、Webサイトにログインします。

### Endpoint - Login

> GET /.auth/login/*:provider*?post_login_redirect_uri=foo

### Parameters - Login

|名前|型|説明|
|----|:--:|---|
|`provider`|string|`github`: GitHubアカウント, `twitter`: Twitterアカウント|
|`post_login_redirect_uri`|string|ログイン後にリダイレクトするURI (デフォルト:トップページ)|

## Get Credentials

現在の認証情報を取得します。

### Endpoint - Get Credentials

> GET /.auth/me

### Response - Get Credentials

- `200 OK`と、以下のBodyを返します。

<details>
  <summary>未認証の場合</summary>

```json
{
  "clientPrincipal": null
}
```

</details>

<details>
  <summary>認証済の場合</summary>

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

Webサイトからログアウトします。

### Endpoint - Logout

> GET /.auth/logout?post_logout_redirect_uri=foo

### Parameters - Logout

|名前|型|説明|
|----|:--:|---|
|`post_logout_redirect_uri`|string|ログアウト後にリダイレクトするURI (デフォルト:トップページ)|
