import { RouteComponentProps } from '@gatsbyjs/reach-router';

import { format } from '@raise/shared';
import Section, { SectionTitle } from '../../components/Section';
import PropertyEditor from '../../components/PropertyEditor';
import { useReq } from '../../helpers/networking';

const ProfilePage: React.FC<RouteComponentProps> = () => {
  const [profile] = useReq('get /admin/login');
  const [groups] = useReq('get /admin/groups');
  const groupMap = groups.data ? Object.fromEntries(groups.data.map((group) => [group.id, group.name])) : {};

  return (
    <Section>
      <SectionTitle>Profile</SectionTitle>
      <PropertyEditor
        definition={{
          email: { label: 'Email' },
          groups: { label: 'Groups with access', formatter: (ids?: string[]) => ids?.map((id) => groupMap[id]).join(', ') || '(none)' },
          issuedAt: { label: 'Logged in at', formatter: format.timestamp },
          expiresAt: { label: 'Login expires at', formatter: format.timestamp },
          sourceIp: { label: 'IP address' },
        }}
        item={profile}
      />
    </Section>
  );
};

export default ProfilePage;
