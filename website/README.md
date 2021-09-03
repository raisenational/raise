# Raise website

This repository contains the resources for the Raise website. It is hosted using [GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/introduction.html), and is visibile at [joinraise.org](https://joinraise.org). All files in this repository are public so please be careful uploading any files even if they aren't referenced on the main pages.

## Making changes

Most basic changes should be possible to do yourself, even if you have no idea how to code.

Only make changes to files within your own chapter's folder. If you need something changed outside this folder please ask the Raise National team.

The general pattern for edits is:
1. Open this repository and click the ['Web IDE'](https://gitlab.com/-/ide/project/joebenton/raise-website/edit/master/-/) button.
2. Find the file(s) you want to edit. `index.html` in your chapter's folder is your homepage. You should be able to find the relevant text (tip: use `Ctrl + F` to open a find menu) you want to change there. Make edits to the file.
3. Click the blue 'Commit...' button, creating a new branch and merge request. Then give a title and short description of your changes, then click the blue 'Create merge request' button.
4. Wait for the results of the merge request pipeline (this should only take about a minute).  
If it has failed, click the pipeline for details. You have probably made an error in your HTML, such as having unbalanced tags. To go back to editing, click 'Open in Web IDE', make changes and commit. Go back to the same merge request once you're done.  
If your it has passed, congratulations! This doesn't guarantee they're definitely safe but is a good sign.  
5. You should now be able to preview the changes by clicking the 'View app' button.  
If anything looks wrong, go back and make fixes. To go back to editing, click 'Open in Web IDE', make changes and commit. Go back to the same merge request once you're done.  
If everything looks right, click the 'Merge' button. Your changes will be on the live site within minutes.

### Common changes

- Updating statistics (years, students, amount raised, people protected): search for `stats-bar` and change the numbers in the HTML.
- Updating links: find the link you want to update based on its text content. Find the `<a>` tag it is surrounded by and change the `href` attribute.
- Hiding stuff temporarily: comment out the section by beginning it with `<!--` and ending it with `-->`, for example `<!-- <div>Things here to hide</div> -->`. NB: this is still visible publicly and is therefore not suitable for hiding sensitive information.
- Adding a FAQ: copy and paste a title and content section and make changes to the content.

### Advanced

If you're going to be making a number of edits you'll likely find it easier to work in a code editor. We currently recommend VS Code or Gitpod - we're looking into making this process as easy as possible before solidifying this documentation.

Get in touch with the National team if this would be something of interest.
