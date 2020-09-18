# Scores Collection

日本語版は[こちら](./courses-ja.md)にあります。

The collection that stores user scores.

## Schema

**Bolded** property is the partition key.

|Name|Type|Description|
|----|:--:|-----------|
|**userId**|string|User ID|
|userName|string|User name|
|isPublic|boolean|`true` if this score is public, otherwize `false`.|
|songId|string|Song id that depend on official site. `^([01689bdiloqDIOPQ]*){32}$`|
|songName|string|Song name|
|playStyle|integer|`1`: SINGLE, `2`: DOUBLE|
|difficulty|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|level|integer|Chart level|
|score|integer|Normal score|
|exScore|integer?|EX SCORE (optional)|
|maxCombo|integer?|MAX COMBO (optional)|
|clearLamp|integer|`0`: Failed, `1`: Assisted Clear `2`: Clear, `3`: LIFE4, `4`: Good FC (Full Combo), `5`: Great FC, `6`: PFC, `7`: MFC|
|rank|string|Clear rank (`"E"`～`"AAA"`)|

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
    ],
    "compositeIndexes": [
        {
            "path": "/score",
            "order": "descending"
        },
        {
            "path": "/clearLamp",
            "order": "descending"
        },
        {
            "path": "/_ts",
            "order": "ascending"
        }
    ]
}
```

## Sample

```json
{
    "id": "some_user1-QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl-1-0",
    "userId": "some_user1",
    "userName": "User1",
    "isPublic": true,
    "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
    "songName": "愛言葉",
    "playStyle": 1,
    "difficulty": 0,
    "level": 3,
    "score": 1000000,
    "exScore": 402,
    "maxCombo": 122,
    "clearLamp": 7,
    "rank": "AAA"
}
```
