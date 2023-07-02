import Helmet from 'react-helmet';

import Page from '../components/Page';
import Section, { SectionTitle } from '../components/Section';
import { TopNavigation } from '../components/Navigation';
import Footer from '../components/Footer';
import Quote from '../components/Quote';

import abeTolley from '../images/abe-tolley.jpg';
import adamJones from '../images/adam-jones.jpg';
import claraTuffrey from '../images/clara-tuffrey.jpg';
import hannahWragg from '../images/hannah-wragg.jpg';
import rahulShah from '../images/rahul-shah.jpg';
import susanneKarbe from '../images/susanne-karbe.jpg';
import thomasCohen from '../images/thomas-cohen.jpg';

const NATIONAL_TEAM = [
  {
    id: '01GCT0D1WW8D1ZPS5GKY6KZBCQ',
    name: 'Abe Tolley',
    role: 'Director',
    bio: "Abe coordinates Raise's work around the UK; managing the National Team, supporting the chapters and helping grow the movement. He's previously been on the Cambridge team as a President, Vice President and rep coordinator and this is his second year on the National Team. He especially loves seeing students get excited about their giving, both at university and beyond and has taken the Giving What We Can Pledge to donate at least 10% of his future earnings to effective charities.\n\nAbe is a 5th year medical student at the University of Cambridge and in his spare time enjoys cooking overly complicated food, quizzing and wondering around art galleries.",
    img: abeTolley,
  },
  {
    id: '01GCT0D1WWXDEV52E19DWBZ665',
    name: 'Adam Jones',
    role: 'Technology and Governance',
    bio: "Adam's responsible and accountable for technology at Raise. He makes sure people have the right tools available to get things done efficiently, securely and to a high standard. He built the majority of the website and our open-source donations platform, and where necessary helps out in other places, for example handling Charity Commission queries, supporting our successful application to the Effective Altruism Infrastructure Fund and facilitating meetings with the Raise Advisory Board.\n\nIn his day job, he works as a software engineer helping people make better data-driven decisions. Outside work, he enjoys cycling around London, contributing to open-source projects and playing board games.",
    img: adamJones,
  },
  {
    id: '01GCT0D1WW129RKXSN0F3HNKTC',
    name: 'Clara Tuffrey',
    role: 'Alumni Engagement',
    bio: "Clara has been involved in Raise for a number of years, first as a Rep Coordinator at Cambridge MWA and since then as a member of the National Team. Her focus is on alumni engagement, working to keep alumni excited about positive and effective giving after they graduate, and coordinating an alumni project work group.\n\nAfter graduating in 2021, Clara spent a year as an RS teacher, and is now completing a Master's in Christian-Jewish relations at Oxford. In her spare time she enjoys knitting, sewing and playing board games.",
    img: claraTuffrey,
  },
  {
    id: '01GCT0D1WW5XZJWMQT9GYH4DS4',
    name: 'Hannah Wragg',
    role: 'Mentorship and Sponsorship',
    bio: "Hannah has just finished her master's degree in management at The University of Sheffield. Alongside her master's she founded Raise Sheffield, and is now volunteering as a member of the National Team in her free time alongside working for a social enterprise providing charity fundraising challenges to University students.\n\nOn the national team this year Hannah will be mentoring some of the newer chapters through the year, and working on national sponsorship initiatives to ensure that Raise can put on some great events across the country this year.\n\nHannah's favourite thing about Raise is watching students go through the process of coming to understand the ethos and seeing how everyone comes together to form wonderful new friendships around a desire to have a positive impact in the world.\n\nHannah has also been involved in the Effective Altruism community and has taken the Giving What We Can pledge to donate 10% of her income to charity.",
    img: hannahWragg,
  },
  {
    id: '01GCT0D1WWYGATDR1J71WSZEJB',
    name: 'Rahul Shah',
    role: 'Community and Logistics',
    bio: "Rahul's a medical student studying at Cambridge, and has been involved in Raise since the start of his time there: first as a rep, then as Vice President Fundraising, then as President. He's excited to join the National Team to help Raise expand, evolve and continue having huge impact.\n\nWhen not doing Raise stuff, Rahul likes taking on entrepreneurial side projects and attempting to cook!",
    img: rahulShah,
  },
  {
    id: '01GCT0D1WWYDDHKDY59H0DAQ5C',
    name: 'Susanne Karbe',
    role: 'Community',
    bio: 'Susanne recently completed her PhD in Economics at Durham University and is currently on a gap year in South Korea! She set up the Raise chapter in Durham in 2020 and is now on the national team.\n\nIn her free time she loves to travel, dance and skate!',
    img: susanneKarbe,
  },
  {
    id: '01GCT0D1WW3E0YN30JKEQEPJY1',
    name: 'Thomas Cohen',
    role: 'Treasurer and Logistics',
    bio: "Thomas does a number of different jobs on the Raise National Team, including managing the accounts and mentoring. He was heavily involved in Raise in Durham, acting as Vice President and President over its first two years. He is really passionate about positive and celebratory giving, and therefore has pledged to give 10% of his income to charity!\n\nThomas has just finished a degree in History at Durham, and this year will be doing a master's in History and Philosophy of Science at UCL.",
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
        <Quote key={m.id} by={`${m.name}, ${m.role}`} headshotSrc={m.img} imagePlacement={i % 4 <= 1 ? 'left' : 'right'} className="mt-4 p-8 bg-raise-red rounded-lg min-h-[10rem] whitespace-pre-line">
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
