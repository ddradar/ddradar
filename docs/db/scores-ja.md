# Scores Collection

English version is [here](./scores.md).

ユーザーのクリア/スコア情報を格納するコレクションです。

## Schema

**太字**のプロパティは partition key です。

|名前|型|説明|
|----|:--:|-----------|
|id|string|データベース側で自動生成|
|**userId**|string|Azure Authentication より自動生成されたユーザーID。もしくは[下記](#special-userid)の特別なID。|
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

### Special userId

#### `top_score`

全国トップのスコアを格納します。

公式サイトの「全国トップ」欄より導出されます。

以下の値を取ります。

|名前|値|
|----|--|
|userId|`"top_score"`|
|userName|`"全国トップ"`|
|isPublic|`true`|
|exScore|`score`から類推できない場合は省略|
|maxCombo|`score`から類推できない場合は省略|
|clearLamp|`score`から類推できない場合は`2`|

#### `area_top_score_*`

各エリアトップのスコアを格納します。`*`には[エリアコード](./users-ja.md#area)が入ります。

公式サイトの「全国トップ」欄、または登録ユーザーの公開されたスコアより導出されます。

以下の値を取ります。

|名前|値|
|----|--|
|userId|`"area_top_score_"` + エリアコード|
|userName|エリア名称 + `"トップ"`|
|isPublic|`true`|
|exScore|`score`から類推できない場合は省略|
|maxCombo|`score`から類推できない場合は省略|
|clearLamp|`score`から類推できない場合は`2`|

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
