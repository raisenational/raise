import {
	Html, Head, Main, NextScript,
} from 'next/document';
import classNames from 'clsx';
import env from '../env/env';
import {execSync} from 'child_process';
import {type Brand} from '../helpers/types';

const getBrand = (): Brand => {
	if (!process.env.RAISE_BRAND || process.env.RAISE_BRAND.toUpperCase() === 'RAISE') {
		return 'Raise';
	}

	if (process.env.RAISE_BRAND === 'MWA') {
		return 'MWA';
	}

	throw new Error(`Unrecognised RAISE_BRAND value: ${process.env.RAISE_BRAND}`);
};

const getVersion = () => {
	const hash = execSync('git rev-parse --short HEAD', {encoding: 'utf-8'});
	return `${(new Date()).toISOString().replace(/-/g, '').replace(/\..*/, '')
		.replace(/:/g, '')
		.replace('T', '.')}.${hash.trim()}`;
};

const Document: React.FC = () => {
	const brand = getBrand();

	return (
		<Html lang='en'>
			<Head>
				{env.STAGE !== 'prod' && <meta name='robots' content='noindex' />}
				<link rel='apple-touch-icon' sizes='180x180' href={'/shared/favicon/apple-touch-icon.png'} />
				<link rel='icon' type='image/png' sizes='32x32' href={'/shared/favicon/favicon-32x32.png'} />
				<link rel='icon' type='image/png' sizes='16x16' href={'/shared/favicon/favicon-16x16.png'} />
				<link rel='manifest' href={'/shared/favicon/site.webmanifest'} />
				<link rel='mask-icon' href={'/shared/favicon/safari-pinned-tab.svg'} color='#2ecad6' />
				<link rel='shortcut icon' href={'/shared/favicon/favicon.ico'} />
				<meta name='msapplication-TileColor' content='#da532c' />
				<meta name='msapplication-config' content={'/shared/favicon/browserconfig.xml'} />
				<meta name='theme-color' content='#ffffff' />
				<meta property='raise-version' content={getVersion()} />
				<meta property='og:description' content={`${brand} is a charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving.`} />
				{brand === 'MWA' && <meta property='og:image' content={'/shared/images/mwa-link-icon.png'} />}
				{brand === 'Raise' && <meta property='og:image' content={'/shared/images/raise-link-icon.png'} />}
				{brand === 'MWA' && <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon={`{"token": "${env.CLOUDFLARE_WEB_ANALYTICS_TOKEN_MWA}"}`} />}
				{brand === 'Raise' && <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon={`{"token": "${env.CLOUDFLARE_WEB_ANALYTICS_TOKEN_RAISE}"}`} />}
			</Head>
			<body>
				<main className={classNames('bg-raise-blue min-h-screen text-white font-raise-content text-2xl font-normal text-center overflow-auto')}>
					<Main />
				</main>
				<NextScript />
			</body>
		</Html>
	);
};

export default Document;
