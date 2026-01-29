---
title: Contributing Guideline
description: Guidelines for contributing to the DDRadar project.
links:
  - label: Repository
    icon: i-simple-icons-github
    to: https://github.com/ddradar/ddradar
---

当プロジェクトに関心を寄せていただき、ありがとうございます。
このプロジェクトはオープンソースであるため、誰でもプロジェクトに貢献することができます。
皆様がプロジェクトへの貢献を円滑に行えるよう、以下の事項を守っていただけますようお願いします。

## Getting Started

- このプロジェクトに貢献する為には [GitHub アカウント](https://github.com/signup/free) が必要です。
  - アカウントをお持ちでない場合、上記より作成するか、アカウントを持っている方に協力を依頼してください。
  - 注: [Crowdin 経由の翻訳](#translation-via-crowdin)には GitHub アカウントは不要です。

## Send issue

- 重複する Issue がないかどうか、はじめに検索してください。
- 機能要望(新機能の追加、既存機能の変更など)には、**必ず** Issue を作成してください。
  - 小さなバグ修正やリファクタリングなどは、Issue を作成せずに直接 Pull Request を送っても構いません。ただし、規模が大きい場合は、事前に Issue を作成し、了解を取ってから作業を始めてください。
- Issue を送るのに、事前の連絡は必要ありません。
- Issue のタイトルと本文はできるだけ英語で書いてください。
- バグを Issue で報告する場合、バグを再現する為の説明、エラーの情報、環境を書いてください。

## Making Changes

- コードやドキュメントを DDRadar に貢献するには、`main`ブランチから、トピック・ブランチを作ってください。(`issue_999`, `hotfix/song-page`など)
- 変更の為にテストが必要ならば、そのテストも追加または変更してください。
- commit は合理的(ロジック単位)に分けてください。また目的と関係のないコードの変更は含めないでください(コードフォーマットの変更、不要コードの削除など)。
- commit メッセージが正しいフォーマットであることを確認してください。commit メッセージはできるだけ英語でお願いします。
  - **feat**: A new feature
  - **fix**: A bug fix
  - **docs**: Documentation only changes
  - **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
  - **refactor**: A code change that neither fixes a bug nor adds a feature
  - **perf**: A code change that improves performance
  - **test**: Adding missing or correcting existing tests
  - **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

```text
修飾子(サブカテゴリ): コミットの概要
<ここは空行>
3行目以降に、このコミットの詳細を記述します。
```

### Coding Style

- Lint/Format ルールか、すでにあるコードのスタイルに準じます。
- 非 ASCII 文字(日本語など)を変数名に使用しないでください。
- コードのコメント部分に非 ASCII 文字を使うのは構いませんが、今後のリリースで英語に変更される可能性があることに留意してください。

## Documentation or Translation

- **大歓迎です！！**
- 不完全な英語を使っている箇所があるかもしれません。オーナーは英語話者ではないため、そういった部分の修正を大いに歓迎します。

### Translation via Crowdin

- 翻訳管理には [Crowdin](https://crowdin.com/) を使用しています。(一部のファイルを除く)
  - Crowdin プラットフォームを通じて、お好きな言語で翻訳に貢献できます。
- 翻訳を始めるには:
  1. Crowdin にサインアップまたはログイン (ガイドは[こちら](https://support.crowdin.com/for-translators/)を参照)
  2. [Crowdin の DDRadar プロジェクト](https://crowdin.com/project/ddradar) にアクセス
  3. 翻訳したい言語を選択して翻訳を開始
- 承認された翻訳は、自動的にリポジトリに同期されます。
- ご希望の言語が利用できない場合は、Issue を作成してリクエストしてください。
- Crowdin の翻訳対象になっていないファイルの翻訳については、[Making Changes](#making-changes) および [Pull Request](#pull-request) の手順に従ってください。

## Pull Request

- タイトルは変更の要約を分かりやすく書いてください。
- 本文には、関連する issue の番号を本文に含めてください。( ref #199 など)
- まだ作業中である場合、Draft Pull Request で送信してください。マージ可能になったら、Draft を外してください。
  - 作業中に `main` ブランチが変更された場合は、競合を解消してから Draft を外してください。
  - その作業を予約する意味で、先に Draft Pull Request を投稿しても構いません。ただし、長い間活動が見られない場合は、クローズされる場合があります。

## Thanks

このガイドは、[MMP/CONTRIBUTING.md · sn0w75/MMP](https://github.com/sn0w75/MMP/blob/master/CONTRIBUTING.md) (削除済み)を参考にして作成しました。
