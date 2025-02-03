const getBrand = () => {
	if (!process.env.RAISE_BRAND || process.env.RAISE_BRAND.toUpperCase() === 'RAISE') {
		return 'Raise';
	}

	if (process.env.RAISE_BRAND === 'MWA') {
		return 'MWA';
	}

	throw new Error(`Unrecognised RAISE_BRAND value: ${process.env.RAISE_BRAND}`);
};

/** @type {import('next').NextConfig')} */
module.exports = {
	output: 'export',
	distDir: `dist/${getBrand().toLowerCase()}`,
	reactStrictMode: true,
	images: {
		unoptimized: true,
	},
	pageExtensions: ['tsx'],
	trailingSlash: true,
	transpilePackages: ['@raise/shared'],
};
