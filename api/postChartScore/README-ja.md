# Post Chart Score API

English version is [here](./README.md).

指定した譜面のスコアを追加または更新します。

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

> POST api/v1/scores/*:songId*/*:playStyle*/*:difficulty*

## Parameters

|名前|型|説明|
|---|:--|---|
|`songId`|string|曲ID。パターン `^[01689bdiloqDIOPQ]{32}$` と一致する必要があります。|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|

### Request Body

<details>
  <summary>サンプル</summary>

```json
{
  "score": 1000000,
  "exScore": 402,
  "maxCombo": 122,
  "clearLamp": 7,
  "rank": "AAA"
}
```

</details>

|名前|型|説明|
|---|:--|---|
|`score`|integer|通常スコア|
|`exScore`|integer?|EXスコア (省略可)|
|`maxCombo`|integer?|MAXコンボ数 (省略可)|
|`clearLamp`|integer|`0`: プレー済未クリア, `1`: アシストクリア, `2`: クリア, `3`: LIFE4, `4`: (Good) フルコンボ, `5`: グレートフルコンボ, `6`: PFC, `7`: MFC|
|`rank`|string|クリアランク (`E`～`AAA`)|

## Response

- 未認証の場合、`401 Unauthorized` を返します。
- ルートパラメータが不正か、一致する譜面が存在しない場合、`404 Not Found` を返します。
- パラメータ本文が不正な場合、`400 Bad Request` を返します。
- ユーザー登録が完了していない場合、`404 Not Found` を返します。
- その他の場合、`200 OK` と [JSON](#response-body)を返します。

### Response Body

<details>
  <summary>サンプル</summary>

```json
{
  "id": "public_user-QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl-1-0",
  "userId": "public_user",
  "userName": "AFRO",
  "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
  "songName": "愛言葉",
  "playStyle": 1,
  "difficulty": 0,
  "level": 3,
  "score": 999950,
  "clearLamp": 6,
  "rank": "AAA"
}
```

</details>

|名前|型|説明|
|---|:--:|--|
|`id`|string|`${userId}-${songId}-${playStyle}-${difficulty}`|
|`userId`|string|ユーザーID|
|`userName`|string|ユーザー名|
|`songId`|string|曲ID (公式サイトより) `^([01689bdiloqDIOPQ]*){32}$`|
|`songName`|string|曲名|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`level`|integer|譜面のレベル|
|`score`|integer|通常スコア|
|`exScore`|integer?|EXスコア (省略可)|
|`maxCombo`|integer?|MAXコンボ数 (省略可)|
|`clearLamp`|integer|`0`: プレー済未クリア, `1`: アシストクリア, `2`: クリア, `3`: LIFE4, `4`: (Good) フルコンボ, `5`: グレートフルコンボ, `6`: PFC, `7`: MFC|
|`rank`|string|クリアランク (`E`～`AAA`)|
