module.exports = {
  siteMetadata: {
    title: "Raise",
    description: "A starter kit for TypeScript-based Gatsby projects with sensible defaults.",
    keywords: "raise, charity, join raise, amf, against malaria foundation",
    siteUrl: "https://joinraise.org/",
    author: {
      name: "Raise",
      url: "https://joinraise.org/",
    },
  },
  plugins: [
    "gatsby-transformer-json",
    {
      resolve: "gatsby-plugin-canonical-urls",
      options: {
        siteUrl: "https://joinraise.org/",
      },
    },
    "gatsby-plugin-typescript",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-postcss",
  ],
}
