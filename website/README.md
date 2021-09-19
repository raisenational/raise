# Raise website

This repository contains the resources for the Raise website. It is built with [Gatsby](https://www.gatsbyjs.com/), hosted using [GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/introduction.html), and is visibile at [joinraise.org](https://joinraise.org).

## Making changes

Most basic changes should be possible to do yourself, even if you have no idea how to code.

Only make changes to files within your own chapter's folder. If you need something changed outside this folder please ask the Raise National team.

The general pattern for edits is:
1. Open this repository and click the ['Web IDE'](https://gitlab.com/-/ide/project/joebenton/raise-website/edit/master/-/) button.
2. Find the file(s) you want to edit. This will probably be your homepage, in `src` > `pages` > your chapter > `index.tsx`. You should be able to find the relevant text (tip: use `Ctrl + F` to open a find menu) you want to change. Make edits to the file.
3. Click the blue 'Commit...' button, creating a new branch and merge request. Then give a title and short description of your changes, then click the blue 'Create merge request' button.
4. Wait for the results of the merge request pipeline (this should only take about a minute).
    - If it has failed, click the pipeline for details which will explain any errors. To go back to editing, click 'Open in Web IDE', make changes and commit. Go back to the same merge request once you're done.
    - If your it has passed, congratulations! This doesn't guarantee your changes are definitely safe but is a good sign. You can now click the 'Merge' button and your changes will be on the live site within minutes.

### Common changes

- Updating statistics (years, students, amount raised, people protected): search for `IntroStats` and change the numbers.
- Updating links: find the link you want to update based on its text content or destination. Find the related tag and change the `to` attribute.
- Hiding stuff temporarily: in `tsx` files comment out the section by beginning it with `{/*` and ending it with `*/}`, for example `{/* <div>Things here to hide</div> */}`. NB: this is still visible in the source code and is therefore not suitable for hiding sensitive information.
- Adding a FAQ: copy and paste a `FAQ` component and make changes.

### Advanced

If you're going to be making a number of edits you'll likely find it easier to work in a code editor. We currently recommend VS Code or Gitpod - we're looking into making this process as easy as possible before solidifying this documentation.

The super rough setup guide is:
- Either:
  - install [Node.js](https://nodejs.org/en/download/), clone this repository and open it with VS Code
  - open it in Gitpod
- Run `npm install` in the terminal

Once that's set up, when you want to make edits:
- Run `npm start` in the terminal
- Open the address displayed in the terminal in a browser

Get in touch with the National team if this would be something of interest.
