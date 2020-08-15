# Post Song Scores API

English version is [here](./README.md).

指定した曲のスコアをまとめて追加または更新します。
以前のスコアとマージされます。

- [エンドポイント](#endpoint)
- [パラメータ](#parameters)
  - [本文](#request-body)
- [応答](#response)
  - [本文](#response-body)
- リンク
  - [実装 (index.ts)](index.ts)
  - [設定 (function.json)](function.json)
  - [単体テスト (index.test.ts)](index.test.ts)

## Endpoint

認証が必要です。

> POST api/v1/scores/*:songId*

## Parameters

|名前|型|説明|
|---|:--|---|
|`songId`|string|曲ID。パターン `^[01689bdiloqDIOPQ]{32}$` と一致する必要があります。|

### Request Body

<details>
  <summary>サンプル</summary>

```json
[
  {
    "playStyle": 1,
    "difficulty": 0,
    "score": 1000000,
    "exScore": 402,
    "maxCombo": 122,
    "clearLamp": 7,
    "rank": "AAA"
  },
  {
    "playStyle": 1,
    "difficulty": 1,
    "score": 999990,
    "exScore": 617,
    "maxCombo": 194,
    "clearLamp": 6,
    "rank": "AAA",
    "topScore": 1000000
  }
]
```

</details>

|名前|型|説明|
|---|:--|---|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`score`|integer|通常スコア|
|`exScore`|integer?|EXスコア (省略可)|
|`maxCombo`|integer?|MAXコンボ数 (省略可)|
|`clearLamp`|integer|`0`: プレー済未クリア, `1`: アシストクリア, `2`: クリア, `3`: LIFE4, `4`: (Good) フルコンボ, `5`: グレートフルコンボ, `6`: PFC, `7`: MFC|
|`rank`|string|クリアランク (`E`～`AAA`)|
|`topScore`|integer?|全国トップのスコア (省略可)|

## Response

- 未認証の場合、`401 Unauthorized` を返します。
- ルートパラメータが不正か、一致する曲が存在しない場合、`404 Not Found` を返します。
- パラメータ本文が不正な場合、`400 Bad Request` を返します。
- ユーザー登録が完了していない場合、`404 Not Found` を返します。
- その他の場合、`200 OK` と [JSON](#response-body)を返します。

### Response Body

<details>
  <summary>サンプル</summary>

```json
[
  {
    "id": "public_user-QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl-1-0",
    "userId": "public_user",
    "userName": "AFRO",
    "isPublic": true,
    "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
    "songName": "愛言葉",
    "playStyle": 1,
    "difficulty": 0,
    "score": 1000000,
    "exScore": 402,
    "maxCombo": 122,
    "clearLamp": 7,
    "rank": "AAA"
  },
  {
    "id": "public_user-QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl-1-1",
    "userId": "public_user",
    "userName": "AFRO",
    "isPublic": true,
    "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
    "songName": "愛言葉",
    "playStyle": 1,
    "difficulty": 1,
    "score": 999990,
    "exScore": 617,
    "maxCombo": 194,
    "clearLamp": 6,
    "rank": "AAA"
  }
]
```

</details>

|名前|型|説明|
|---|:--:|--|
|`id`|string|`${userId}-${songId}-${playStyle}-${difficulty}`|
|`userId`|string|ユーザーID|
|`userName`|string|ユーザー名|
|`isPublic`|boolean|このスコアが一般公開されている場合は`true`、本人のみ閲覧できる場合には`false`|
|`songId`|string|曲ID (公式サイトより) `^([01689bdiloqDIOPQ]*){32}$`|
|`songName`|string|曲名|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`score`|integer|通常スコア|
|`exScore`|integer?|EXスコア (省略可)|
|`maxCombo`|integer?|MAXコンボ数 (省略可)|
|`clearLamp`|integer|`0`: プレー済未クリア, `1`: アシストクリア, `2`: クリア, `3`: LIFE4, `4`: (Good) フルコンボ, `5`: グレートフルコンボ, `6`: PFC, `7`: MFC|
|`rank`|string|クリアランク (`E`～`AAA`)|
