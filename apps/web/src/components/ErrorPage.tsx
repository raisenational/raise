import { RouteComponentProps } from '@gatsbyjs/reach-router';
import Page from './Page';
import Section from './Section';
import Logo from './Logo';
import Button from './Button';

interface Props {
  href?: string,
  notFound: string,
}

const ErrorPage: React.FC<RouteComponentProps & Props> = ({ notFound, href }) => (
  <Page>
    <Section>
      <Logo className="my-8 w-24" />
      <h1 className="text-5xl sm:text-6xl font-raise-header font-black mb-8">Raise: {notFound} not found</h1>
      <p>We couldn't find the {notFound} you requested.</p>
      {href ? <Button href={href} variant="red" className="inline-block mt-4">Return</Button> : <> </>}
    </Section>
  </Page>
);

export default ErrorPage;
