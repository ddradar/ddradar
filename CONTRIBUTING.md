# HOW TO CONTRIBUTE

[日本語版のガイドはこちらです。](CONTRIBUTING-ja.md)

Thank you for your interest in this project. This project is open source, and anyone can contribute to the project. Please follow the instructions below to ensure that you can contribute smoothly.

## TOC

- [Getting Started](#getting-started)
- [Send issue](#send-issue)
- [Making Changes](#making-changes)
  - [Coding Style](#coding-style)
  - [Documentation or Translation](#documentation-or-translation)
- [Pull Request](#pull-request)
- [Thanks](#thanks)

## Getting Started

- You need your [GitHub account](https://github.com/signup/free) to contribute this project.

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
prefix(category): summary
<blank line>
detail
```

### Coding Style

- Follow Lint rules or existing code style.
- Do not use non-ASCII characters for variable names.
- You can use non-ASCII characters in comment block, but it might be deleted future release.

### Documentation or Translation

- *Welcome!!*
- Some document, including this one, use [AYBABTU](https://en.wikipedia.org/wiki/All_your_base_are_belong_to_us) English.
  Repo owner is not an English speaker, so we welcome any modifications to those.

## Pull Request

- Title should include a clear summary of the changes.
- Add related issue number to your description.(ex. ref #199)
- If PR is in progress, add `[WIP]` prefix and send as Draft Pull Request. And remove `[WIP]` and Draft when we can review.
  - Resolve conflict to `main` before you remove `[WIP]` prefix.
  - To reserve the work, You may submit a Pull Request with `[WIP]` first. However, if there is no activity for a long time, it may be closed.

## Thanks

ref. [MMP/CONTRIBUTING.md · sn0w75/MMP](https://github.com/sn0w75/MMP/blob/master/CONTRIBUTING.md) (Deleted)
