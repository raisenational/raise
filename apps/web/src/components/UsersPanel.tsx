import {useRouter} from 'next/router';
import {PlusSmIcon} from '@heroicons/react/outline';
import {fixedGroups, format} from '@raise/shared';
import {useState} from 'react';
import {
	asResponseValues, useReq, useRawReq,
} from '../helpers/networking';
import Section, {SectionTitle} from './Section';
import Table from './Table';
import Button from './Button';
import Modal from './Modal';
import {Form} from './Form';
import {RequireGroup} from '../helpers/security';
import {type UserCreation} from '../helpers/generated-api-client';

const UsersPanel: React.FC = () => {
	const [users, refetchUsers] = useReq('get /admin/users');
	const [groups] = useReq('get /admin/groups');
	const groupMap = groups.data ? Object.fromEntries(groups.data.map((group) => [group.id, group.name])) : {};
	const [newUserModalOpen, setNewUserModalOpen] = useState(false);
	const req = useRawReq();
	const router = useRouter();

	return (
		<Section>
			<div className='flex'>
				<SectionTitle className='flex-1'>Users</SectionTitle>
				<RequireGroup group={fixedGroups.National}>
					<Button onClick={() => {
						setNewUserModalOpen(true);
					}}>
						<PlusSmIcon className='h-6 mb-1' />
						{' '}
						New
						{' '}
						<span className='hidden lg:inline'>user</span>
					</Button>
				</RequireGroup>
			</div>
			<Modal open={newUserModalOpen} onClose={() => {
				setNewUserModalOpen(false);
			}}>
				<Form<UserCreation>
					title='New user'
					definition={{
						name: {label: 'Name', inputType: 'text'},
						email: {label: 'Email', inputType: 'text'},
						groups: {
							// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
							label: 'Groups', formatter: (ids?: string[]) => ids?.map((id) => groupMap[id]).join(', ') || '(none)', inputType: 'multiselect', selectOptions: groupMap,
						},
						securityTrainingCompletedAt: {label: 'Security training completed at', formatter: format.timestamp, inputType: 'datetime-local'},
						sendAccountCreationEmail: {label: 'Send user email', formatter: format.boolean, inputType: 'checkbox'},
					}}
					initialValues={{
						name: '',
						email: '',
						groups: [],
						sendAccountCreationEmail: true,
						securityTrainingCompletedAt: Math.floor(new Date().getTime() / 1000),
					}}
					showCurrent={false}
					onSubmit={async (data) => {
						const userId = (await req('post /admin/users', data)).data;
						await refetchUsers();
						void router.push(`/admin/?page=user&userId=${userId}`);
					}}
				/>
			</Modal>
			<Table
				className='mb-8'
				definition={{
					name: {label: 'Name', className: 'whitespace-nowrap'},
					email: {label: 'Email', className: 'whitespace-nowrap'},
					// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
					groups: {label: 'Groups', formatter: (ids?: string[]) => ids?.map((id) => groupMap[id]).join(', ') || '(none)'},
				}}

				items={asResponseValues(users.data?.sort((a, b) => (a.name === b.name ? 0 : (a.name > b.name ? 1 : -1))), users)}
				href={(user) => `/admin/?page=user&userId=${user.id}`}
			/>
		</Section>
	);
};

export default UsersPanel;
