import Helmet from 'react-helmet';
import confetti from 'canvas-confetti';

import { convert, format } from '@raise/shared';
import { useEffect } from 'react';
import Page from './Page';
import { useReq } from '../helpers/networking';
import Alert from './Alert';
import env from '../env/env';
import { Env, Brand } from '../helpers/types';

interface Props {
  title: string,
  fundraiserIds: Record<Env['STAGE'], string>,
  brand?: Brand,
}

const LivePage: React.FC<Props> = ({ title, fundraiserIds, brand }) => {
  const fundraiserId = fundraiserIds[env.STAGE];
  const [fundraiser, refetchFundraiser] = useReq('get /public/fundraisers/{fundraiserId}', { fundraiserId });

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    if (!prefersReducedMotion) {
      const i = setInterval(() => {
        confetti({
          particleCount: 10,
          angle: 290,
          spread: 70,
          origin: { x: 0, y: -0.4 },
          startVelocity: 0.06 * window.innerHeight,
          gravity: 1,
          ticks: 400,
        });
        confetti({
          particleCount: 10,
          angle: 250,
          spread: 70,
          origin: { x: 1, y: -0.4 },
          startVelocity: 0.06 * window.innerHeight,
          gravity: 1,
          ticks: 400,
        });
      }, 250);

      return () => clearInterval(i);
    }
    return () => { /* noop */ };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const i = setInterval(() => {
      refetchFundraiser().catch(() => { /* noop - errors handled in useAxios */ });
    }, 15_000);

    const t = setTimeout(() => {
      clearInterval(i);
      // eslint-disable-next-line no-alert
      alert("This page has stopped updating as it's been over 8 hours since you opened it, and we want to avoid unnecessary load on our platform. Please refresh this page if you want to continue seeing live data.");
    }, 28800_000); // 8 hours

    return () => {
      clearTimeout(t);
      clearInterval(i);
    };
  });

  return (
    <Page brand={brand}>
      <Helmet>
        <title>
          {fundraiser.data?.publicName ?? title}
          : Live
        </title>
        <meta property="og:title" content={`${fundraiser.data?.publicName ?? title}: Live`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      {fundraiser.error && <Alert className="m-16">{fundraiser.error}</Alert>}
      {fundraiser.data && (
        <div className="text-5xl flex flex-col h-screen overflow-hidden">
          <div className="transition-all duration-1000" style={{ height: `${100 - Math.min(100, 100 * (fundraiser.data.totalRaised / fundraiser.data.goal))}vh` }}>
            <p className="py-8">
              Goal:
              {format.amountShort('gbp', fundraiser.data.goal)}
            </p>
          </div>
          <div className="bg-raise-purple flex-1">
            <p className="py-8 px-16">
              {fundraiser.data.totalRaised === 0
                ? "We haven't received a donation yet - be the first to donate!"
                : `Together we've raised ${format.amountShort('gbp', fundraiser.data.totalRaised)}, protecting ${convert.moneyToPeopleProtected('gbp', fundraiser.data.totalRaised)} people from malaria!`}
            </p>
          </div>
        </div>
      )}
    </Page>
  );
};

export default LivePage;
