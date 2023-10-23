import { Helmet } from 'react-helmet';
import React from 'react';
import { RouteComponentProps } from '@gatsbyjs/reach-router';
import Footer from './Footer';
import Navigation from './Navigation';
import Page from './Page';
import Section, { SectionTitle } from './Section';
import { MemberCreation } from '../helpers/generated-api-client';
import { useRawReq } from '../helpers/networking';
import { SignUpForm } from './SignUpForm';
import Logo from './Logo';

const SignUpPage: React.FC<RouteComponentProps> = () => {
  const req = useRawReq();

  return (
    <Page brand="Raise" className="flex flex-col">
      <Helmet>
        <title>
          Sign Up
        </title>
        <meta property="og:title" content="Raise: Sign Up" />
      </Helmet>
      <div className="flex-1">
        <Navigation
          left={[
            { text: '< back to main site', href: '../' },
          ]}
          right={[]}
        />

        <Section>
          <Logo className="my-8 w-24" />
          <SectionTitle>Sign Up</SectionTitle>
          <div>
            Sign up to recieve updates from Raise!
          </div>
          <SignUpForm<MemberCreation>
            title=""
            definition={{
              name: { label: 'Name', inputType: 'text' },
              email: { label: 'Email', inputType: 'text' },
            }}
            initialValues={{
              name: '',
              email: '',
            }}
            showCurrent={false}
            subscribe
            onSubmit={async (data) => {
              if ((data.name === null)) {
                data.name = '';
              }
              if (data.email === null) {
                data.email = '';
              }
              await req('post /public/members/subscribe', data);
              // navigate(`/${title.slice(6).toLocaleLowerCase()}/signUp/`);
              // window.location.reload();
              // setPage(pageDetails);
            }}
          />
        </Section>
      </div>
      <Footer />
    </Page>
  );
};

export default SignUpPage;
