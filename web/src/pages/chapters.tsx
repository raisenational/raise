import Helmet from 'react-helmet';
import haversineDistance from 'haversine-distance';
import { navigate } from 'gatsby';
import { useForm } from 'react-hook-form';

import { LocationMarkerIcon } from '@heroicons/react/outline';
import { useState } from 'react';
import Page from '../components/Page';
import Section, { SectionTitle } from '../components/Section';
import { TopNavigation } from '../components/Navigation';
import Footer from '../components/Footer';
import Link from '../components/Link';
import sp1 from '../images/summer-party-1.jpg';
import sp2 from '../images/summer-party-2.jpg';
import Button from '../components/Button';
import { LabelledInput } from '../components/Form';
import env from '../env/env';

interface LatLong {
  latitude: number,
  longitude: number,
}

interface Chapter {
  id: string,
  name: string,
  href: string,
  location: LatLong,
}

const CHAPTERS: Chapter[] = [
  {
    id: '01GMXD8C9KBZ2QFDWD8WW1YKE2',
    name: 'Bristol',
    href: '/bristol/',
    location: {
      latitude: 51.4584,
      longitude: -2.6030,
    },
  },
  {
    id: '01GMXD8C9NV9SWWH1NP17NKD0F',
    name: 'Cambridge',
    href: `//${env.CUSTOM_MWA_DOMAIN}`,
    location: {
      latitude: 52.2054,
      longitude: 0.1132,
    },
  },
  {
    id: '01GMXD8C9PSD4KY1C67QZVCJW3',
    name: 'Durham',
    href: '/durham/',
    location: {
      latitude: 54.7650,
      longitude: -1.5782,
    },
  },
  {
    id: '01GMXD8C9QAG4F08G3HR052F5F',
    name: 'Edinburgh',
    href: '/edinburgh/',
    location: {
      latitude: 55.9445,
      longitude: 3.1892,
    },
  },
  {
    id: '01GMXD8C9S171E1VKGF4NH92K6',
    name: 'Glasgow',
    href: '/glasgow/',
    location: {
      latitude: 55.8724,
      longitude: -4.2900,
    },
  },
  {
    id: '01GPG5JFNQR1YWJQK6W89ABDFN',
    name: 'Leeds',
    href: '/leeds/',
    location: {
      latitude: 53.8067,
      longitude: -1.5550,
    },
  },
  {
    id: '01GMXD8C9TADQ6AVPWDNKBAT60',
    name: 'Oxford',
    href: '/oxford/',
    location: {
      latitude: 51.7548,
      longitude: -1.2544,
    },
  },
  {
    id: '01GMXD8C9T7N0YQXNGDC3ARBV6',
    name: 'Sheffield',
    href: '/sheffield/',
    location: {
      latitude: 53.3814,
      longitude: -1.4884,
    },
  },
  {
    id: '01GMXD8C9VMQK0V88APM61K2T3',
    name: 'Warwick',
    href: '/warwick/',
    location: {
      latitude: 52.3793,
      longitude: -1.5615,
    },
  },
];

const ChaptersPage = () => (
  <Page>
    <Helmet>
      <title>Raise: Our Chapters</title>
      <meta property="og:title" content="Raise: Our Chapters" />
    </Helmet>
    <TopNavigation />

    <Section className="text-left">
      <SectionTitle>Our Chapters</SectionTitle>

      <p>
        We operate at {CHAPTERS.length} UK universities. We call each local Raise group a chapter. If there isn't a Raise chapter at your university yet, we'd love to <Link href="#starting-a-chapter">help you start one</Link>.
      </p>

      <div className="md:grid md:grid-cols-2 mt-4">
        <div>
          <ChapterBrowser />
        </div>
        <div className="ml-2 hidden md:block">
          <img src={sp1} alt="Summer Party" className="shadow-raise rounded border-white border-8 -rotate-6 hover:-rotate-3 transition-all duration-500 ease-out" />
          <img src={sp2} alt="Summer Party" className="shadow-raise rounded border-white border-8 rotate-6 hover:rotate-3 transition-all duration-500 ease-out" />
        </div>
      </div>

      <p className="font-black font-raise-header mt-8 mb-2" id="starting-a-chapter">Founding a new chapter</p>
      <div className="space-y-4">
        <p>We love to hear from potential founders that are interested in starting a local Raise group. Even if you're not sure, please contact us and we can figure it out from there!</p>
        <p>Our national team will be happy to help you get set up. We'll provide a complete written manual with everything you need to know to set up a successful chapter, and can arrange regular mentorship sessions to support you as a founder.</p>
        <p>
          To get started, email us at <Link href="mailto:raisenational@gmail.com?body=Hey%2C%0D%0A%0D%0AI%20was%20reading%20your%20chapters%20page%20and%20was%20interested%20in%20founding%20a%20Raise%20chapter%20for%20%3Clocation%3E.%0D%0A%0D%0AHow%20can%20I%20get%20started%3F">raisenational@gmail.com</Link>.
        </p>
      </div>
    </Section>

    <Footer />
  </Page>
);

const ChapterBrowser = () => {
  const [location, setLocation] = useState<LatLong | undefined>(undefined);
  const [locationError, setLocationError] = useState<string | undefined>(undefined);
  const locationButton = (
    <button
      type="button"
      className="text-gray-700"
      onClick={() => {
        setLocationError(undefined);
        setLocation(undefined);
        navigator.geolocation.getCurrentPosition(
          ({ coords: { latitude, longitude } }) => {
            setLocation({ latitude, longitude });
          },
          (e) => {
            setLocationError(e.message);
          },
        );
      }}
    >
      <LocationMarkerIcon className="w-6 h-6 mb-1.5" />
      {' '}
      Use my location
    </button>
  );

  const formMethods = useForm<{ chapterFilter: string }>({
    defaultValues: { chapterFilter: '' },
  });

  const chapterFilterValue = formMethods.watch('chapterFilter').trim().toLowerCase();
  const filteredEntries = CHAPTERS
    .filter((c) => chapterFilterValue.length === 0 || c.name.toLowerCase().includes(chapterFilterValue))
    .map((c) => ({
      ...c,
      distance: location ? haversineDistance(location, c.location) / 1000 : undefined,
    }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

  return (
    <>
      <LabelledInput
        id="chapterFilter"
        type="text"
        placeholder="Search..."
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (filteredEntries.length === 1) {
              navigate(filteredEntries[0].href);
            }
            e.preventDefault();
          }
        }}
        {...formMethods.register('chapterFilter')}
        suffix={typeof window !== 'undefined' && window.navigator?.geolocation ? locationButton : undefined}
        error={locationError}
      />

      <ul className="mt-4 space-y-2">
        {filteredEntries.map((m) => (
          <li key={m.id}>
            <Button href={m.href} variant="red" skew={false} className="block">
              {m.name}
              {m.distance !== undefined && ` (${m.distance?.toFixed(0)}\xa0km)`}
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default ChaptersPage;
