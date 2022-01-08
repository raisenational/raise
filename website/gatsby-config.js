require('ts-node').register()

const env = require('./src/env/env').default

module.exports = {
  siteMetadata: {
    title: "Raise",
    description: "A charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving.",
    keywords: "raise, charity, join raise, amf, against malaria foundation",
    siteUrl: "https://" + env.CUSTOM_DOMAIN + "/",
    author: {
      name: "Raise",
      url: "https://" + env.CUSTOM_DOMAIN + "/",
    },
  },
  plugins: [
    {
      resolve: "gatsby-plugin-canonical-urls",
      options: {
        siteUrl: "https://" + env.CUSTOM_DOMAIN + "/",
      },
    },
    "gatsby-plugin-typescript",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-postcss",
  ],
}
