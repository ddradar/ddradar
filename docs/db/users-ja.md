# Users Collection

English version is [here](./scores.md).

ユーザー情報を格納するコレクションです。

## Schema

**太字**のプロパティは partition key です。

|名前|型|説明|
|----|:--:|-----------|
|id|string|Azure Authentication より自動生成された内部ユーザーID|
|displayedId|string|ユーザーID (ユーザーページのURL等に用いる)|
|name|string|ユーザー名|
|**area**|number|エリアコード ([下記を参照](#area))|
|code|number?|DDR CODE (省略可)|
|isPublic|boolean|ユーザーを一般公開する場合は`true`、本人のみ閲覧できる場合には`false`|

### Area

|コード|名称(日本語)|名称(英語)|コード|名称(日本語)|名称(英語)|
|--|--|--|--|--|--|
|0|未設定|undefined|1|北海道|Hokkaido|
|2|青森県|Aomori|3|岩手県|Iwate|
|4|宮城県|Miyagi|5|秋田県|Akita|
|6|山形県|Yamagata|7|福島県|Fukushima|
|8|茨城県|Ibaraki|9|栃木県|Tochigi|
|10|群馬県|Gunma|11|埼玉県|Saitama|
|12|千葉県|Chiba|13|東京都|Tokyo|
|14|神奈川県|Kanagawa|15|新潟県|Niigata|
|16|富山県|Toyama|17|石川県|Ishikawa|
|18|福井県|Fukui|19|山梨県|Yamanashi|
|20|長野県|Nagano|21|岐阜県|Gifu|
|22|静岡県|Shizuoka|23|愛知県|Aichi|
|24|三重県|Mie|25|滋賀県|Shiga|
|26|京都府|Kyoto|27|大阪府|Osaka|
|28|兵庫県|Hyogo|29|奈良県|Nara|
|30|和歌山県|Wakayama|31|鳥取県|Tottori|
|32|島根県|Shimane|33|岡山県|Okayama|
|34|広島県|Hiroshima|35|山口県|Yamaguchi|
|36|徳島県|Tokushima|37|香川県|Kagawa|
|38|愛媛県|Ehime|39|高知県|Kochi|
|40|福岡県|Fukuoka|41|佐賀県|Saga|
|42|長崎県|Nagasaki|43|熊本県|Kumamoto|
|44|大分県|Oita|45|宮崎県|Miyazaki|
|46|鹿児島県|Kagoshima|47|沖縄県|Okinawa|
|48|香港|Hong Kong|49|韓国|Korea|
|50|台湾|Taiwan|51|アメリカ|USA|
|52|ヨーロッパ|Europe|53|海外|Oversea|
|106|カナダ|Canada|107|シンガポール|Singapore|
|108|タイ|Thailand|109|オーストラリア|Australia|
|110|ニュージーランド|New Zealand|111|イギリス|United Kingdom|
|112|イタリア|Italy|113|スペイン|Spain|
|114|ドイツ|Germany|115|フランス|France|
|116|ポルトガル|Portugal|117|インドネシア|Indonesia|
|118|フィリピン|Philippines|

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
    "id": "<Azure Authenticationの自動生成>",
    "displayedId": "user1",
    "name": "ユーザー1",
    "area": 13,
    "code": 10000000,
    "isPublic": true
}
```
