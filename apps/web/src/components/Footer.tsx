import env from '../env/env';
import Link from './Link';
import Logo from './Logo';
import { SectionNoPadding } from './Section';

const Footer: React.FC = () => (
  <footer className="mt-12 py-8 text-left text-xl bg-raise-blue-dark">
    <SectionNoPadding>
      <div className="flex gap-4">
        <Link href={`//${env.CUSTOM_RAISE_DOMAIN}`}><Logo className="h-6" /></Link>
        <div>
          <Link href="https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/5208930" className="inline-block transition-all hover:scale-105">Raise: A Celebration of Giving is a registered charity in England and Wales (number 1202899).</Link>

          <div className="flex gap-2">
            <Link href={`//${env.CUSTOM_RAISE_DOMAIN}/chapters/`} className="inline-block transition-all hover:scale-105">Find my chapter</Link>
            ·
            <Link href={`//${env.CUSTOM_RAISE_DOMAIN}/team/`} className="inline-block transition-all hover:scale-105">Our people</Link>
            ·
            <Link href={`//${env.CUSTOM_RAISE_DOMAIN}/policies/`} className="inline-block transition-all hover:scale-105">Our policies</Link>
          </div>
        </div>
      </div>
    </SectionNoPadding>
  </footer>
);

export default Footer;
