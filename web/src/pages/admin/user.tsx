import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { format } from '@raise/shared';
import { asResponseValues, useReq, useRawReq } from '../../helpers/networking';
import Section, { SectionTitle } from '../../components/Section';
import PropertyEditor from '../../components/PropertyEditor';
import { User } from '../../helpers/generated-api-client';

const UserPage: React.FC<RouteComponentProps & { userId: string }> = ({ userId }) => {
  const [users, refetchUsers] = useReq('get /admin/users');
  const [groups] = useReq('get /admin/groups');
  const groupMap = groups.data ? Object.fromEntries(groups.data.map((group) => [group.id, group.name])) : {};
  const req = useRawReq();

  const user = asResponseValues(users.data?.find((u) => u.id === userId), users);

  return (
    <Section>
      <div className="flex">
        <SectionTitle className="flex-1">{user.data?.name ?? 'User'}</SectionTitle>
      </div>
      <PropertyEditor<User>
        definition={{
          name: { label: 'Name', inputType: 'text' },
          email: { label: 'Email', inputType: 'text' },
          groups: {
            label: 'Groups', formatter: (ids?: string[]) => ids?.map((id) => groupMap[id]).join(', ') || '(none)', inputType: 'multiselect', selectOptions: groupMap,
          },
          securityTrainingCompletedAt: { label: 'Security training completed at', formatter: format.timestamp, inputType: 'datetime-local' },
        }}
        item={user}
        onSave={async (data) => {
          await req('patch /admin/users/{userId}', { userId }, data);
          refetchUsers();
        }}
      />
    </Section>
  );
};

export default UserPage;
