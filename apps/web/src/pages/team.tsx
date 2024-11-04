import Helmet from 'react-helmet';

import Page from '../components/Page';
import Section, { SectionTitle } from '../components/Section';
import { TopNavigation } from '../components/Navigation';
import Footer from '../components/Footer';
import Quote from '../components/Quote';

import adamJones from '../images/adam-jones.jpg';
import thomasCohen from '../images/thomas-cohen.jpg';
import bill from '../images/bill.jpg';
import louis from '../images/louis.jpg';
import meehal from '../images/meehal.jpg';
import olivia from '../images/olivia.jpg';
import varshneyee from '../images/varshneyee.jpg';
import ella from '../images/ella.jpg';
import maxime from '../images/maxime.jpg';

const NATIONAL_TEAM = [
  {
    name: 'Olivia Collotta',
    role: 'Director',
    image: olivia,
    bio: "Olivia is a final year student at the University of Edinburgh studying Politics. Since co-founding Raise Edinburgh in 2022, she has served as a mentor to other Raise chapters and lead the community team. She is incredibly excited to be helping take Raise forward into another year of meaningful student engagement and celebration! Outside of her more fruitful academic pursuits, she enjoys trying to keep up with current events and trying to adopt her neighborhood's stray cats.",
  },
  {
    name: 'Ella Denton',
    role: 'Community lead',
    image: ella,
    bio: "Ella is a final year History student at UCL. She founded Raise UCL, London's first Raise chapter, as a first year in 2022.\nThis year, she will be taking on the role of Community Lead - organising the mentor program as well as mentoring several chapters herself. She is really excited about growing Raise at other London universities, with LSE among the chapters she will be mentoring.\nOutside of Raise and uni, Ella writes films, works as a part-time nanny to fund her penchant for pretty dresses, and then sleeps because all that's pretty exhausting. Top tip: when you meet her, time how long it takes her to mention that she used to live in Sweden.",
  },
  {
    name: 'Maxime Alves',
    role: 'UCL mentor & Advisory board member',
    image: maxime,
    bio: "Maxime is studying Management Science at UCL, and was involved in establishing Raise's first London-based chapter as its Secretary-Treasurer. He will be joining the Advisory Board working on bettering Raise processes and fostering a sense of community while also mentoring newer chapters.\n\nIn his spare time, Maxime enjoys cooking, going to the movies and spontaneously trying new things.",
  },
  {
    name: 'Shahamath Meehal Hussain',
    role: 'Warwick mentor',
    image: meehal,
    bio: "Meehal was the Founding President of Raise Warwick, where he worked to set up the chapter for two years. Leaving it in capable hands, he joined the national team to continue mentoring Warwick and other chapters. Meehal really enjoyed his time leading Raise Warwick, where he grew to understand and embody the values and core mission of Raise. He found it rewarding to inspire others in the same cause. He continues to donate to AMF and other such charities and encourages his fellow graduates to do so, too.\n\nMeehal now works at Lloyds Banking Group on their Finance Graduate Scheme, where his current role empowers him to hold companies accountable against LBG's ESG mission statements and continues to get involved in fundraising and volunteering initiatives. In his free time Meehal enjoys playing piano, tutoring maths and learning Japanese in preparation for moving there one day.",
  },
  {
    name: 'Varshneyee Dutt',
    role: 'Advisory board chair',
    image: varshneyee,
    bio: 'Varshneyee is a final year student of English Language & Linguistics at the University of Glasgow. She has been part of Raise since last year, when she was President of the Glasgow chapter, and is thrilled to join the national team this year.\n\nIn her free time, she enjoys reading Victorian literature, watching period dramas and travelling.',
  },
  {
    name: 'Louis Danker',
    role: 'Expansion & founding',
    image: louis,
    bio: "Louis is focussed on expanding Raise to more universities, and helping found new chapters. He was Co-Founding President of Raise Edinburgh in 2022, and is keen to keep spreading the celebration of giving far and wide! Louis is a final year Geography student in Edinburgh. He's a big football fan (and terrible footballer), a big music fan (and terrible musician), and a big foodie (his cooking divides opinion).",
  },
  {
    name: 'Bill Chen',
    role: 'Advisory board member',
    image: bill,
    bio: "Bill is on the advisory board of the Raise National Team. Before this role, he led the University of Oxford Raise chapter while studying Philosophy, Politics and Economics. During this time, Bill revitalised the inactive chapter, culminating in its most successful year.\n\nOn the advisory board, he aims to find solutions to make Raise chapters more resilient in the longer term. Bill is excited by the potential of cross-chapter collaboration to improve Raise's agility.",
  },
  {
    name: 'Adam Jones',
    role: 'Technology & governance',
    bio: 'Adam is responsible for technology at Raise. He maintains the website and our open-source donations platform. He also manages our relationship with the Charity Commission, and serves as a trustee on our board.\n\nIn his day job, he works as a software engineer helping people to have more impact in their careers. Outside work, he enjoys cycling around London, contributing to open-source projects and playing board games.',
    img: adamJones,
  },
  {
    name: 'Thomas Cohen',
    role: 'Treasurer',
    bio: "Thomas has done a number of different jobs on the Raise National Team, including managing the accounts and mentoring. He was heavily involved in Raise in Durham, acting as Vice President and President over its first two years. He is really passionate about positive and celebratory giving, and therefore has pledged to give 10% of his income to charity!\n\nThomas studied History at Durham, and last year completed a master's in History and Philosophy of Science at UCL.",
    img: thomasCohen,
  },
];

const TeamPage = () => (
  <Page>
    <Helmet>
      <title>Raise: The Team</title>
      <meta property="og:title" content="Raise: The Team" />
    </Helmet>
    <TopNavigation />

    <Section className="text-left">
      <SectionTitle>The Team</SectionTitle>

      <div className="space-y-4">
        <p>Raise educates students about charitable giving, aiming to encourage effective and deliberate giving. It’s run by unpaid volunteers and does not make a profit.</p>
        <p>We call each local Raise group a chapter. These tend to be based at universities, where they may be societies. Each chapter is run by a team of student volunteers, recruited annually.</p>
        <p>These chapters are supported by a central, national team. The national team recruits, mentors, and coordinates the chapters, sets the strategic direction for what Raise does, and provides support services like the website.</p>
        <p>The national team is supported by an advisory board, a group of current and former students who have been closely involved with Raise in the past. They provide strategic support and work on exciting new projects such as the Raise blog.</p>
      </div>

      <p className="font-black font-raise-header mt-8 mb-2">Chapter Teams</p>
      <p>Find out more about our chapter teams on their respective pages.</p>

      <p className="font-black font-raise-header mt-8 mb-2">National Team</p>
      <p>
        There's
        {' '}
        {NATIONAL_TEAM.length}
        {' '}
        of us on the national team. We're students and recent grads who volunteer to support chapters as best we can:
      </p>
      {NATIONAL_TEAM.map((m, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Quote key={i} by={`${m.name}, ${m.role}`} headshotSrc={m.img} imagePlacement={i % 4 <= 1 ? 'left' : 'right'} className="mt-4 p-8 bg-raise-red rounded-lg min-h-[10rem] whitespace-pre-line">
          {m.bio}
        </Quote>
      ))}
      <p className="mt-4">You can contact the national team via email at raisenational@gmail.com.</p>

      <p className="font-black font-raise-header mt-8 mb-2">Advisory Board</p>
      <p>The advisory board is group of Raise alumni, most of whom have previously served on chapter teams.</p>
    </Section>

    <Footer />
  </Page>
);

export default TeamPage;
