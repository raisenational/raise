import Head from 'next/head';
import {UserGroupIcon} from '@heroicons/react/outline';
import {convert} from '@raise/shared';
import Section, {SectionTitle} from '../../components/Section';
import Navigation from '../../components/Navigation';
import Cover, {CTADown} from '../../components/Cover';
import IntroStats from '../../components/IntroStats';
import FAQs, {FAQ} from '../../components/FAQs';
import Philosophy from '../../components/Philosophy';
import {SocialIcon} from '../../components/SocialIcon';
import Panel from '../../components/Panel';
import Button from '../../components/Button';
import {MoneyBox, Party} from '../../components/Icons';
import Footer from '../../components/Footer';
import Link from '../../components/Link';
import config from './_config';

const IndexPage = () => (
	<>
		<Head>
			<title>{config.title}</title>
		</Head>
		<Cover>
			<Navigation
				left={[
					{text: 'Home', href: '.'},
					{text: 'How It Works', href: '#how-it-works'},
					{text: 'FAQs', href: '#faq'},
					{text: 'Our Philosophy', href: '#our-philosophy'},
					{text: 'Contact', href: '#contact'},
				]}
				right={[
					{text: 'Donate', href: 'donate/'},
				]}
			/>
			<Section className='px-8'>
				<IntroStats
					title={config.title}
					tagline={'A charitable movement encouraging people to adopt a positive approach towards deliberate, effective giving. Check out our national impact below.'}
					statistics={{
						years: 6,
						students: 2697,
						raised: 466495,
						protected: convert.moneyToPeopleProtected('gbp', 466495_00),
					}}
				/>
				<div className='mt-4 mb-12 flex flex-wrap gap-2 justify-center'>
					<Button variant='outline' size='large' href='donate/'>Donate</Button>
				</div>
			</Section>
			<CTADown
				text='How it works'
				href='#how-it-works'
			/>
		</Cover>

		<Section id='how-it-works' className='mt-0'>
			<SectionTitle>How it Works</SectionTitle>
			<div className='grid gap-5 md:grid-cols-3 md:gap-8'>
				<Panel
					image={<MoneyBox className='h-16 mb-4' />}
					title='Donate'
					text='We invite you to make a personally significant donation to charity as a way of celebrating giving. We welcome any amount that is significant to you.'
					className='bg-raise-purple'
				/>
				<Panel
					image={<Party className='h-16 mb-4' />}
					title='Celebrate'
					text="At the end of the donations period, we'll come together as a community to celebrate our collective impact with a workplace social, bringing together the “feel good” with the “do good”."
					className='bg-raise-red'
				/>
				<Panel
					image={<UserGroupIcon className='h-16 mb-4' />}
					title='Connect'
					text="We'll bring the Raise community at your workplace together through both virtual and in-person events, continuing with our ultimate goal of making charity something that is actively embraced and enjoyed, and a meaningful part of all of our lives."
					className='bg-raise-yellow text-black'
				/>
			</div>

			<iframe className='w-full max-w-2xl mx-auto mt-12 rounded shadow-raise' title='YouTube: Raise: A Celebration of Giving' width='672' height='378' src='https://www.youtube-nocookie.com/embed/6bEloAzIV2c?rel=0' allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture' allowFullScreen />
		</Section>

		<Section id='faq'>
			<SectionTitle>More Info</SectionTitle>
			<FAQs>
				<FAQ title='How did you choose your charity recommendations?'>
					<p>
						To decide which charities to recommend, we reviewed the research of independent charity evaluators
						{' '}
						<Link href='https://www.givewell.org/charities/top-charities'>GiveWell</Link>
						,
						{' '}
						<Link href='https://www.givingwhatwecan.org'>Giving What We Can</Link>
						, and
						{' '}
						<Link href='https://founderspledge.com/'>Founders Pledge</Link>
						, as well as explored other literature discussing effective charities.
					</p>
					<p>
						We've also considered feedback from donors from previous years, as well as considered which charities best fit with our philosophy of positive, deliberate, and effective giving.
					</p>
					<p>
						We've intentionally tried to support a wide range of cause areas, so that you can find one that you connect with. However, you're also welcome to donate to another charity (see below).
					</p>
				</FAQ>

				<FAQ title='For the donations push, can I donate to a different charity?'>
					<p>
						At Raise, we think very carefully about which charities to recommend, particularly given how much money you're donating. However, we recognise that you might want to join us in celebrating through giving to a different charity. This is absolutely fine, but please
						{' '}
						<Link href='#contact'>get in touch</Link>
						{' '}
						with us beforehand so that we are aware.
					</p>
				</FAQ>
			</FAQs>
			<Button variant='outline' className='mt-4' href='https://www.facebook.com/groups/966154864287768'>Join Facebook group</Button>
		</Section>

		<Philosophy />

		<Section id='contact'>
			<SectionTitle>Get in Touch</SectionTitle>
			<div className='inline-block text-left'>
				<SocialIcon type='email' id='raisenational@gmail.com' />
			</div>
		</Section>

		<Footer />
	</>
);

export default IndexPage;
