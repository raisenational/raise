import Head from 'next/head';
import Section, {SectionTitle} from '../components/Section';
import {TopNavigation} from '../components/Navigation';
import Footer from '../components/Footer';
import Quote from '../components/Quote';

const NATIONAL_TEAM = [
	{
		name: 'Ella Denton',
		role: 'Director',
		img: '/shared/images/ella.jpg',
		bio: 'Ella will be directing this year\'s National Team while pursuing a part-time Master\'s in Public History at UCL. She founded Raise UCL, London\'s first Raise chapter, in 2022, moving on to the role of Community Lead and mentor last year. This makes her position as Director all the more exciting; she is thrilled to be taking Raise forward, prioritising Rep engagement and ensuring that the Raise delivers advice that is applicable to chapters at all different kinds of university, from collegiate to large cities.\n\nIn her spare time, Ella writes films, works as a nanny and improves her near-terrifying level of sitcom knowledge.',
	},
	{
		name: 'Maxime Alves',
		role: 'Head of Advisory Board',
		img: '/shared/images/maxime.jpg',
		bio: 'Maxime is currently pursuing his Master\'s at Imperial College London. He first helped establish Raise\'s first London-based chapter, where he served as Secretary-Treasurer. After joining the Advisory Board, he has now stepped into the role of Head, where he focuses on strengthening Raise\'s processes, fostering a strong sense of community, and ensuring the charity continues to grow and stay relevant.\n\nOutside of Raise, Maxime enjoys cooking, going to the movies, and discovering new experiences.',
	},
	{
		name: 'Princess Bisnar',
		role: 'Expansion and Founding Officer',
		img: '/shared/images/princess.jpg',
		bio: 'Princess is this year\'s Expansion and Founding Officer for the Raise National Team. She just completed her BSc in Psychology at UCL and is now going into an MPH at Imperial. Having been co-president for Raise UCL last year, she believes that Raise is a great community because of our passion for changing our way of giving so that it is more memorable and rewarding. She can\'t wait to see Raise expand with more branches around the country!',
	},
	{
		name: 'Talia',
		role: 'Community Lead',
		img: '/shared/images/talia.jpg',
		bio: 'Talia is a fourth year Psychology student at UCL and is the community lead for 25/26. She was the Co-President of Raise last year and loved getting involved in an initiative that has a unique approach to giving, as well as getting to know people who were also passionate about Raise and having an impact. She is very excited to continue this further this year and helping Raise feel more even more connected.\n\nOutside of Raise, Talia is a massive cat-person and is currently fostering cats and helping them adjust to a home environment!',
	},
	{
		name: 'Aarushi',
		role: 'Advisory Board member and mentor',
		img: '/shared/images/aarushi.jpg',
		bio: 'Aarushi is a 4th year medical student at Cambridge, and was co-president of MWA in 2024-25. This year she will be joining the national team as a mentor for Cambridge as well as joining the Advisory Board and coming up with ways to make Raise bigger and better. In her spare time, Aarushi enjoys playing any racket sport, eating her housemate\'s nice cooking and watching House MD as a form of revision.',
	},
	{
		name: 'Chiara',
		role: 'Advisory Board member and mentor',
		img: '/shared/images/chiara.jpg',
		bio: 'Chiara is a passionate philosophy student at the University of Edinburgh and is currently on her year abroad in Leuven, Belgium.\nThis year she will mentor Raise Edinburgh as well as being part of the advisory board to make very exciting projects come true!\nRaise for her has been an opportunity to make a tangible change in the world and she is hyped to continue being part of the movement.\nIn her free time she loves hiking, petting every animal she can (especially cows), never shutting up about her dog and bothering people with fun facts!',
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
