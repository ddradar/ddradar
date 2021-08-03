# API References

English version is [here](./README.md).

- [認証](#authentication-api)
- [曲](#song-api)
- [コース](#course-api)
- [ユーザー](#user-api)
- [スコア](#score-api)
- [通知](#notification-api)

## Authentication API

[認証APIのドキュメント](./authentication-ja.md)もご覧ください。

- [ログイン](./authentication-ja.md#login)
- [認証情報の取得](./authentication-ja.md#get-credentials)
- [ログアウト](./authentication-ja.md#logout)

## Song API

- [曲情報の取得](../../api/songs__id/README-ja.md)
- [曲情報の追加/更新](../../api/songs--post/README-ja.md) **管理者のみ*
- [曲名で曲検索](../../api/songs__name__id/README-ja.md)
- [シリーズタイトルで曲検索](../../api/songs__series__id/README-ja.md)
- [譜面検索](../../api/charts__style__level/README-ja.md)

## User API

- [ユーザー存在チェック](../../api/users__exists__id/README-ja.md) **ログインユーザーのみ*
- [ログインユーザー情報取得](../../api/user--get/README-ja.md) **ログインユーザーのみ*
- [ユーザー一覧の取得](../../api/users/README-ja.md)
- [ユーザー情報の取得](../../api/users__id/README-ja.md)
- [ユーザー情報の追加/更新](../../api/user--post/README-ja.md) **ログインユーザーのみ*
- [クリア情報の取得](../../api/users__id__clear/README-ja.md)
- [スコア情報の取得](../../api/users__id__score/README-ja.md)
- [グルーブレーダーの取得](../../api/users__id__radar__style/README.md)

## Score API

- [スコア取得(譜面別)](../../api/scores__id__style__difficulty--get/README-ja.md)
- [スコア追加/更新(譜面別)](../../api/scores__id__style__difficulty--post/README-ja.md) **ログインユーザーのみ*
- [スコア追加/更新(曲別)](../../api/scores__id--post/README-ja.md) **ログインユーザーのみ*
- [スコア削除(譜面別)](../../api/scores__id__style__difficulty--delete/README-ja.md) **ログインユーザーのみ*

## Notification API

- [通知一覧の取得](../../api/notification/README-ja.md)
- [通知詳細の取得](../../api/notification__id/README-ja.md)
- [通知の追加/更新](../../api/notification--post/README-ja.md) **管理者のみ*
