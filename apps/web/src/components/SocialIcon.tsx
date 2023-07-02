import email from '../images/email.svg';
import facebook from '../images/facebook.svg';
import instagram from '../images/instagram.svg';
import twitter from '../images/twitter.svg';

interface Props {
  icon: string,
  alt: string,
  href: string,
}

const SocialIcon: React.FC<Props> = ({ icon, alt, href }) => (
  <a href={href}>
    <img alt={alt} src={icon} width={36} />
  </a>
);

interface PropsV2 {
  type: 'email' | 'facebook' | 'instagram' | 'twitter',
  /** Email address or username */
  id: string,

  /** Override the link text. Should be used sparingly. */
  linkTextOverride?: string,
  /** Override the link destination. Should be used sparingly. */
  linkHrefOverride?: string,
}

export const SocialIconV2: React.FC<PropsV2> = ({
  type, id,
  linkTextOverride, linkHrefOverride,
}) => (
  <a href={linkHrefOverride ?? toHref[type](id)} className="block p-1 my-0.5 group transition-all hover:opacity-60" title={type}>
    <img alt={`${type} icon`} src={toIconImage[type]} width={28} className="mr-3 transition-all group-hover:scale-110" />
    {linkTextOverride ?? id}
  </a>
);

const toIconImage: Record<PropsV2['type'], string> = {
  email,
  facebook,
  instagram,
  twitter,
};

const toHref: Record<PropsV2['type'], (id: string) => string> = {
  email: (address: string) => `mailto:${address}`,
  facebook: (username: string) => `https://www.facebook.com/${username}`,
  instagram: (username: string) => `https://www.instagram.com/${username}`,
  twitter: (username: string) => `https://www.twitter.com/${username}`,
};

export default SocialIcon;
