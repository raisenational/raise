import Helmet from 'react-helmet';
import classNames from 'classnames';
import { withAssetPrefix, useStaticQuery, graphql } from 'gatsby';
import env from '../env/env';
import { Brand } from '../helpers/types';

const Page: React.FC<React.PropsWithChildren<{ className?: string, brand?: Brand }>> = ({ children, className, brand = 'Raise' }) => {
  // See gatsby-config.ts
  const { site } = useStaticQuery(graphql`query { site { siteMetadata { version, cloudflareWebAnalyticsToken } } }`);

  return (
    <>
      <Helmet htmlAttributes={{ lang: 'en' }}>
        {env.STAGE !== 'prod' && <meta name="robots" content="noindex" />}
        <link rel="apple-touch-icon" sizes="180x180" href={withAssetPrefix('/shared/favicon/apple-touch-icon.png')} />
        <link rel="icon" type="image/png" sizes="32x32" href={withAssetPrefix('/shared/favicon/favicon-32x32.png')} />
        <link rel="icon" type="image/png" sizes="16x16" href={withAssetPrefix('/shared/favicon/favicon-16x16.png')} />
        <link rel="manifest" href={withAssetPrefix('/shared/favicon/site.webmanifest')} />
        <link rel="mask-icon" href={withAssetPrefix('/shared/favicon/safari-pinned-tab.svg')} color="#2ecad6" />
        <link rel="shortcut icon" href={withAssetPrefix('/shared/favicon/favicon.ico')} />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="msapplication-config" content={withAssetPrefix('/shared/favicon/browserconfig.xml')} />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:image" content={brand === 'MWA' ? withAssetPrefix('/shared/images/mwa-link-icon.png') : withAssetPrefix('/shared/images/raise-link-icon.png')} />
        <meta property="og:description" content={brand === 'MWA' ? 'MWA is a charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving.' : 'Raise is a charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving.'} />
        <meta property="raise-version" content={site.siteMetadata.version} />
        {site.siteMetadata.cloudflareWebAnalyticsToken && <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={`{"token": "${site.siteMetadata.cloudflareWebAnalyticsToken}"}`} />}
      </Helmet>
      <div className={classNames('bg-raise-blue min-h-screen text-white font-raise-content text-2xl font-normal text-center overflow-auto', className)}>
        {children}
      </div>
    </>
  );
};

export default Page;
