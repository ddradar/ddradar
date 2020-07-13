# Import Scores from e-amusement GATE API

English version is [here](./README.md).

公式サイトより閲覧できる「[楽曲データ一覧](https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_single.html)」のHTMLソースから、スコア情報を抽出し追加/更新します。

*注意: 「楽曲データ一覧」の閲覧には「[e-amusement ベーシックコース](https://p.eagate.573.jp/payment/p/select_course.html)」の加入が必要です。*

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

> POST api/v1/scores/eagate

## Parameters

### Request Body

<details>
  <summary>サンプル</summary>

```json
{
  "type": "eagate_music_data",
  "body": "<!DOCTYPE html>..."
}
```

</details>

|名前|型|説明|
|---|:--|---|
|`type`|string|`eagate_music_data`|
|`body`|string|HTMLソース文字列|

## Response

- 未認証の場合、`401 Unauthorized` を返します。
- HTMLソース文字列が不正な場合、`400 Bad Request` を返します。
- ユーザー登録が完了していない場合、`404 Not Found` を返します。
- その他の場合、`200 OK` と [JSON](#response-body)を返します。

### Response Body

<details>
  <summary>サンプル</summary>

```json
{
  "count": 20
}
```

</details>

|名前|型|説明|
|---|:--:|--|
|`count`|integer|登録/更新件数|
