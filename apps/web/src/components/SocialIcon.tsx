type SocialIconProps = {
	type: 'email' | 'facebook' | 'instagram' | 'twitter' | 'tiktok';
	/** Email address or username */
	id: string;

	/** Override the link text. Should be used sparingly. */
	linkTextOverride?: string;
	/** Override the link destination. Should be used sparingly. */
	linkHrefOverride?: string;
};

export const SocialIcon: React.FC<SocialIconProps> = ({
	type, id,
	linkTextOverride, linkHrefOverride,
}) => (
	<a href={linkHrefOverride ?? toHref[type](id)} className='block p-1 my-0.5 group transition-all hover:opacity-60' title={type}>
		<img alt={`${type} icon`} src={toIconImage[type]} width={28} className='mr-3 transition-all group-hover:scale-110' />
		{linkTextOverride ?? id}
	</a>
);

const toIconImage: Record<SocialIconProps['type'], string> = {
	email: '/shared/images/email.svg',
	facebook: '/shared/images/facebook.svg',
	instagram: '/shared/images/instagram.svg',
	twitter: '/shared/images/twitter.svg',
	tiktok: '/shared/images/tiktok.svg',
};

const toHref: Record<SocialIconProps['type'], (id: string) => string> = {
	email: (address: string) => `mailto:${address}`,
	facebook: (username: string) => `https://www.facebook.com/${username}`,
	instagram: (username: string) => `https://www.instagram.com/${username}`,
	twitter: (username: string) => `https://www.twitter.com/${username}`,
	tiktok: (username: string) => `https://www.tiktok.com/@${username}`,
};
