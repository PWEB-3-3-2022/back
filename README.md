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

Set `MONGODB_CONN` environment variable to your mongodb instance connection string. (
e.g. `mongodb://localhost:27017/tcflix-test`)

Use a locally deployed mongodb instance or the one in mongodb atlas. If using the one on mongodb atlas please use the
database `tcflix-test`.

Set `TOKEN_KEY` to a 64 chars hex string as the key to encrypt auth tokens.

Set `B2_KEY_ID` to the backblaze key id and `B2_KEY`to the backblaze key.

```shell
node app.js
```

## Pushing changes

1. (Optional) Create an issue
2. Create a feature branch (e.g. feat/change)
3. Run the linter against your code before pushing (`npm run lint` & `npm run lint -- --fix`)
4. Push your commits to this new branch
5. Create a pull request
6. Wait for merge


### Database

```javascript
// Create the fts index in mongosh
db.media.createIndex({"title": "text", "description": "text", "genres": "text", "cast": "text"}, {name: "fts", weights: {"title": 10, "description": 4, "genres": 4, "cast": 8}})
```
