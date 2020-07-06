# Scores Collection

English version is [here](./scores.md).

ユーザーのクリア/スコア情報を格納するコレクションです。

## Schema

**太字**のプロパティは partition key です。

|名前|型|説明|
|----|:--:|-----------|
|id|string|`${userId}-${songId}-${playStyle}-${difficulty}`|
|**userId**|string|ユーザーID|
|userName|string|ユーザー名|
|isPublic|boolean|このスコアが一般公開されている場合は`true`、本人のみ閲覧できる場合には`false`|
|songId|string|曲ID (公式サイトより) `^([01689bdiloqDIOPQ]*){32}$`|
|songName|string|曲名|
|playStyle|integer|`1`: SINGLE, `2`: DOUBLE|
|difficulty|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|score|integer|通常スコア|
|exScore|integer?|EXスコア (省略可)|
|maxCombo|integer?|MAXコンボ数 (省略可)|
|clearLamp|integer|`0`: プレー済未クリア, `1`: アシストクリア, `2`: クリア, `3`: LIFE4, `4`: (Good) フルコンボ, `5`: グレートフルコンボ, `6`: PFC, `7`: MFC|
|rank|string|クリアランク (`"E"`～`"AAA"`)|

## Indexes

```json
{
    "indexingMode": "consistent",
    "automatic": true,
    "includedPaths": [
        {
            "path": "/*"
        }
    ],
    "excludedPaths": [
        {
            "path": "/\"_etag\"/?"
        }
    ]
}
```

## Sample

```json
{
    "id": "<データベースの自動生成>",
    "userId": "<Azure Authenticationの自動生成>",
    "userName": "ユーザー1",
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
}
```
