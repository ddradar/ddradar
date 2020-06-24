# Get Course List API

English version is [here](./README.md).

コース情報の一覧を取得します。

- [エンドポイント](#endpoint)
- [応答](#response)
  - [本文](#response-body)
- リンク
  - 実装 (index.ts)
  - 設定 (function.json)
  - 単体テスト (getCourseList.test.ts)

## Endpoint

認証は不要です。

> GET api/v1/courses

## Response

- `200 OK` と [JSON](#response-body)を返します。

### Response Body

<details>
  <summary>サンプル</summary>

```json
[
  {
    "id": "qbbOOO1QibO1861bqQII9lqlPiIoqb98",
    "name": "FIRST",
    "orders": [
      {
        "playStyle": 1,
        "difficulty": 0,
        "level": 4
      },
      {
        "playStyle": 1,
        "difficulty": 1,
        "level": 8
      },
      {
        "playStyle": 1,
        "difficulty": 2,
        "level": 9
      },
      {
        "playStyle": 1,
        "difficulty": 3,
        "level": 12
      },
      {
        "playStyle": 2,
        "difficulty": 1,
        "level": 9
      },
      {
        "playStyle": 2,
        "difficulty": 2,
        "level": 13
      },
      {
        "playStyle": 2,
        "difficulty": 3,
        "level": 11
      }
    ]
  }
]
```

</details>

|名前|型|説明|
|----|:--:|-----------|
|`id`|string|コースのID(公式サイトより) `^[01689bdiloqDIOPQ]{32}$`|
|`name`|string|コース名|
|`orders`|Order\[\]|プレースタイル/難易度別のコースオーダー。[下記を参照](#order)|

#### Order

|名前|型|説明|
|----|:--:|-----------|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`level`|integer|コースのレベル|
