# API References

English version is [here](./README.md).

- [認証](#authentication-api)
- [曲](#song-api)
- [コース](#course-api)
- [ユーザー](#user-api)

## Authentication API

[認証APIのドキュメント](./authentication-ja.md)もご覧ください。

- [ログイン](./authentication-ja.md#login)
- [認証情報の取得](./authentication-ja.md#get-credentials)
- [ログアウト](./authentication-ja.md#logout)

## Song API

- [曲情報の取得](../../api/getSongInfo/README-ja.md)
- [曲情報の追加/更新](../../api/postSongInfo/README-ja.md) **管理者のみ*
- [曲名で曲検索](../../api/searchSongByName/README-ja.md)
- [シリーズタイトルで曲検索](../../api/searchSongBySeries/README-ja.md)
- [譜面検索](../../api/searchCharts/README-ja.md)

## Course API

- [コース情報の取得](../../api/getCourseInfo/README-ja.md)
- [コース一覧の取得](../../api/getCourseList/README-ja.md)

## User API

- [ユーザー存在チェック](../../api/existsUser/README-ja.md) **ログインユーザーのみ*
- [ログインユーザー情報取得](../../api/getCurrentUser/README-ja.md) **ログインユーザーのみ*
- [ユーザー一覧の取得](../../api/getUserList/README-ja.md)
- [ユーザー情報の取得](../../api/getUserInfo/README-ja.md)
- [ユーザー情報の追加/更新](../../api/postUserInfo/README-ja.md) **ログインユーザーのみ*

## Score API

- [スコア取得(譜面別)](../../api/getChartScore/README-ja.md)
- [スコア追加/更新(譜面別)](../../api/postChartScore/README-ja.md) **ログインユーザーのみ*
- [スコア削除(譜面別)](../../api/deleteChartScore/README-ja.md) **ログインユーザーのみ*
