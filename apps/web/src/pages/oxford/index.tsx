import Helmet from 'react-helmet';

import { convert } from '@raise/shared';
import Page from '../../components/Page';
import Section, { SectionTitle } from '../../components/Section';
import Navigation from '../../components/Navigation';
import Cover, { CTADown } from '../../components/Cover';
import IntroStats from '../../components/IntroStats';
import FAQs, { FAQ } from '../../components/FAQs';
import Philosophy from '../../components/Philosophy';
import { SocialIconV2 } from '../../components/SocialIcon';

import Panel from '../../components/Panel';

import { Doubled, MoneyBox, Party } from '../../images/Icons';
import Footer from '../../components/Footer';

const IndexPage = () => (
  <Page>
    <Helmet>
      <title>Raise Oxford</title>
      <meta property="og:title" content="Raise Oxford" />
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
          {
            text: 'Join the 2023/24 Committee',
            href: 'https://forms.gle/LiLUkY7LCuGutS7x6',
          },
        ]}
      />
      <Section className="px-8">
        <IntroStats
          title="Raise Oxford"
          tagline="Raise is a charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving."
          statistics={{
            years: 2,
            students: 82 + 95,
            raised: 13958 + 17004,
            protected: convert.moneyToPeopleProtected('gbp', 1375872 + 1700381),
          }}
        />
      </Section>
      <CTADown text="How it works" href="#how-it-works" />
    </Cover>

    <Section id="how-it-works" className="mt-0">
      <SectionTitle>How it Works</SectionTitle>
      <div className="grid gap-5 md:grid-cols-3 md:gap-8">
        <Panel
          image={<MoneyBox className="h-16 mb-4" />}
          title="Donate"
          text="We invite students to make a personally significant donation to charity. We recommend a donation of £150 to the Against Malaria Foundation, but welcome any amount that is significant to you."
          className="bg-raise-purple"
        />
        <Panel
          image={<Doubled className="h-16 mb-4" />}
          title="Doubled"
          text="Thanks to our matched funding, 200% of the money you donate goes directly to AMF. That means that your £150, when doubled, can help protect over 350 people from malaria!"
          className="bg-raise-red"
        />
        <Panel
          image={<Party className="h-16 mb-4" />}
          title="Celebrate"
          text="Towards the end of Trinity Term, we come together as a community to celebrate the end of the academic year and our collective impact. There's food and drink, great company and live entertainment!"
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
        <FAQ title="How can I get involved?">
          <p>
            We're so pleased you're interested in Raise, and look forward to
            celebrating with you! Here are a few ways you can help grow the
            movement:
          </p>
          <p>
            <b>Raise Reps:</b>
            {' '}
            Reps are ambassadors for Raise, and a central
            part of Raise’s community, helping to share our philosophy and what
            we do with the Oxford community.
            {' '}
            <a href="https://forms.gle/f22GkSokt38hSfd48">Click here</a>
            {' '}
            to find
            out more about the rep role and to sign up.
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
            <a href="https://www.facebook.com/raiseoxford">Facebook</a>
            {' '}
            and
            {' '}
            <a href="https://www.instagram.com/raiseoxford/">Instagram</a>
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
            Applications are now closed, but will reopen in Trinity 2023!
          </p>
          <p>
            <b>Sponsorship:</b>
            {' '}
            The support of our generous partners is
            invaluable for helping us to put on our summer celebration at the
            end of each year. If you know anyone who may be interested in
            supporting Raise and allowing us to grow even more, please do
            {' '}
            <a href="./#contact">get in touch</a>
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
          <p>
            <a href="https://forms.gle/f22GkSokt38hSfd48">Sign up</a>
            {' '}
            to be a
            rep.
          </p>
        </FAQ>

        <FAQ title="£150 is a lot of money - what if I can't donate that?">
          <p>
            We recognise that £150 is a large amount of money for many students,
            and whilst we have thought carefully about recommending this amount
            (see next question), it is important to us that any student feels
            able to join us in celebrating through giving.
          </p>
          <p>
            As such, whilst we recommend £150, you are welcome to join Raise by
            making a donation of a size which is significant to you and allows
            you to put charity at the heart of your end-of-year celebrations. It
            is central to our philosophy (see
            {' '}
            <a href="./#our-philosophy">here</a>
            {' '}
            for more) that students
            actively engage with their decision to celebrate through giving, but
            we recognise that the donation that enables this will not be the
            same for everyone.
          </p>
          <p>
            In addition, you have the option of donating in weekly installments,
            as some have found this more manageable. A weekly donation of £5
            from the donations launch up until our summer celebration adds up to
            about £150, which will still be doubled through our matched funding.
          </p>
          <p>
            Note: We have ensured that our donations page allows you to hide
            your name and/or donation amount, should you choose.
          </p>
        </FAQ>

        <FAQ title="Why do you recommend £150?">
          <p>
            We recognise that £150 is a large amount of money, and substantially
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
            we recommend £150, or a donation of any size significant to the
            donor.
          </p>
          <p>
            <b>Impact:</b>
            {' '}
            Crucially, the recommended amount, coupled with
            matched funding, allows us to have an exceptionally large impact for
            a student charity initiative; your £150 donation, when doubled, can
            help protect over 350 people from malaria.
          </p>
          <p>
            <b>Ball Symbolism:</b>
            {' '}
            The £150 figure is representative of the cost
            of many ball tickets - this is symbolic of our belief that charity
            can be embraced as an integral part of Trinity celebrations, on a
            par with balls.
          </p>
        </FAQ>

        <FAQ title="I'm already going to a ball. Is Raise really for me? (Hint: yes, definitely!)">
          <p>
            Of course, Raise is for everyone - whether you're going to three
            balls or none, we welcome you to join our growing community and put
            charity at the heart of your celebrations. Raise is an alternative
            way to celebrate, but that doesn't mean you can't take part in other
            things going on!
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
            £150, doubled through matched funding, can help protect 350 people.
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
        <SocialIconV2 type="email" id="raiseoxford@gmail.com" />
        <SocialIconV2 type="instagram" id="raiseoxford" />
        <SocialIconV2 type="facebook" id="raiseoxford" />
      </div>
    </Section>

    <Footer />
  </Page>
);

export default IndexPage;
