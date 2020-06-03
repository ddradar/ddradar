# Courses Collection

English version is [here](./courses.md).

コースの情報を格納するコレクションです。

## Schema

**太字**のプロパティは partition key です。

|名前|型|説明|
|----|:--:|-----------|
|**id**|string|コースのID(公式サイトより) `^([01689bdiloqDIOPQ]*){32}$`|
|name|string|コース名|
|orders|Order\[\]|プレースタイル/難易度別のコースオーダー。[下記を参照](#order)|

### Order

|名前|型|説明|
|----|:--:|-----------|
|playStyle|integer|`1`: SINGLE, `2`: DOUBLE|
|difficulty|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|level|integer|コースのレベル|
|chartOrder|Chart\[\]|コース内の曲/譜面情報。[下記を参照](#chart)|

### Chart

|名前|型|説明|
|----|:--:|-----------|
|songId|string|曲ID(公式サイトより) `^([01689bdiloqDIOPQ]*){32}$`|
|songName|string|曲名|
|playStyle|integer|`1`: SINGLE, `2`: DOUBLE|
|difficulty|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|level|integer|譜面のレベル|

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
  "id": "qbbOOO1QibO1861bqQII9lqlPiIoqb98",
  "name": "FIRST",
  "orders": [
    {
      "playStyle": 1,
      "difficulty": 0,
      "level": 4,
      "chartOrder": [
        {
          "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
          "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
          "difficulty": 0,
          "level": 2
        },
        {
          "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
          "songName": "MAKE IT BETTER",
          "difficulty": 0,
          "level": 3
        },
        {
          "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
          "songName": "TRIP MACHINE",
          "difficulty": 0,
          "level": 3
        },
        {
          "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
          "songName": "PARANOiA",
          "difficulty": 0,
          "level": 4
        }
      ]
    },
    {
      "playStyle": 1,
      "difficulty": 1,
      "level": 8,
      "chartOrder": [
        {
          "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
          "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
          "difficulty": 1,
          "level": 4
        },
        {
          "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
          "songName": "MAKE IT BETTER",
          "difficulty": 1,
          "level": 7
        },
        {
          "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
          "songName": "TRIP MACHINE",
          "difficulty": 1,
          "level": 8
        },
        {
          "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
          "songName": "PARANOiA",
          "difficulty": 1,
          "level": 8
        }
      ]
    },
    {
      "playStyle": 1,
      "difficulty": 2,
      "level": 9,
      "chartOrder": [
        {
          "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
          "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
          "difficulty": 2,
          "level": 6
        },
        {
          "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
          "songName": "MAKE IT BETTER",
          "difficulty": 2,
          "level": 9
        },
        {
          "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
          "songName": "TRIP MACHINE",
          "difficulty": 2,
          "level": 9
        },
        {
          "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
          "songName": "PARANOiA",
          "difficulty": 2,
          "level": 9
        }
      ]
    },
    {
      "playStyle": 1,
      "difficulty": 3,
      "level": 12,
      "chartOrder": [
        {
          "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
          "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
          "difficulty": 3,
          "level": 10
        },
        {
          "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
          "songName": "MAKE IT BETTER",
          "difficulty": 3,
          "level": 12
        },
        {
          "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
          "songName": "TRIP MACHINE",
          "difficulty": 3,
          "level": 10
        },
        {
          "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
          "songName": "PARANOiA",
          "difficulty": 3,
          "level": 11
        }
      ]
    },
    {
      "playStyle": 2,
      "difficulty": 1,
      "level": 9,
      "chartOrder": [
        {
          "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
          "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
          "difficulty": 1,
          "level": 4
        },
        {
          "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
          "songName": "MAKE IT BETTER",
          "difficulty": 1,
          "level": 7
        },
        {
          "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
          "songName": "TRIP MACHINE",
          "difficulty": 1,
          "level": 9
        },
        {
          "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
          "songName": "PARANOiA",
          "difficulty": 1,
          "level": 8
        }
      ]
    },
    {
      "playStyle": 2,
      "difficulty": 2,
      "level": 13,
      "chartOrder": [
        {
          "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
          "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
          "difficulty": 2,
          "level": 6
        },
        {
          "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
          "songName": "MAKE IT BETTER",
          "difficulty": 2,
          "level": 9
        },
        {
          "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
          "songName": "TRIP MACHINE",
          "difficulty": 2,
          "level": 10
        },
        {
          "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
          "songName": "PARANOiA",
          "difficulty": 2,
          "level": 13
        }
      ]
    },
    {
      "playStyle": 2,
      "difficulty": 3,
      "level": 11,
      "chartOrder": [
        {
          "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
          "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
          "difficulty": 3,
          "level": 10
        },
        {
          "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
          "songName": "MAKE IT BETTER",
          "difficulty": 3,
          "level": 11
        },
        {
          "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
          "songName": "TRIP MACHINE",
          "difficulty": 3,
          "level": 10
        },
        {
          "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
          "songName": "PARANOiA",
          "difficulty": 3,
          "level": 11
        }
      ]
    }
  ]
}
```
