import {asResponseValues, useReq, useRawReq} from '../../helpers/networking';
import Section, {SectionTitle} from '../../components/Section';
import PropertyEditor from '../../components/PropertyEditor';

const GroupPage: React.FC<{groupId: string}> = ({groupId}) => {
	const [groups, refetchGroups] = useReq('get /admin/groups');
	const req = useRawReq();

	const group = asResponseValues(groups.data?.find((g) => g.id === groupId), groups);

	return (
		<Section>
			<div className='flex'>
				<SectionTitle className='flex-1'>{group.data?.name ?? 'Group'}</SectionTitle>
			</div>
			<PropertyEditor
				definition={{
					name: {label: 'Name', inputType: 'text'},
				}}
				item={group}
				onSave={async (data) => {
					await req('patch /admin/groups/{groupId}', {groupId}, data);
					void refetchGroups();
				}}
			/>
		</Section>
	);
};

export default GroupPage;
