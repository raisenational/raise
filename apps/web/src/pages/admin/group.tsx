import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { asResponseValues, useReq, useRawReq } from '../../helpers/networking';
import Section, { SectionTitle } from '../../components/Section';
import PropertyEditor from '../../components/PropertyEditor';
import { Group } from '../../helpers/generated-api-client';

const GroupPage: React.FC<RouteComponentProps & { groupId: string }> = ({ groupId }) => {
  const [groups, refetchGroups] = useReq('get /admin/groups');
  const req = useRawReq();

  const group = asResponseValues(groups.data?.find((g) => g.id === groupId), groups);

  return (
    <Section>
      <div className="flex">
        <SectionTitle className="flex-1">{group.data?.name ?? 'Group'}</SectionTitle>
      </div>
      <PropertyEditor<Group>
        definition={{
          name: { label: 'Name', inputType: 'text' },
        }}
        item={group}
        onSave={async (data) => {
          await req('patch /admin/groups/{groupId}', { groupId }, data);
          refetchGroups();
        }}
      />
    </Section>
  );
};

export default GroupPage;
