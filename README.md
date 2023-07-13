# 🌌 Raise monorepo

This repository holds most of the code for Raise.

Think any documentation is out of date, incomplete, misleading or otherwise could be improved? Open a pull request or get in touch with the national team's tech person.

- [🌐 Website](./apps/web)
- [🔃 Server](./apps/server)
- [📦 Shared](./packages/shared)
- [🌈 UI](./packages/ui)

## 📝 Making small website changes

Target audience: Raise volunteers who want to make small website content changes.

See the [Editing your chapter's website](https://docs.google.com/document/d/1zKPq93_yagaYJ8QvAEilO8ZveSKTM7FxHwx4GFy-vRg/edit) doc.

## 🧑‍💻 Advanced (for developers)

Target audience: Raise volunteers and open-source contributors who have some coding experience, and want to make changes to any part of Raise.

These docs apply to everything across the repository. For more specific docs, see the README files inside the relevant folder.

### 🔧 Setup

You only need to do this once.

1. Install [Node](https://nodejs.org/) (choose the LTS version) and [VS Code](https://code.visualstudio.com/Download)
2. Install [Java](https://adoptium.net/) (choose the latest LTS version)
3. Clone the repository ([more info](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository))
4. Open the folder with VS Code
5. Run `npm install` in the root

### 🏃 Running locally

Summary: start everything with `npx turbo start`, and test with `npx turbo test`

| Command                 | What it does                                   |
|-------------------------|------------------------------------------------|
| `npm install`           | Install and update dependencies                |
| `npx turbo start`       | Find lint issues                               |
| `npx turbo test`        | Run unit tests                                 |
| `npx turbo test:watch`  | Run unit tests in watch mode                   |
| `npx turbo lint`        | Find lint issues                               |
| `npx turbo lint:fix`    | Auto-fix lint issues                           |
| `npx turbo build`       | Build and type-check. Output goes into `dist`. |
| `npx turbo deploy:dev`  | Deploy to dev environment                      |
| `npx turbo deploy:prod` | Deploy to prod environment                     |

All commands are run from the root of the repository. Any of the turbo commands can be filtered with `--filter <app>`, for example to start just `web` run `npx turbo start --filter web`

These scripts are defined in the relevant `package.json` files. We keep these scripts as simple to use as possible, so developers need to run very few commands. We also keep these scripts consistent so that they behave as expected across the repo, and we need less config overrides.

All packages should have their main content in a `src` folder, and output built files to `dist`.

#### 📥 Installing packages

To install external packages (choosing the appropriate workspace, and with the argument `--save-dev` for dev dependencies):

```
npm install some-package-name --workspace @raise/server
```

And to uninstall:

```
npm uninstall some-package-name --workspace @raise/server
```

#### 🚢 Ports

`web`:
- `8000`: the website

`server`:
- `8001`: the API
- `8002`: serverless-offline websockets
- `8003`: serverless-offline AWS Lambda API
- `8004`: serverless-dynamodb instance of DynamoDB for serverless-offline
- `8005`: serverless-dynamodb instance of DynamoDB for tests
- `8006`: serverless-offline-ses-v2 instance of ses

### 🔀 Change process

We follow the [GitHub flow model](https://docs.github.com/en/get-started/quickstart/github-flow) (aka: feature branches and pull/merge requests).

Try to make small, independent changes to make reviewing easy and minimize merge conflicts. Follow existing conventions and leave comments explaining why the code you've written exists/exists in the way it does.

To learn more about using Git, see the [VS Code source control documentation](https://code.visualstudio.com/docs/sourcecontrol/overview) or read the free [Git book](https://git-scm.com/book/en/v2).

1. Check you're up to date with the latest changes in the repository, using VS code (select master branch, then 'Synchronize Changes' button) or git commands (`git checkout master && git pull`). Make sure you've also updated dependencies by running `npm install`.
2. Create a feature branch for your work, using VS code (select branch > 'Create new branch') or git commands (`git checkout -b my-new-feature`)
3. Make your changes.
4. Check your changes work as expected, and ideally write some unit tests for them. Run `npm test` to run them.
5. Commit your changes, and push the branch. Raise a pull request and get someone to review it. If you've paired on a piece of work, still review the changes you've made but you can merge if you are both happy.
6. Merge once you and your reviewer are happy, and the CI pipeline passes.

### 📦 Concepts

- admin: Any human person that can login to the admin pages, including members of the national team and chapter volunteers.
- group: A collection of zero or more admins. The groups are generally 'National', 'NationalTech' (technical members of the national team with elevated permissions) and all the combinations of 'Raise [Chapter] [Year]'.
- fundraiser: A top-level object that represents an individual donations push. Generally corresponds to a chapter in a specific year e.g. 'Raise Demo 2021'. Has zero or more donations.
- donation: A donation by a specific donor, e.g. 'Donation from John Doe'. Associated with a fundraiser. Has zero or more payments.
- payment: A payment in relation to a specific donation e.g. 'John Doe's 3rd weekly recurring payment of £9'. Associated with a donation.
