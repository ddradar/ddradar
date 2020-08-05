# Database

日本語版は[こちら](./README-ja.md)にあります。

This project uses *Azure Cosmos DB* for backend database.
This document describes the database schema definition.

For technical details, please see [Cosmos DB documents](https://docs.microsoft.com/azure/cosmos-db/).

## Containers

/DDRadar

- [/Scores](./scores.md)
- [/Songs](./songs.md)
- [/Users](./users.md)

## Initialization code

[initDatabase.js](../../api/__tests__/initDatabase.js)
