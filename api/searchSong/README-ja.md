# Search Song API

English version is [here](./README.md).

指定した条件に一致する曲情報の一覧を取得します。

- [エンドポイント](#endpoint)
- [パラメータ](#parameters)
- [応答](#response)
  - [本文](#response-body)
- リンク
  - [実装 (index.ts)](./index.ts)
  - [設定 (function.json)](./function.json)
  - [単体テスト (index.test.ts)](./index.test.ts)

## Endpoint

認証は不要です。

> GET /api/songs/series/0&name=0

> GET /api/songs/name/0&series=0

## Parameters

|名前|型|説明|
|---|:--|---|
|`series`|integer|`0`: DDR 1st, `1`: DDR 2ndMIX, ..., `16`: Dance Dance Revolution A20|
|`name`|integer|`0`: あ行, `1`: か行, ..., `9`: わ行, `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号|

## Response

- `series` と `name` の両方が未指定、あるいは型が一致しなかった場合は、`404 Not Found` を返します。
  - クエリで指定した条件が不正である場合は、単に無視されます。
- 条件と一致する曲が見つからなかった場合は、`404 Not Found` を返します。
条件と一致する曲が見つかった場合は、`200 OK` と、[JSON](#response-body)を返します。

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
    "nameKana": "いーでぃーえむ じゃんぱーず",
    "nameIndex": 0,
    "artist": "かめりあ feat. ななひら",
    "series": "DanceDanceRevolution A",
    "minBPM": 72,
    "maxBPM": 145
  }
]
```

</details>

|名前|型|説明|
|---|:--:|---|
|`id`|string|曲ID (公式サイトより) `^[01689bdiloqDIOPQ]{32}$`|
|`name`|string|曲名|
|`nameKana`|string|曲名のふりがな (並び替え用) `^([A-Z0-9 .ぁ-んー]*)$`|
|`nameIndex`|integer|曲名のインデックス。「曲名から探す」フォルダーと対応しています。<br />`0`: あ行, `1`: か行, ..., `9`: わ行, `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号|
|`artist`|string|アーティスト名|
|`series`|string|シリーズタイトル|
|`minBPM`|integer \| null|表記された最小のBPM。「???」のように明らかにされていない場合は `null`。|
|`maxBPM`|integer \| null|表記された最大のBPM。「???」のように明らかにされていない場合は `null`。|
