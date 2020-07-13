# Post Chart Score API

English version is [here](./README.md).

指定した譜面のスコアを削除します。

*注意: 全国トップおよびエリアトップに登録されたスコアは削除されません。*

- [エンドポイント](#endpoint)
- [パラメータ](#parameters)
- [応答](#response)
- リンク
  - [実装 (index.ts)](index.ts)
  - [設定 (function.json)](function.json)
  - [単体テスト (index.test.ts)](index.test.ts)

## Endpoint

認証が必要です。

> DELETE api/v1/scores/*:songId*/*:playStyle*/*:difficulty*

## Parameters

|名前|型|説明|
|---|:--|---|
|`songId`|string|曲ID。パターン `^[01689bdiloqDIOPQ]{32}$` と一致する必要があります。|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|

## Response

- 未認証の場合、`401 Unauthorized` を返します。
- ルートパラメータが不正な場合、`404 Not Found` を返します。
- ユーザー登録が完了していないか、該当するスコアが存在しない場合、`404 Not Found` を返します。
- その他の場合、`204 No Content` を返します。
