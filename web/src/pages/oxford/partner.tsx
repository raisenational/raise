import Helmet from 'react-helmet';

import Page from '../../components/Page';
import Section, { SectionNoPadding, SectionTitle } from '../../components/Section';
import Navigation from '../../components/Navigation';
import Cover from '../../components/Cover';
import ContactForm from '../../components/ContactForm';
import SocialIcon from '../../components/SocialIcon';
import Panel from '../../components/Panel';

import instagram from '../../images/instagram.svg';
import facebook from '../../images/facebook.svg';
import email from '../../images/email.svg';
import Button from '../../components/Button';
import Footer from '../../components/Footer';

const PartnerPage = () => (
  <Page>
    <Helmet>
      <title>Raise Oxford: Partner with us</title>
      <meta property="og:title" content="Raise Oxford: Partner with us" />
    </Helmet>
    <Cover>
      <Navigation
        left={[
          { text: 'Home', href: '/oxford/' },
          { text: 'How It Works', href: '/oxford/#how-it-works' },
          { text: 'FAQs', href: '/oxford/#faq' },
          { text: 'Our Philosophy', href: '/oxford/#our-philosophy' },
          { text: 'Contact', href: '/oxford/#contact' },
          { text: 'Partner', href: '/oxford/partner/' },
        ]}
        right={[
          { text: 'Join: Donate Here', href: 'https://app.sogive.org/#fundraiser/raiseoxford.Qf5OnaFn.702c64' },
        ]}
      />
      <SectionNoPadding className="px-8">
        <h1 className="text-5xl sm:text-7xl font-raise-header font-black">Partner with us</h1>
        <p className="text-2xl sm:text-3xl">Support a growing and impactful movement with university-wide reach.</p>
        <div className="flex justify-center gap-2 mt-4">
          <Button href="#colleges">For colleges</Button>
          <Button href="#organisations">For organisations</Button>
        </div>
      </SectionNoPadding>
      <br />
    </Cover>

    <Section id="colleges" className="mt-0">
      <SectionTitle>Colleges</SectionTitle>
      <p>You can play an indispensable role in ensuring the success of Raise by helping us to reach students across Oxford and put on as impactful a Summer Party possible. Through working with us, you can support your students choosing to celebrate through giving.</p>
      <div className="grid gap-5 md:grid-cols-3 md:gap-8 mt-8">
        <Panel
          title="Get in touch"
          text={(
            <>
              If you want to support the growth of Raise, please don't hesitate to get in touch! Whether you're a JCR president who has a great idea for reaching out to your students, or a Senior Tutor wanting to encourage social responsibility, we'd love you to join us in changing the way students think about charity. Contact us at
              <a href="mailto:raiseoxford@gmail.com" className="text-blue-300">raiseoxford@gmail.com</a>
              {' '}
              or via the form below and we'd love to meet with you to discuss how we can work together.
            </>
)}
          className="bg-raise-purple"
        />
        <Panel
          title="Encourage"
          text="If you think Raise is something your students would benefit from taking part in, let them know! You can do this by offering to match the donations of your college members (perhaps with a financial cap). We'd also be keen to work with you to publicise Raise to your students. That could be via college, alumni or ball mailing lists, through your JCR, or by supporting the work of the college reps at your college."
          className="bg-raise-red"
        />
        <Panel
          title="Events"
          text="Since every pound that students donate goes directly to charity, college assistance is vital to run our Summer Celebration. We are grateful for any contributions towards our catering or logistics, for example by providing or storing food, or offering financial support. Plus, if you have a beautiful lawn with capacity for 50-100 guests or more, and you want to put your college at the centre of the Summer Celebration, why not enquire about hosting our event?"
          className="bg-raise-yellow text-black"
        />
      </div>
    </Section>

    <Section id="organisations" className="mt-0">
      <SectionTitle>Organisations</SectionTitle>
      <p>Whether you are a company, foundation, or simply an individual wanting to support Raise, you can promote the growth of our movement and demonstrate your support for our message by helping us to put on as impactful a Summer Party as possible.</p>
      <div className="grid gap-5 md:grid-cols-2 md:gap-8 mt-8">
        <Panel
          title="In-kind donations"
          text="Since 100% of student donations go directly to charity, contributions from our partners are crucial when running a party for up to 100 guests. Whether you specialise in food, drink, decorations or logistics, we'd love to work with you to help create a meaningful celebration of giving."
          className="bg-raise-red"
        />
        <Panel
          title="Financial support"
          text="By helping to cover the cost of our catering, decorations and logistics you will have a place at the centre of our movement, encouraging students to think positively about charity, and enabling every penny that students give to be donated directly."
          className="bg-raise-purple"
        />
      </div>
    </Section>

    <Section id="contact">
      <SectionTitle>Get in Touch</SectionTitle>
      <div className="flex justify-center gap-8">
        <SocialIcon icon={instagram} alt="Instagram" href="https://www.instagram.com/raiseoxford/" />
        <SocialIcon icon={facebook} alt="Facebook" href="https://www.facebook.com/raiseoxford" />
        <SocialIcon icon={email} alt="Email" href="mailto:raiseoxford@gmail.com" />
      </div>
      <ContactForm className="mt-8" action="https://formspree.io/mvoqrejq" />
    </Section>

    <Footer />
  </Page>
);

export default PartnerPage;
