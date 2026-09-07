import Head from 'next/head';
import Section, {SectionTitle} from '../components/Section';
import {TopNavigation} from '../components/Navigation';
import Footer from '../components/Footer';
import Quote from '../components/Quote';

const NATIONAL_TEAM = [
	{
		name: 'Aarushi Malik',
		role: 'Director',
		img: '/shared/images/aarushi.jpg',
		bio: 'Aarushi will be acting as Director for Raise this year whilst being a 5th year medical student at Cambridge. She was co-president of MWA in 2024-25 and was on the Advisory Board of the national team last year, and would love to concentrate on expanding Raise to more universities and getting our name out there! In her spare time, Aarushi enjoys playing any racket sport, eating her housemate\'s cooking and watching House MD as a form of revision.',
	},
	{
		name: 'Eesha Surisetty',
		role: 'Internal Community Leader',
		img: '/shared/images/eesha.jpg',
		bio: 'Eesha studies Medicine at Cambridge, and has been a part of the MWA committee for two years, recently leading fundraising as vice-president. This year, she looks forward to establishing novel schemes to maximise donations, in addition to training new mentors and chapter presidents. Through her role, she hopes to magnify the reach of the charity, and ensure the future growth of Raise.',
	},
	{
		name: 'Cathryn Lewis',
		role: 'External Community Lead',
		img: '/shared/images/cathryn.jpg',
		bio: 'Cathryn recently graduated from Cambridge, where she studied French and Italian. She first got involved with Raise in her first year, but only joined the committee in her final year as Vice President of Events. Having enjoyed her time on the committee, she looks forward to expanding Raise as she begins her teacher training in Oxford.',
	},
	{
		name: 'Vienna Kwan',
		role: 'Advisory Board Chair',
		img: '/shared/images/vienna.jpg',
		bio: 'Vienna began as Vice President for the Cambridge chapter, and was then its Co-President along with Emike Enaife in her final year. She is now based in New York, and being a part of Raise really solidified what she wanted to do with her career! This year she chairs the Advisory Board.',
	},
	{
		name: 'Talia Ozluk',
		role: 'Advisory Board member',
		img: '/shared/images/talia.jpg',
		bio: 'Talia is a Psychology graduate from UCL and is an Advisory Board member. She was the Co-President of Raise UCL two years ago and the Community Lead last year. She is looking forward to continuing her involvement with Raise and improving the impact we can have.',
	},
	{
		name: 'Elizabeth Chew',
		role: 'Advisory Board member',
		img: '/shared/images/elizabeth.jpg',
		bio: 'Elizabeth is a 4th year medical student at the University of Cambridge, and was previously an events officer in MWA. She is passionate about sustainable and deliberate charity, and will be joining the Advisory Board to pitch ideas to chapters with the goal of increasing long term engagement and fundraising. In her free time she likes to go for workout classes, bake, and watch shows!',
	},
	{
		name: 'Hania Rashed',
		role: 'Advisory Board member',
		img: '/shared/images/hania.jpg',
		bio: 'Hania is a fourth year medical student at Cambridge, and was Sponsorship Officer for MWA in 2025/26. She will be joining Raise as a member of the Advisory Board this year, and is very excited to be involved in such a meaningful cause! In her spare time, Hania loves taking photos, going on walks (to take more photos), and reading!',
	},
	{
		name: 'Harry Reeves',
		role: 'Advisory Board member',
		img: '/shared/images/harry.jpg',
		bio: 'Harry is a recent graduate in Materials Science at Cambridge, and was co-Vice President for Publicity for 25/26. He will be joining the Advisory Board to work on exciting projects to make fundraising effective across Raise chapters. Outside of Raise, Harry enjoys watching all the Coen Brothers\' films back-to-back, learning French, and road trips.',
	},
	{
		name: 'Pavmiga Perinparajah',
		role: 'Advisory Board member',
		img: '/shared/images/pavmiga.jpg',
		bio: 'Pavmiga is a current medical student at the University of Cambridge. She was Vice President responsible for sponsorships for MWA during the 2026 donation push. Her hobbies include dance and sewing. She is incredibly excited to be on the Advisory Board this year and help make a positive impact!',
	},
	{
		name: 'Bill Chen',
		role: 'Finance Director',
		img: '/shared/images/bill.jpg',
		bio: 'Bill has been involved in Raise since he led the Oxford chapter to their all-time high of £19,000 in donations back in 2023. Since then, Bill has held operationally heavy and finance strategy roles on Raise\'s national team. You can find him at https://billchen.online.',
	},
	{
		name: 'Adam Jones',
		role: 'Technology & governance',
		bio: 'Adam is responsible for technology at Raise. He maintains the website and our open-source donations platform. He also manages our relationship with the Charity Commission, and serves as a trustee on our board.\n\nIn his day job, he is a member of technical staff at Anthropic, working to ensure the responsible development of advanced AI systems. Outside work, he enjoys cycling around London, contributing to open-source projects and playing board games.',
		img: '/shared/images/adam.jpg',
	},
];

const TeamPage = () => (
	<>
		<Head>
			<title>Raise: The Team</title>
			<meta property='og:title' content='Raise: The Team' />
		</Head>
		<TopNavigation />

		<Section className='text-left'>
			<SectionTitle>The Team</SectionTitle>

			<div className='space-y-4'>
				<p>Raise educates students about charitable giving, aiming to encourage effective and deliberate giving. It’s run by unpaid volunteers and does not make a profit.</p>
				<p>We call each local Raise group a chapter. These tend to be based at universities, where they may be societies. Each chapter is run by a team of student volunteers, recruited annually.</p>
				<p>These chapters are supported by a central, national team. The national team recruits, mentors, and coordinates the chapters, sets the strategic direction for what Raise does, and provides support services like the website.</p>
				<p>The national team is supported by an advisory board, a group of current and former students who have been closely involved with Raise in the past. They provide strategic support and work on exciting new projects such as the Raise blog.</p>
			</div>

			<p className='font-black font-raise-header mt-8 mb-2'>Chapter Teams</p>
			<p>Find out more about our chapter teams on their respective pages.</p>

			<p className='font-black font-raise-header mt-8 mb-2'>National Team</p>
			<p>
				There are
				{' '}
				{NATIONAL_TEAM.length}
				{' '}
				of us on the national team. We're students and recent grads who volunteer to support chapters as best we can:
			</p>
			{NATIONAL_TEAM.map((m, i) => (

				<Quote key={i} by={`${m.name}, ${m.role}`} headshotSrc={m.img} imagePlacement={i % 4 <= 1 ? 'left' : 'right'} className='mt-4 p-8 bg-raise-red rounded-lg min-h-[10rem] whitespace-pre-line'>
					{m.bio}
				</Quote>
			))}
			<p className='mt-4'>You can contact the national team via email at raisenational@gmail.com.</p>

			<p className='font-black font-raise-header mt-8 mb-2'>Advisory Board</p>
			<p>The advisory board is group of Raise alumni, most of whom have previously served on chapter teams.</p>
		</Section>

		<Footer />
	</>
);

export default TeamPage;
