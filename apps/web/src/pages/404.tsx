import Head from 'next/head';
import Section from '../components/Section';
import Logo from '../components/Logo';
import Button from '../components/Button';

const NotFoundPage: React.FC = () => (
	<>
		<Head>
			<meta name='robots' content='noindex' />
			<title>Raise: Page not found</title>
			<meta property='og:title' content='Raise: Page not found' />
		</Head>
		<Section>
			<Logo className='my-8 w-24' />
			<h1 className='text-5xl sm:text-6xl font-raise-header font-black mb-8'>Raise: Page not found</h1>
			<p>We couldn't find the page you requested.</p>
			<Button href='/' variant='red' className='inline-block mt-4'>View homepage</Button>
		</Section>
	</>
);

export default NotFoundPage;
