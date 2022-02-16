# TCflix backend

## Setup for development

### Prerequisites

Recent [NodeJS](https://nodejs.org) with npm or [pnpm](https://pnpm.io) (recommended).

#### Mongodb

A [mongodb](https://www.mongodb.com/try/download/community) instance must be up and running.

It is recommended to also install mongodb compass to set up and explore the database.

### Clone repo and install dependencies

```shell
git clone https://github.com/PWEB-3-3-2022/back
cd back
pnpm install
```

### Recommended IDE setup

[VSCode](https://code.visualstudio.com/) or Webstorm.

It is also recommended to setup your IDE to work with ESLint.

### Running

Set `MONGODB_CONN` environment variable to your mongodb instance connection string. (e.g. `mongodb://localhost:27017/`)

```shell
node app.js
```

## Pushing changes

1. (Optional) Create an issue
2. Create a feature branch (e.g. feat/change)
3. Run your code against the linter before pushing `pnpm run lint`
4. Push your commits to this new branch
5. Create a pull request
6. Wait for merge

