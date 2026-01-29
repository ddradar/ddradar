---
title: Contributing Guideline
description: Guidelines for contributing to the DDRadar project.
links:
  - label: Repository
    icon: i-simple-icons-github
    to: https://github.com/ddradar/ddradar
---

Thank you for your interest in this project.
This project is open source, and anyone can contribute to the project.
Please follow the instructions below to ensure that you can contribute smoothly.

## Getting Started

- You need your [GitHub account](https://github.com/signup/free) to contribute this project.
  - If you do not have an account, please create one from the above link, or ask someone who has an account for help.
  - Note: [Translating via Crowdin](#translation-via-crowdin) does not require a GitHub account.

## Send issue

- Search for the same issue before submitting it.
- Be sure to create an issue to have a feature request.
  - For small bug fixes or refactorings, you can send PR directly, but if they are a big change, create an issue in advance and get approval.
- You have not to contact us before you send issue.
- You may use English, or Japanese.
- Write things exactly, and Don't send issues with only one sentence.

## Making Changes

- Checkout your topic branch from `main` branch to create code or documents. (ex. `issue_99`, `hotfix/song-page`)
- Add or Change test if you need.
- Commit should be logical units. Do not include extra code changes.
- Add prefix to commit message (inherits [angular.js/DEVELOPERS.md](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#type))
  - **feat**: A new feature
  - **fix**: A bug fix
  - **docs**: Documentation only changes
  - **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
  - **refactor**: A code change that neither fixes a bug nor adds a feature
  - **perf**: A code change that improves performance
  - **test**: Adding missing or correcting existing tests
  - **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

```text
prefix(category): summery
<blank line>
detail
```

### Coding Style

- Follow Lint/Format rules or existing code style.
- Do not use non-ASCII characters for variable names.
- You can use non-ASCII characters in comment block, but it might be deleted future release.

## Documentation or Translation

- _Welcome!!_
- Some resources might be written in [AYBABTU](https://en.wikipedia.org/wiki/All_your_base_are_belong_to_us) English.
  Repo owner is not an English speaker, so we welcome any modifications to those.

### Translation via Crowdin

- We use [Crowdin](https://crowdin.com/) for managing translations. (excepts some files)
  - You can contribute translations in your language through the Crowdin platform.
- To get started:
  1. Sign up or log in to Crowdin (see [guide](https://support.crowdin.com/for-translators/))
  2. Visit [DDRadar project on Crowdin](https://crowdin.com/project/ddradar)
  3. Select your language and start translating
- Your translations will be automatically synced to the repository once approved.
- If your language is not available, please create an issue to request it.
- For files not covered by Crowdin, please follow the [Making Changes](#making-changes) and [Pull Request](#pull-request) sections.

## Pull Request

- Title should include a clear summary of the changes.
- Add related issue number to your description.(ex. ref #199)
- If PR is in progress, send as Draft Pull Request. And remove Draft when we can review.
  - Resolve conflict to `main` before you remove Draft.
  - To reserve the work, You may submit a Draft Pull Request first. However, if there is no activity for a long time, it may be closed.

## Thanks

ref. [MMP/CONTRIBUTING.md · sn0w75/MMP](https://github.com/sn0w75/MMP/blob/master/CONTRIBUTING.md) (Deleted)
