import DonationPageV2 from '../../components/DonationPageV2';
import Link from '../../components/Link';
import config from './_config';

const Page = () => (
  <DonationPageV2
    {...config}
    charities={[
      {
        name: 'AMF',
        description: (
          <p>
            The Against Malaria Foundation funds and distributes long-lasting insecticidal nets, which protect people from malaria.
            {' '}
            <span className="italic">
              Purchasing and distributing a net costs about £4, and prevents one to two cases of malaria.
              <Link className="ml-1 relative -top-1 text-sm underline text-inherit" target="_blank" href="https://www.givewell.org/charities/amf">Source: GiveWell</Link>
            </span>
          </p>
        ),
        link: 'https://www.againstmalaria.com/'
      },
      {
        name: 'Clear Air Task Force',
        description: (
          <p>
            Clean Air Task Force advocates for public policies that invest in climate-protecting technologies, curb fossil-fuel emissions, and enact pollution regulations.
            {' '}
            <span className="italic">
              Given their track record and the nature of their future projects, a donation to CATF likely averts a tonne of CO2e for $0.10-$1.
              <Link className="ml-1 relative -top-1 text-sm underline text-inherit" target="_blank" href="https://founderspledge.com/research/fp-climate-change">Source: Founders Pledge (page 88)</Link>
            </span>
          </p>
        ),
        link: 'https://www.catf.us/'
      },
      {
        name: 'GiveDirectly',
        description: (
          <p>
            GiveDirectly sends money directly to the world's poorest households, allowing people living in poverty to choose for themselves how best to improve their lives.
            {' '}
            <span className="italic">
              The proportion of funds GiveDirectly has delivered directly to recipients is approximately 83%.
              <Link className="ml-1 relative -top-1 text-sm underline text-inherit" target="_blank" href="https://www.givewell.org/charities/give-directly/November-2020-version">Source: GiveWell</Link>
            </span>
          </p>
        ),
        link: 'https://www.givedirectly.org/'
      },
      {
        name: 'Raising Voices',
        description: (
          <p>
            Raising Voices creates evidence-based programs to prevent violence against women and children, and supports others to use those methodologies.
            {' '}
            <span className="italic">
              Similar community-based interventions may cost $150 for a woman to live a year free from violence.
              <Link className="ml-1 relative -top-1 text-sm underline text-inherit" target="_blank" href="https://forum.effectivealtruism.org/posts/uH9akQzJkzpBD5Duw/what-you-can-do-to-help-stop-violence-against-women-and">Source: EA Forum</Link>
            </span>
          </p>
        ),
        link: 'https://raisingvoices.org/'
      },
      {
        name: 'StrongMinds',
        description: (
          <p>
            StrongMinds provides free depression treatment to low-income women and adolescents in sub-Saharan Africa.
            {' '}
            <span className="italic">
              StrongMinds likely prevent the equivalent of one year of severe major depressive disorder for a woman at a cost of $248.
              <Link className="ml-1 relative -top-1 text-sm underline text-inherit" target="_blank" href="https://founderspledge.com/stories/mental-health-report-summary">Source: Founders Pledge</Link>
            </span>
          </p>
        ),
        link: 'https://strongminds.org/'
      },
    ]}
  />
);

export default Page;
