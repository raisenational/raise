import {useRouter} from 'next/router';
import {PlusSmIcon} from '@heroicons/react/outline';
import {fixedGroups} from '@raise/shared';
import {useState} from 'react';
import {
	asResponseValues, useReq, useRawReq,
} from '../../helpers/networking';
import Section, {SectionTitle} from '../../components/Section';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import {Form} from '../../components/Form';
import {RequireGroup} from '../../helpers/security';
import {
	type GroupCreation,
} from '../../helpers/generated-api-client';
import UsersPanel from '../../components/UsersPanel';

const UsersPage: React.FC = () => {
	const [groups, refetchGroups] = useReq('get /admin/groups');
	const [newGroupModalOpen, setNewGroupModalOpen] = useState(false);
	const req = useRawReq();
	const router = useRouter();

	return (
		<>
			<RequireGroup group={fixedGroups.National}>
				<UsersPanel />
			</RequireGroup>
			<Section>
				<div className='flex'>
					<SectionTitle className='flex-1'>Groups</SectionTitle>
					<RequireGroup group={fixedGroups.National}>
						<Button onClick={() => {
							setNewGroupModalOpen(true);
						}}>
							<PlusSmIcon className='h-6 mb-1' />
							{' '}
							New
							{' '}
							<span className='hidden lg:inline'>group</span>
						</Button>
					</RequireGroup>
				</div>
				<Modal open={newGroupModalOpen} onClose={() => {
					setNewGroupModalOpen(false);
				}}>
					<Form<GroupCreation>
						title='New group'
						definition={{
							name: {label: 'Name', inputType: 'text'},
						}}
						initialValues={{
							name: '',
						}}
						showCurrent={false}
						onSubmit={async (data) => {
							const groupId = (await req('post /admin/groups', data)).data;
							await refetchGroups();
							void router.push(`/admin/groups/${groupId}/`);
						}}
					/>
				</Modal>
				<Table
					className='mb-8'
					definition={{
						name: {label: 'Name', className: 'whitespace-nowrap'},
					}}

					items={asResponseValues(groups.data?.sort((a, b) => (b.name === a.name ? 0 : (b.name > a.name ? 1 : -1))), groups)}
					href={(group) => `/admin/?page=group&groupId=${group.id}`}
				/>
			</Section>
		</>
	);
};

export default UsersPage;
