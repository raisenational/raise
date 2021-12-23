# 🌐 Raise Website

Front-end code and resources for the Raise platform.

It is built with [Gatsby](https://www.gatsbyjs.com/), hosted in a [S3 bucket with CloudFront](https://aws.amazon.com/blogs/networking-and-content-delivery/amazon-s3-amazon-cloudfront-a-match-made-in-the-cloud/), and is available at [joinraise.org](https://joinraise.org).

## Making changes

Most basic changes should be possible to do yourself, even if you have no idea how to code.

Only make changes to files within your own chapter's folder. If you need something changed outside this folder please ask the Raise National team.

The general pattern for edits is:
1. Find the file you want to edit. This will probably be your homepage, in `src` > `pages` > your chapter > `index.tsx`. You should be able to find the relevant text (tip: use `Ctrl + F` to open a find menu) you want to change.
2. Click the 'Edit this file' button (the pencil icon) and make your changes in the text editor.
3. Click the green 'Propose changes' button, creating a new branch and merge request. Give a title and short description of your changes, then click the green 'Create pull request' button.
4. Wait for the results of the automated checks (this should take about a minute).
    - If they have failed, click to view the details of any errors. To go back to editing, click the 'Files changed' tab, then the three dots on the file you want to edit then 'Edit file'.
    - If they have passed, congratulations! This doesn't guarantee your changes are definitely safe but is a good sign. You can now click the green 'Squash and merge' button and your changes will be on the live site within minutes.

### Common changes

- Updating statistics (years, students, amount raised, people protected): search for `IntroStats` and change the numbers.
- Updating links: find the link you want to update based on its text content or destination. Find the related tag and change the `to` attribute.
- Hiding stuff temporarily: in `tsx` files comment out the section by beginning it with `{/*` and ending it with `*/}`, for example `{/* <div>Things here to hide</div> */}`. NB: this may still be visible in the source code and is therefore not suitable for hiding sensitive information.
- Adding a FAQ: copy and paste a `FAQ` component and make changes.

### Advanced

If you're going to be making a number of edits you'll likely find it easier to work in a code editor. We currently recommend VS Code.

The super rough setup guide is:
- install [Node.js](https://nodejs.org/en/download/)
- clone this repository and open it with VS Code
- run `npm install` in the terminal

Once that's set up, when you want to make edits:
- Run `npm start` in the terminal
- Open the address displayed in the terminal in a browser

Alternatively, you should be able to just open this repository [with Gitpod](https://gitpod.io/#https://github.com/raisenational/raise) by logging in with GitHub and this will do the steps above for you.

If you'd like more guidance or training on how everything works, get in touch with the National team - we'd love to enable people to make their own edits to all parts of the code as long as there are the appropriate measures to keep everything working as it should :)

#### Technical details

The site is built in the TypeScript language with the React framework. We use Gatsby to bundle this into a static site that loads quickly and supports a wide range of browsers.

For the donations platform, the site communicates with [the server](../server) using Axios.

Generally we put the clever bits in the `components` and `helpers` folder. These are reused across the site, with the most obvious example of this being the templatised chapter homepages.

The pages themselves are stored in the `pages` folder, which correspond to paths off the root of the site, apart from the `admin` subfolder which uses Reach Router given its use of path parameters. This `admin` folder is the internal-facing management system for the donations platform.

The `env` folder holds configuration for deploying the site to different environments, most relevant to donations platform stuff.
