import * as React from "react"
import Helmet from "react-helmet"
import classNames from "classnames"
import { withAssetPrefix } from "gatsby"

const Page: React.FC<{ className?: string }> = ({ children, className }) => (
  <>
    <Helmet>
      <link rel="apple-touch-icon" sizes="57x57" href={withAssetPrefix("/shared/favicon/apple-icon-57x57.png")} />
      <link rel="apple-touch-icon" sizes="60x60" href={withAssetPrefix("/shared/favicon/apple-icon-60x60.png")} />
      <link rel="apple-touch-icon" sizes="72x72" href={withAssetPrefix("/shared/favicon/apple-icon-72x72.png")} />
      <link rel="apple-touch-icon" sizes="76x76" href={withAssetPrefix("/shared/favicon/apple-icon-76x76.png")} />
      <link rel="apple-touch-icon" sizes="114x114" href={withAssetPrefix("/shared/favicon/apple-icon-114x114.png")} />
      <link rel="apple-touch-icon" sizes="120x120" href={withAssetPrefix("/shared/favicon/apple-icon-120x120.png")} />
      <link rel="apple-touch-icon" sizes="144x144" href={withAssetPrefix("/shared/favicon/apple-icon-144x144.png")} />
      <link rel="apple-touch-icon" sizes="152x152" href={withAssetPrefix("/shared/favicon/apple-icon-152x152.png")} />
      <link rel="apple-touch-icon" sizes="180x180" href={withAssetPrefix("/shared/favicon/apple-icon-180x180.png")} />
      <link rel="icon" type="image/png" sizes="192x192" href={withAssetPrefix("/shared/favicon/android-icon-192x192.png")} />
      <link rel="icon" type="image/png" sizes="32x32" href={withAssetPrefix("/shared/favicon/favicon-32x32.png")} />
      <link rel="icon" type="image/png" sizes="96x96" href={withAssetPrefix("/shared/favicon/favicon-96x96.png")} />
      <link rel="icon" type="image/png" sizes="16x16" href={withAssetPrefix("/shared/favicon/favicon-16x16.png")} />
      <link rel="manifest" href={withAssetPrefix("/shared/favicon/manifest.json")} />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="msapplication-TileImage" content={withAssetPrefix("/shared/favicon/ms-icon-144x144.png")} />
      <meta name="theme-color" content="#ffffff" />
      <meta property="og:image" content={withAssetPrefix("/shared/images/raise-link-icon.png")} />
      <meta property="og:description" content="Raise is a charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving." />
    </Helmet>
    <div className={classNames("bg-raise-blue min-h-screen text-white font-raise-content text-2xl font-normal text-center overflow-auto", className)}>
      {children}
    </div>
  </>
)

export default Page
