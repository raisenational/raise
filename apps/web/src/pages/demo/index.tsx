import Head from 'next/head';
import {convert} from '@raise/shared';
import Section, {SectionTitle} from '../../components/Section';
import Navigation from '../../components/Navigation';
import FAQs, {FAQ} from '../../components/FAQs';
import Philosophy from '../../components/Philosophy';
import {SocialIcon} from '../../components/SocialIcon';
import Panel from '../../components/Panel';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import {Doubled, MoneyBox, Party} from '../../components/Icons';
import IntroStats from '../../components/IntroStats';
import Cover, {CTADown} from '../../components/Cover';

const IndexPage = () => (
	<>
		<Head>
			<meta name='robots' content='noindex' />
			<title>Raise Demo</title>
			<meta property='og:title' content='Raise Demo' />
		</Head>

		<Cover>
			<Navigation
				left={[
					{text: 'Home', href: '/demo/'},
					{text: 'How It Works', href: '/demo/#how-it-works'},
					{text: 'FAQs', href: '/demo/#faq'},
					{text: 'Our Philosophy', href: '/demo/#our-philosophy'},
					{text: 'Contact', href: '/demo/#contact'},
				]}
				right={[{text: 'Donate', href: '/demo/donate'}]}
			/>
			<Section className='px-8'>
				<IntroStats
					title='Raise Demo'
					tagline='Raise is a charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving. Check out our national impact below.'
					statistics={{
						years: 6,
						students: 2697,
						raised: 466495,
						protected: convert.moneyToPeopleProtected('gbp', 466495_00),
					}}
				/>
				<Button variant='outline' className='mt-4 mb-12' href='/demo/donate'>
					{' '}
					Donate
					{' '}
				</Button>
			</Section>
			<CTADown text='How it works' href='#how-it-works' />
		</Cover>

		<Section id='how-it-works'>
			<SectionTitle>How it Works</SectionTitle>
			<div className='grid gap-5 md:grid-cols-3 md:gap-8'>
				<Panel
					image={<MoneyBox className='h-16 mb-4' />}
					title='Donate'
					text='We invite students to make a personally significant donation to charity. We recommend a donation of £150 to the Against Malaria Foundation, but welcome any amount that is significant to you.'
					className='bg-raise-purple'
				/>
				<Panel
					image={<Doubled className='h-16 mb-4' />}
					title='Doubled'
					text='Thanks to our matched funding, 200% of the money you donate goes directly to AMF. That means that your £150, when doubled, can help protect over 350 people from malaria!'
					className='bg-raise-red'
				/>
				<Panel
					image={<Party className='h-16 mb-4' />}
					title='Celebrate'
					text="In third term, we come together as a community to celebrate the end of the academic year and our collective impact. There's food and drink, great company and live entertainment!"
					className='bg-raise-yellow text-black'
				/>
			</div>

			<iframe
				className='w-full max-w-2xl mx-auto mt-12 rounded shadow-raise'
				title='YouTube: Raise: A Celebration of Giving'
				width='672'
				height='378'
				src='https://www.youtube-nocookie.com/embed/6bEloAzIV2c?rel=0'
				allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
				allowFullScreen
			/>
		</Section>

		<Section id='faq'>
			<SectionTitle>More Info</SectionTitle>
			<FAQs>
				<FAQ title='Sounds great, where do I sign up?'>
					<p>
						Awesome! This isn't a real chapter, but you can view our real ones
						{' '}
						<a href='/'>here</a>
						!
					</p>
				</FAQ>

				<FAQ title='How can I get involved?'>
					<p>
						We're so pleased you're interested in Raise, and look forward to
						celebrating with you!
					</p>
					<p>
						If you're interested in helping out,
						{' '}
						<a href='/demo/#contact'>get in touch</a>
						.
					</p>
				</FAQ>
			</FAQs>
			<Button
				variant='outline'
				size='large'
				className='mt-4'
				href='/demo/donate'
			>
				Donate
			</Button>
		</Section>

		<Philosophy />

		<Section id='contact'>
			<SectionTitle>Get in Touch</SectionTitle>
			<SocialIcon type='email' id='raisenational@gmail.com' />
		</Section>

		<Footer />
	</>
);

export default IndexPage;
