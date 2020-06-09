# Search Charts API

English version is [here](./README.md).

指定した条件に一致する譜面の一覧を取得します。

- [エンドポイント](#endpoint)
- [パラメータ](#parameters)
- [応答](#response)
  - [本文](#response-body)
- リンク
  - [実装 (index.ts)](index.ts)
  - [設定 (function.json)](function.json)
  - [単体テスト (index.test.ts)](index.test.ts)

## Endpoint

認証は不要です。

> GET /api/charts/*:playStyle*/*:level*

## Parameters

|名前|型|説明|
|---|:--|---|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`level`|integer|譜面のレベル|

## Response

- `playStyle` または `level` が未指定、あるいは型が一致しなかった場合は、`404 Not Found` を返します。
- 条件と一致する譜面が見つからなかった場合は、`404 Not Found` を返します。
- 条件と一致する譜面が見つかった場合は、`200 OK` と、[JSON](#response-body)を返します。

### Response Body

条件と一致するオブジェクトの配列。

配列の順序は、`nameIndex`, `nameKana` の昇順です。

<details>
  <summary>Sample</summary>

```json
[
  {
    "id": "61oIP0QIlO90d18ObDP1Dii6PoIQoOD8",
    "name": "イーディーエム・ジャンパーズ",
    "series": "DanceDanceRevolution A",
    "playStyle": 1,
    "difficulty": 3,
    "level": 12
  }
]
```

</details>

|名前|型|説明|
|---|:--:|---|
|`id`|string|曲ID (公式サイトより) `^[01689bdiloqDIOPQ]{32}$`|
|`name`|string|曲名|
|`series`|string|シリーズタイトル|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`level`|integer|譜面のレベル|
