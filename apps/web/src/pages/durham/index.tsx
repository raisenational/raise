import Helmet from 'react-helmet';

import { convert } from '@raise/shared';
import Page from '../../components/Page';
import Section, { SectionTitle } from '../../components/Section';
import Navigation from '../../components/Navigation';
import Cover, { CTADown } from '../../components/Cover';
import IntroStats from '../../components/IntroStats';
import Button from '../../components/Button';
import FAQs, { FAQ } from '../../components/FAQs';
import Philosophy from '../../components/Philosophy';
import { SocialIconV2 } from '../../components/SocialIcon';

import Panel from '../../components/Panel';

import { Doubled, MoneyBox, Party } from '../../images/Icons';
import Footer from '../../components/Footer';

const IndexPage = () => (
  <Page>
    <Helmet>
      <title>Raise Durham</title>
      <meta property="og:title" content="Raise Durham" />
    </Helmet>
    <Cover>
      <Navigation
        left={[
          { text: 'Home', href: '.' },
          { text: 'How It Works', href: '#how-it-works' },
          { text: 'FAQs', href: '#faq' },
          { text: 'Our Philosophy', href: '#our-philosophy' },
          { text: 'Contact', href: '#contact' },
        ]}
        right={[
          {
            text: 'Become a Rep!',
            href: 'https://forms.office.com/Pages/ResponsePage.aspx?id=i9hQcmhLKUW-RNWaLYpvlIGtrPRODqJElDPybbbkp9RUNEJHNEJBNDBWTExUUFVJTjg1MzE3UzI3VC4u',
          },
          // { text: "Get Involved!", href: "https://docs.google.com/forms/d/e/1FAIpQLSfeK5cMn8ZWlRtFh5ZJHexjTiS0DVvfpL9E93Logd3CPLMK9A/viewform" },
        ]}
      />
      <Section className="px-8">
        <IntroStats
          title="Raise Durham"
          tagline="Raise is a charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving."
          statistics={{
            years: 1 + 1,
            students: 122 + 108,
            raised: 30714 + 13430,
            protected: 37867 + convert.moneyToPeopleProtected('gbp', 1334075),
          }}
        />
        <Button variant="outline" size="large" className="mt-4 mb-12" href="donate/">Donate</Button>
      </Section>
      <CTADown text="How it works" href="#how-it-works" />
    </Cover>

    <Section id="how-it-works" className="mt-0">
      <SectionTitle>How it Works</SectionTitle>
      <div className="grid gap-5 md:grid-cols-3 md:gap-8">
        <Panel
          image={<MoneyBox className="h-16 mb-4" />}
          title="Donate"
          text="We invite students to make a personally significant donation to charity as a way of celebrating the end of the academic year. We recommend a donation of £100 to the Against Malaria Foundation, but welcome any amount that is significant to you."
          className="bg-raise-purple"
        />
        <Panel
          image={<Doubled className="h-16 mb-4" />}
          title="Doubled"
          text="Thanks to our matched funding, 200% of the money you donate goes directly to AMF. That means that your £100, when doubled, can help protect over 230 people from malaria!"
          className="bg-raise-red"
        />
        <Panel
          image={<Party className="h-16 mb-4" />}
          title="Celebrate"
          text="In third term, we come together as a community to celebrate the end of the academic year and our collective impact. There's food and drink, great company and live entertainment!"
          className="bg-raise-yellow text-black"
        />
      </div>

      <iframe
        className="w-full max-w-2xl mx-auto mt-12 rounded shadow-raise"
        title="YouTube: Raise: A Celebration of Giving"
        width="672"
        height="378"
        src="https://www.youtube-nocookie.com/embed/6bEloAzIV2c?rel=0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </Section>

    <Section id="faq">
      <SectionTitle>More Info</SectionTitle>
      <FAQs>
        <FAQ title="Sounds great, where do I sign up?">
          <p>
            Awesome! You can get involved by filling in the form
            {' '}
            <a href="https://forms.gle/wBmJQdMSMMrqLrBB7">here</a>
            !
          </p>
        </FAQ>

        <FAQ title="How can I get involved?">
          <p>
            We're so pleased you're interested in Raise, and look forward to
            celebrating with you! Here are a few ways you can help grow the
            movement:
          </p>
          <p>
            <b>Raise Reps:</b>
            {' '}
            Reps are a central part of Raise’s community and
            are crucial to spreading the Raise message! Rep recruitment for next
            academic year will start in Michaelmas Term, but we're always
            interested in hearing from people who want to get involved -
            register your interest
            {' '}
            <a href="https://forms.gle/cPwHFVeYu1z32QkF9">here</a>
            ! See below
            for more details on what a Raise rep does.
          </p>
          <p>
            <b>Spread the word:</b>
            {' '}
            Letting your friends know about Raise is one
            of the most valuable things you can do - aside from the huge impact
            of their donations, celebrating is more fun when we do it together!
            Why not show them our website, share our posts on social media, and
            invite friends to follow our
            {' '}
            <a href="https://www.facebook.com/raisedurham">Facebook</a>
            {' '}
            and
            {' '}
            <a href="https://www.instagram.com/raisedurham/">Instagram</a>
            {' '}
            pages
            themselves?
          </p>
          <p>
            <b>Committee:</b>
            {' '}
            If you really want to shape the future of Raise,
            you could apply to join our committee, which coordinates everything
            we do, from events and partnerships to fundraising and publicity.
            Applications for the next academic year will open in the spring, but
            we're always interested in hearing from people who want to get
            involved!
          </p>
          <p>
            <b>Sponsorship:</b>
            {' '}
            The support of our generous partners is
            invaluable for helping us to put on our summer celebration at the
            end of each year. If you know anyone who may be interested in
            supporting Raise and allowing us to grow even more, please do
            {' '}
            <a href="#contact">get in touch</a>
            .
          </p>
        </FAQ>

        <FAQ title="What is a Raise Rep, and what do they do?">
          <p>
            Reps are a central part of Raise’s community and are crucial to the
            growth of the movement. As a rep, you have the opportunity to help
            spread the Raise message, and we'll give you lots of support to do
            this. You might spread our message through:
          </p>
          <p>
            <b>Conversations:</b>
            {' '}
            The most important part of the role! Talk
            about Raise with others in your college, departments, and social
            groups - the ask is significant and requires some thought, so this
            is how most people come to join.
          </p>
          <p>
            <b>Social Media:</b>
            {' '}
            Engage regularly with Raise’s posts, invite
            friends to follow the page, and share things at key moments. Share
            the Raise philosophy on any groups you are in to try and get as many
            people involved as possible!
          </p>
          <p>
            <b>Your own ideas!:</b>
            {' '}
            We love it when reps suggest and implement
            their own ideas for spreading the word and engaging new students.
            Equally, if there’s anything at all we could be doing better,
            there’s nobody better to point it out!
          </p>
          <p>
            Or you could be a
            {' '}
            <b>Lead Rep</b>
            , who takes responsibility for
            publicity within college. This will involve sharing posts and
            messages to college, putting up posters and potentially hosting your
            own outreach events.
          </p>
        </FAQ>

        <FAQ title="£100 is a lot of money - what if I can't donate that?">
          <p>
            We recognise that £100 is a large amount of money for many students,
            and whilst we have thought carefully about recommending this amount
            (see next question), it is important to us that any student feels
            able to join us in celebrating through giving.
          </p>
          <p>
            As such, whilst we recommend £100, you are welcome to join Raise by
            making a donation of a size which is significant to you and allows
            you to put charity at the heart of your end-of-year celebrations. It
            is central to our philosophy (see
            {' '}
            <a href="#our-philosophy">here</a>
            {' '}
            for more) that students actively engage with their decision to
            celebrate through giving, but we recognise that the donation that
            enables this will not be the same for everyone.
          </p>
          <p>
            In addition, you have the option of donating in weekly installments,
            as some have found this more manageable. A weekly donation of £5
            from the donations launch up until our summer celebration adds up to
            about £100, which will still be doubled through our matched funding.
          </p>
          <p>
            Note: We have ensured that our donations page allows you to hide
            your name and/or donation amount, should you choose.
          </p>
        </FAQ>

        <FAQ title="Why do you recommend £100?">
          <p>
            We recognise that £100 is a large amount of money, and substantially
            more than most students would routinely donate to charity (indeed,
            that is part of the point!). There are a couple of key reasons we
            recommend this figure:
          </p>
          <p>
            <b>Encouraging considered giving:</b>
            {' '}
            Raise is all about changing
            the way students think about charity, and we can only achieve this
            if students engage consciously with the act of donating. By inviting
            students to give an amount that’s personally significant to them, we
            hope that all donors will stop and think meaningfully about their
            decision to donate, and will in turn take this positive, deliberate
            approach towards giving forward into their future lives. This is why
            we recommend £100, or a donation of any size significant to the
            donor.
          </p>
          <p>
            <b>Impact:</b>
            {' '}
            Crucially, the recommended amount, coupled with
            matched funding, allows us to have an exceptionally large impact for
            a student charity initiative; your £100 donation, when doubled, can
            help protect over 230 people from malaria.
          </p>
        </FAQ>

        <FAQ title="Can I donate to a different charity?">
          <p>
            At Raise, we think very carefully about which charity to recommend
            (see below), particularly given how much money students are
            donating. However, we recognise that some students may want to join
            us in celebrating through giving, but would prefer to donate to a
            different charity. This is absolutely fine, but please get in touch
            with us beforehand so that we are aware.
          </p>
          <p>
            Note: All matched funding will still go to the Against Malaria
            Foundation.
          </p>
        </FAQ>

        <FAQ title="Why do you recommend donating to AMF?">
          <p>
            At Raise, we think very carefully about which charity to recommend.
            When students are making such significant donations, we want to make
            sure the money is doing as much good as it possibly can. To make our
            decision, we have taken the advice of independent charity evaluators
            {' '}
            <a href="https://www.givewell.org/charities/top-charities">
              GiveWell
            </a>
            {' '}
            and
            {' '}
            <a href="https://www.givingwhatwecan.org">Giving What We Can</a>
            , which both rank AMF as one of the most effective charities in the
            world.
          </p>
          <p>
            Tragically, malaria causes 400,000 preventable deaths every year,
            disproportionately affecting young children and pregnant women, and
            has a knock-on effect on the local economy. AMF works with local
            partners to provide life-saving bed-nets which protect people as
            they sleep. To find out more about their work, see
            {' '}
            <a href="https://www.againstmalaria.com/">AMF's website</a>
            . The
            specific net distributions for which we have funded nets can be seen
            on
            {' '}
            <a href="https://www.againstmalaria.com/FundraiserGroup.aspx?FundraiserID=8339">
              Raise's dedicated AMF page
            </a>
            .
          </p>
          <p>
            Because AMF's intervention is so effective at preventing malaria,
            each donation can have a huge impact. For example, a donation of
            £100, doubled through matched funding, can help protect 230 people.
            In fact, the money we raised nationally in 2020 was enough to
            protect over 120,000 people!
          </p>
        </FAQ>

        <FAQ title="What makes Raise different to a charity ball?">
          <p>
            At Raise, our mission is to encourage students to adopt a positive,
            deliberate approach towards giving. As such, we focus on ensuring
            that each student who chooses to join can engage meaningfully with
            the impact of their donation. The primary role of the Summer Party
            is to facilitate this engagement, as an enjoyable opportunity to
            come together as a community and celebrate our collective impact.
            However, it is not the most important element of what we do, nor the
            purpose of donating.
          </p>
          <p>
            Crucially, the donation students make to join Raise does not
            constitute ‘buying a ticket’ to the party. Indeed, the funding of
            our summer celebration is completely separate to the donation (it’s
            funded through a combination of additional voluntary contributions
            from donors and external sponsorship). Many students have joined
            Raise without attending the Summer Party at all.
          </p>
        </FAQ>

        <FAQ title="If 100% of donations go to charity, how do you put on the summer celebration? What's it like?">
          <p>
            The Summer Party is a chance for us to come together and celebrate
            our collective impact, as well as the end of the academic year.
            Crucially, 100% of the money students donate goes directly to
            charity – none of it is used to fund the party. As such, we invite
            students to make an optional contribution of £10 per head, separate
            to their donation, to cover the costs of the event (which are
            generously subsidised by our sponsors). Importantly, everyone will
            be very welcome to join, whether or not they feel able to make this
            contribution.
          </p>
          <p>
            There will be music, food, drinks (alcoholic and non-alcoholic) and
            live entertainment, contributing to the atmosphere of celebration
            you’ll experience with the rest of the Raise community. It’s a
            fantastic chance to reflect on the impact of our donations and many
            of those who’ve attended elsewhere in recent years have described it
            as a real highlight!
          </p>
        </FAQ>

        <FAQ title="What about COVID-19?">
          <p>
            Naturally, we are aware that the COVID-19 pandemic may affect the
            ways in which we can come together over the course of this year, and
            we are keeping a close eye on the local and national guidance at
            every stage. However, even if we are not able to come together as an
            entire community, this will not stop us from marking the end of the
            year in true Raise style. Whether in smaller groups or all together,
            we aim to create a meaningful and enjoyable format to bring the
            community together and celebrate our collective impact under these
            different circumstances.
          </p>
        </FAQ>
      </FAQs>
    </Section>

    <Philosophy />

    <Section id="contact">
      <SectionTitle>Get in Touch</SectionTitle>
      <div className="inline-block text-left">
        <SocialIconV2 type="email" id="raisedurham@gmail.com" />
        <SocialIconV2 type="instagram" id="raisedurham" />
        <SocialIconV2 type="facebook" id="raisedurham" />
      </div>
    </Section>

    <Footer />
  </Page>
);

export default IndexPage;
