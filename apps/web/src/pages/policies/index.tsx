import Head from 'next/head';
import Section, {SectionTitle} from '../../components/Section';
import {TopNavigation} from '../../components/Navigation';
import Footer from '../../components/Footer';
import Link from '../../components/Link';

const PoliciesPage = () => (
	<>
		<Head>
			<title>Raise: Policies</title>
			<meta property='og:title' content='Raise: Policies' />
		</Head>
		<TopNavigation />

		<Section className='text-left'>
			<SectionTitle>Raise Policies</SectionTitle>
			<ul className='list-disc ml-12 my-2'>
				<li><Link href='privacy'>Privacy</Link></li>
				<li><Link href='complaints'>Complaints</Link></li>
			</ul>
			<p>This list is not complete, as some policies are private for security purposes. For more information about how Raise operates, please contact us.</p>
		</Section>

		<Footer />
	</>
);

export default PoliciesPage;
