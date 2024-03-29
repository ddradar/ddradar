# DDRadar

日本語版のガイドは[こちら](README-ja.md)です。

[![GitHub deployments](https://img.shields.io/github/deployments/ddradar/ddradar/staging?label=staging&logo=microsoft-azure)](https://red-tree-09d43c100-beta.eastasia.azurestaticapps.net/)
[![last commit](https://img.shields.io/github/last-commit/ddradar/ddradar "last commit")](https://github.com/ddradar/ddradar/commits/main)
[![release version](https://img.shields.io/github/v/release/ddradar/ddradar?sort=semver "release version")](https://github.com/ddradar/ddradar/releases)
[![Node.js CI](https://github.com/ddradar/ddradar/actions/workflows/nodejs.yml/badge.svg)](https://github.com/ddradar/ddradar/actions/workflows/nodejs.yml)
[![CodeFactor](https://www.codefactor.io/repository/github/ddradar/ddradar/badge "CodeFactor")](https://www.codefactor.io/repository/github/ddradar/ddradar)
[![codecov](https://codecov.io/gh/ddradar/ddradar/branch/main/graph/badge.svg?token=ynbl5vBONK "codecov")](https://codecov.io/gh/ddradar/ddradar)
[![dependabot](https://img.shields.io/static/v1?label=dependabot&message=enabled&color=green&logo=dependabot "dependabot")](https://github.com/ddradar/ddradar/network/updates)
[![License](https://img.shields.io/github/license/ddradar/ddradar)](LICENSE)

DDR Score Tracker

## Setup

```bash
# Install dependencies
pnpm install
```

### Required

- Node.js `18.x`
- pnpm `8.x`
- [Azure Functions Core Tools](https://github.com/Azure/azure-functions-core-tools) `4.x`

- If you want to use [Azure Cosmos Emulator](https://docs.microsoft.com/azure/cosmos-db/local-emulator) for API development and test, install it and set env below.
  - `COSMOS_DB_CONN`: `AccountEndpoint=https://127.0.0.1:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==`
  - `NODE_TLS_REJECT_UNAUTHORIZED`: `0`

## Develop Command

```bash
# Install dependencies
pnpm install
# Run Lint
pnpm lint
# Run Lint & auto fix
pnpm fix
# Run unit test
pnpm test
# Production build
pnpm build
```

## Contributing

See [this guide](CONTRIBUTING.md).
