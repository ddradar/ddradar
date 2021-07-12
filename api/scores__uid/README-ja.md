# Get User Scores API

English version is [here](./README.md).

指定した条件と一致する、ユーザースコアの一覧を取得します。

- [エンドポイント](#endpoint)
- [パラメータ](#parameters)
- [応答](#response)
  - [本文](#response-body)
- リンク
  - [実装 (index.ts)](index.ts)
  - [設定 (function.json)](function.json)
  - [単体テスト (index.test.ts)](index.test.ts)

## Endpoint

認証は不要です。認証済ユーザーの場合は、非公開の場合でも自身のデータを取得できます。

> GET api/v1/scores/*:userId*?style=1&diff=1&lv=5&lamp=5&rank=AAA

## Parameters

|名前|型|説明|
|---|:--|---|
|`userId`|string|ユーザーID|
|`style`|integer?|`1`: SINGLE, `2`: DOUBLE|
|`diff`|integer?|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`lv`|integer?|譜面のレベル|
|`lamp`|integer?|`0`: プレー済未クリア, `1`: アシストクリア, `2`: クリア, `3`: LIFE4, `4`: (Good) フルコンボ, `5`: グレートフルコンボ, `6`: PFC, `7`: MFC|
|`rank`|string?|クリアランク (`E`～`AAA`)|

## Response

- パラメータと一致するスコアがない場合、`404 Not Found` を返します。
- その他の場合、`200 OK` と [JSON](#response-body)を返します。

### Response Body

<details>
  <summary>サンプル</summary>

```json
[
  {
    "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
    "songName": "愛言葉",
    "playStyle": 1,
    "difficulty": 0,
    "level": 3,
    "score": 999950,
    "clearLamp": 6,
    "rank": "AAA",
    "isCourse": false
  }
]
```

</details>

|名前|型|説明|
|---|:--:|--|
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
|`deleted`|boolean?|Song is deleted or not|
|`isCourse`|boolean|Course or not|
