# Song Collection

日本語版は[こちら](./songs-ja.md)にあります。

The collection that stores song & score information.

## Schema

**Bolded** property is the partition key.

|Name|Type|Description|
|----|:--:|-----------|
|id|string|Song id that depend on official site. `^([01689bdiloqDIOPQ]*){32}$`|
|name|string|Song name|
|nameKana|string|Song furigana for sorting. `^([A-Z0-9 .ぁ-んー]*)$`|
|**nameIndex**|integer|Index for sorting. Associated with the "Find by Name" folder.<br />`0`: あ行, `1`: か行, ..., `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号|
|artist|string|Artist name|
|series|string|Series title depend on official site.|
|minBPM|integer \| null|Displayed min BPM (Beet Per Minutes). Set to `null` if not revealed, such as "???".|
|maxBPM|integer \| null|Displayed max BPM (Beet Per Minutes). Set to `null` if not revealed, such as "???".|
|charts|StepChart\[]|Song's step charts. [See below](#stepchart)|

### StepChart

|Name|Type|Description|
|----|:--:|-----------|
|playStyle|integer|`1`: SINGLE, `2`: DOUBLE|
|difficulty|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|level|integer|Chart level|
|notes|integer|Normal arrow count. (Jump = 1 count)|
|freezeArrow|integer|Freeze arrow count|
|shockArrow|integer|Shock arrow count|
|stream|integer|Groove Radar STREAM|
|voltage|integer|Groove radar VOLTAGE|
|air|integer|Groove radar AIR|
|freeze|integer|Groove radar FREEZE|
|chaos|integer|Groove radar CHAOS|

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
        [
            {
                "path": "/nameIndex",
                "order": "ascending"
            },
            {
                "path": "/nameKana",
                "order": "ascending"
            }
        ]
    ]
}
```

## Sample

```json
{
  "id": "61oIP0QIlO90d18ObDP1Dii6PoIQoOD8",
  "name": "イーディーエム・ジャンパーズ",
  "nameKana": "いーでぃーえむ じゃんぱーず",
  "nameIndex": 0,
  "artist": "かめりあ feat. ななひら",
  "series": "DanceDanceRevolution A",
  "minBPM": 72,
  "maxBPM": 145,
  "charts": [
    {
      "playStyle": 1,
      "difficulty": 0,
      "level": 3,
      "notes": 70,
      "freezeArrow": 11,
      "shockArrow": 0,
      "stream": 12,
      "voltage": 11,
      "air": 1,
      "freeze": 20,
      "chaos": 0
    },
    {
      "playStyle": 1,
      "difficulty": 1,
      "level": 5,
      "notes": 142,
      "freezeArrow": 24,
      "shockArrow": 0,
      "stream": 25,
      "voltage": 22,
      "air": 18,
      "freeze": 61,
      "chaos": 0
    },
    {
      "playStyle": 1,
      "difficulty": 2,
      "level": 8,
      "notes": 248,
      "freezeArrow": 25,
      "shockArrow": 0,
      "stream": 43,
      "voltage": 44,
      "air": 23,
      "freeze": 50,
      "chaos": 9
    },
    {
      "playStyle": 1,
      "difficulty": 3,
      "level": 12,
      "notes": 336,
      "freezeArrow": 47,
      "shockArrow": 0,
      "stream": 59,
      "voltage": 50,
      "air": 23,
      "freeze": 67,
      "chaos": 44
    },
    {
      "playStyle": 2,
      "difficulty": 1,
      "level": 4,
      "notes": 132,
      "freezeArrow": 23,
      "shockArrow": 0,
      "stream": 23,
      "voltage": 22,
      "air": 12,
      "freeze": 58,
      "chaos": 0
    },
    {
      "playStyle": 2,
      "difficulty": 2,
      "level": 8,
      "notes": 231,
      "freezeArrow": 22,
      "shockArrow": 0,
      "stream": 42,
      "voltage": 39,
      "air": 21,
      "freeze": 46,
      "chaos": 6
    },
    {
      "playStyle": 2,
      "difficulty": 3,
      "level": 11,
      "notes": 326,
      "freezeArrow": 45,
      "shockArrow": 0,
      "stream": 57,
      "voltage": 50,
      "air": 20,
      "freeze": 64,
      "chaos": 40
    }
  ]
}
```
