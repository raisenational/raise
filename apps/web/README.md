# 🌐 Raise Website

Front-end code and resources for the Raise platform.

It is built with [Gatsby](https://www.gatsbyjs.com/), hosted in a [S3 bucket with CloudFront](https://aws.amazon.com/blogs/networking-and-content-delivery/amazon-s3-amazon-cloudfront-a-match-made-in-the-cloud/), and is available at [joinraise.org](https://joinraise.org).

## 📝 Making small website changes

Target audience: Raise volunteers who want to make small website content changes.

See the [Editing your chapter's website](https://docs.google.com/document/d/1zKPq93_yagaYJ8QvAEilO8ZveSKTM7FxHwx4GFy-vRg/edit) doc.

## 🧑‍💻 Advanced (for developers)

See [the main README](../../README.md) for general instructions.

### 💡 Technical details

The site is built in the TypeScript language with the React framework. We use Gatsby to bundle this into a static site that loads quickly and supports a wide range of browsers.

For the donations platform, the site communicates with [the server](../server) using Axios.

Generally we put the clever bits in the `components` and `helpers` folder. These are reused across the site, with the most obvious example of this being the templatised chapter homepages.

The pages themselves are stored in the `pages` folder, which correspond to paths off the root of the site, apart from the `admin` subfolder which uses Reach Router given its use of path parameters. This `admin` folder is the internal-facing management system for the donations platform.

The `env` folder holds configuration for deploying the site to different environments, most relevant to donations platform stuff.

There's some horrible scripts in `package.json` to build the MWA website. We copy everything to a `tmp/web-mwa` folder, replace `src` with `src/cambridge` and copy the built output back.
