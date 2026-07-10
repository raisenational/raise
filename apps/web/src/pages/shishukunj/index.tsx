import Head from 'next/head';
import {convert} from '@raise/shared';
import Section, {SectionTitle} from '../../components/Section';
import Navigation from '../../components/Navigation';
import Cover, {CTADown} from '../../components/Cover';
import IntroStats from '../../components/IntroStats';
import FAQs, {FAQ} from '../../components/FAQs';
import Philosophy from '../../components/Philosophy';
import {SocialIcon} from '../../components/SocialIcon';

import Panel from '../../components/Panel';

import {Doubled, MoneyBox, Party} from '../../components/Icons';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import config from './_config';

const IndexPage = () => (
	<>
		<Head>
			<title>{config.title}</title>
			<meta property='og:title' content={config.title} />
		</Head>
		<Cover>
			<Navigation
				left={[
					{text: 'Home', href: '/'},
					{text: 'How It Works', href: '#how-it-works'},
					{text: 'FAQs', href: '#faq'},
					{text: 'Our Philosophy', href: '#our-philosophy'},
					{text: 'Contact', href: '#contact'},
				]}
				right={[
					// { text: 'Donate', href: 'donate/' },
				]}
			/>
			<Section className='px-8'>
				<IntroStats
					title={config.title}
					tagline='Raise is a charitable movement encouraging people to adopt a positive approach towards deliberate, effective giving. In partnership with Shishukunj, and inspired by the value of sewa, we invite you to celebrate giving. Check out our national impact below.'
					statistics={{
						years: 9,
						students: 3576,
						raised: 580068,
						protected: convert.moneyToPeopleProtected('gbp', 580068_16),
					}}
				/>
				<Button variant='outline' size='large' className='mt-4 mb-12' href='donate/'>Donate</Button>
			</Section>
			<CTADown text='How it works' href='#how-it-works' />
		</Cover>

		<Section id='how-it-works' className='mt-0'>
			<SectionTitle>How it Works</SectionTitle>
			<div className='grid gap-5 md:grid-cols-3 md:gap-8'>
				<Panel
					image={<MoneyBox className='h-16 mb-4' />}
					title='Donate'
					text='We invite you to make a personally significant donation to charity. We recommend a donation of £75 to the Against Malaria Foundation, but welcome any amount that is significant to you.'
					className='bg-raise-purple'
				/>
				<Panel
					image={<Doubled className='h-16 mb-4' />}
					title='Doubled'
					text='Thanks to our matched funding, 200% of the money you donate goes directly to AMF. That means that your £75, when doubled, can help protect over 170 people from malaria!'
					className='bg-raise-red'
				/>
				<Panel
					image={<Party className='h-16 mb-4' />}
					title='Celebrate'
					text='At the end of the donations push, we come together as a community to celebrate our collective impact, bringing the "feel good" together with the "do good". There is food, drink and great company as we mark what we have achieved together.'
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
				<FAQ title='How can I get involved?'>
					<p>
						We're so pleased you're interested in Raise, and look forward to
						celebrating with you! One of the most valuable things you can do is
						spread the word: letting your friends and family know about Raise
						helps grow the movement, and celebrating is more fun when we do it
						together. Why not show them this website and invite them to join us?
					</p>
					<p>
						If you'd like to get more involved in organising or championing Raise
						within Shishukunj, please
						{' '}
						<a href='./#contact'>get in touch</a>
						{' '}
						— we're always keen to hear from people who want to help.
					</p>
				</FAQ>

				<FAQ title="£75 is a lot of money - what if I can't donate that?">
					<p>
						We recognise that £75 is a large amount of money for many people, and
						we have thought carefully about recommending this amount (see next
						question). It is important to us that everyone feels able to join us
						in celebrating through giving.
					</p>
					<p>
						As such, while we recommend £75, you're encouraged to join Raise by
						making a donation of any size which is significant to you. It is
						central to
						{' '}
						<a href='./#our-philosophy'>our philosophy</a>
						{' '}
						that you actively
						engage with your decision to celebrate through giving, but we
						recognise that the donation that enables this will not be the same
						for everyone.
					</p>
					<p>
						In addition, you have the option of donating in weekly installments,
						as some have found this more manageable. A weekly donation over the
						course of the month adds up to the same total, which will still be
						matched through our matched funding.
					</p>
					<p>
						Note: We have ensured that our donations page allows you to hide your
						name and/or donation amount, should you choose.
					</p>
				</FAQ>

				<FAQ title='Why do you recommend £75?'>
					<p>
						We recognise that £75 is a large amount of money, and substantially
						more than most people would routinely donate to charity (indeed, that
						is part of the point!). There are a couple of key reasons we recommend
						this figure:
					</p>
					<p>
						<b>Encouraging considered giving:</b>
						{' '}
						Raise is all about changing the
						way we think about charity, and we can only achieve this if people
						engage consciously with the act of donating. By inviting you to give
						an amount that's personally significant to you, we hope you'll stop
						and think meaningfully about your decision to donate, and in turn take
						this positive, deliberate approach towards giving forward into your
						future life. This is why we recommend £75, or a donation of any size
						significant to you.
					</p>
					<p>
						<b>Impact:</b>
						{' '}
						Crucially, the recommended amount, coupled with matched
						funding, allows us to have an exceptionally large impact; your £75
						donation, when doubled, can help protect over 170 people from malaria.
					</p>
				</FAQ>

				<FAQ title='Can I donate to a different charity?'>
					<p>
						At Raise, we think very carefully about which charity to recommend
						(see below), particularly given how much money you're donating.
						However, we recognise that you may want to join us in celebrating
						through giving, but would prefer to donate to a different charity.
						This is absolutely fine, but please get in touch with us beforehand so
						that we are aware.
					</p>
					<p>
						Note: All matched funding will still go to the Against Malaria
						Foundation.
					</p>
				</FAQ>

				<FAQ title='Why do you recommend donating to AMF?'>
					<p>
						At Raise, we think very carefully about which charity to recommend.
						When people are making such significant donations, we want to make
						sure the money is doing as much good as it possibly can. To make our
						decision, we have taken the advice of independent charity evaluators
						{' '}
						<a href='https://www.givewell.org/charities/top-charities'>
							GiveWell
						</a>
						{' '}
						and
						{' '}
						<a href='https://www.givingwhatwecan.org'>Giving What We Can</a>
						, which both rank AMF as one of the most effective charities in the
						world.
					</p>
					<p>
						Tragically, malaria causes hundreds of thousands of preventable deaths
						every year, disproportionately affecting young children and pregnant
						women, and has a knock-on effect on the local economy. AMF works with
						local partners to provide life-saving bed-nets which protect people as
						they sleep. To find out more about their work, see
						{' '}
						<a href='https://www.againstmalaria.com/'>AMF's website</a>
						.
					</p>
					<p>
						Because AMF's intervention is so effective at preventing malaria, each
						donation can have a huge impact. For example, a donation of £75,
						doubled through matched funding, can help protect over 170 people.
					</p>
				</FAQ>

				<FAQ title='How does this fit into sewa?'>
					<p>
						Raise's philosophy of positive, deliberate and effective giving sits
						naturally alongside Shishukunj's values of citizenship and sewa. By
						stopping to consider why we give and the impact our donation will
						have, giving becomes more meaningful, enjoyable and sustainable — and
						ultimately more impactful. We hope this initiative helps make
						charitable giving an actively embraced and enjoyable part of life
						going forwards.
					</p>
				</FAQ>
			</FAQs>
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
