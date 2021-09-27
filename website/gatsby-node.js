/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

exports.onCreatePage = async ({ page, actions }) => {
  const { deletePage } = actions

  if (page.path === "/admin/") {
    page.matchPath = "/admin/*"
  } else if (page.path.startsWith("/admin/")) {
    deletePage(page)
  }
}
