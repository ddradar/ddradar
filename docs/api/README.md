# API References

日本語版は[こちら](./README-ja.md)にあります。

- [Authentication](#authentication-api)
- [Song](#song-api)
- [Course](#course-api)
- [User](#user-api)
- [Score](#score-api)
- [Notification](#notification-api)

## Authentication API

See also [Authentication API Docs](./authentication.md).

- [Login](./authentication.md#login)
- [Get Credentials](./authentication.md#get-credentials)
- [Logout](./authentication.md#logout)

## Song API

- [Get Song Information](../../api/getSongInfo/README.md)
- [Post Song Information](../../api/postSongInfo/README.md) **Admin only*
- [Search Song by Name](../../api/searchSongByName/README.md)
- [Search Song by Series](../../api/searchSongBySeries/README.md)
- [Search Charts](../../api/searchCharts/README.md)

## Course API

- [Get Course Information](../../api/getCourseInfo/README.md)
- [Get Course List](../../api/getCourseList/README.md)

## User API

- [Exists User](../../api/existsUser/README.md) **Authed user only*
- [Get Current User Data](../../api/getCurrentUser/README.md) **Authed user only*
- [Get User List](../../api/getUserList/README.md)
- [Get User Information](../../api/getUserInfo/README.md)
- [Post User Information](../../api/postUserInfo/README.md) **Authed user only*

## Score API

- [Get Chart Score](../../api/getChartScore/README.md)
- [Post Chart Score](../../api/postChartScore/README.md) **Authed user only*
- [Post Song Scores](../../api/postSongScores/README.md) **Authed user only*
- [Delete Chart Score](../../api/deleteChartScore/README.md) **Authed user only*
- [Import Scores from e-amusement GATE](../../api/importScores/README.md) **Authed user only*

## Notification API

- [Get Notification List](../../api/getNotificationList/README.md)
- [Get Notification Info](../../api/getNotificationInfo/README.md)
- [Post Notification](../../api/postNotification/README.md) **Admin only*
