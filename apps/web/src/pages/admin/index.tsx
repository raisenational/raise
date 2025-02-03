import Head from 'next/head';
import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';
import Navigation from '../../components/Navigation';
import {useAuthState} from '../../helpers/networking';
import Alert from '../../components/Alert';
import Section from '../../components/Section';
import Spinner from '../../components/Spinner';
import {helpLink} from '../../components/admin/_helpLink';

import Login from '../../components/admin/login';
import FundraisersPage from '../../components/admin/fundraisers';
import FundraiserPage from '../../components/admin/fundraiser';
import DonationPage from '../../components/admin/donation';
import PaymentPage from '../../components/admin/payment';
import ProfilePage from '../../components/admin/profile';
import TasksPage from '../../components/admin/tasks';
import AuditPage from '../../components/admin/audit';
import UsersPage from '../../components/admin/users';
import UserPage from '../../components/admin/user';
import GroupPage from '../../components/admin/group';

const IndexPage = () => (
	<>
		<Head>
			<title>Raise Admin</title>
			<meta property='og:title' content='Raise Admin' />
			<meta name='robots' content='noindex' />
		</Head>
		<IndexLayout />
	</>
);

const IndexLayout = () => {
	const [auth, setAuth] = useAuthState();
	const [logoutWarning, setLogoutWarning] = useState<string | undefined>();
	// This logs out the user when their access token expires
	useEffect(() => {
		if (typeof auth?.refreshToken.expiresAt !== 'number') {
			return undefined;
		}

		const msUntilExpiration = (auth.refreshToken.expiresAt * 1000) - Date.now();

		if (msUntilExpiration > 60_000) {
			setLogoutWarning(undefined);
		}

		const warningTimeout = setTimeout(() => {
			setLogoutWarning('You will be logged out in the next minute');
		}, msUntilExpiration - 60_000);

		return () => {
			clearTimeout(warningTimeout);
		};
	}, [auth?.refreshToken.expiresAt]);

	const router = useRouter();

	// This ensures server-side rendering + hydration does not cause weirdness on these authenticated pages
	const [hasMounted, setHasMounted] = useState(false);
	useEffect(() => {
		setHasMounted(true);
	}, []);
	if (!hasMounted) {
		return null;
	}

	const hasActiveLoginToken = auth && auth.accessToken.expiresAt > ((Date.now() / 1000) + 10);
	return (
		<>
			{auth && hasActiveLoginToken && (
				<main className='text-left mb-8'>
					<Navigation
						left={[
							{text: 'Fundraisers', href: '/admin/'},
							{text: 'Tasks', href: '/admin/?page=tasks'},
							{text: 'Audit', href: '/admin/?page=audit'},
							{text: 'Users', href: '/admin/?page=users'},
							{text: 'Profile', href: '/admin/?page=profile'},
							{text: 'Help', href: helpLink},
						]}
						right={[
							{
								text: 'Logout', onClick() {
									setAuth();
								},
							},
						]}
					/>
					{logoutWarning && (
						<Section>
							<Alert variant='warning'>{logoutWarning}</Alert>
						</Section>
					)}
					{!router.query.page && <FundraisersPage />}
					{router.query.page === 'fundraiser' && <FundraiserPage fundraiserId={expectString(router.query.fundraiserId)} />}
					{router.query.page === 'donation' && <DonationPage fundraiserId={expectString(router.query.fundraiserId)} donationId={expectString(router.query.donationId)} />}
					{router.query.page === 'payment' && <PaymentPage fundraiserId={expectString(router.query.fundraiserId)} donationId={expectString(router.query.donationId)} paymentId={expectString(router.query.paymentId)} />}
					{router.query.page === 'tasks' && <TasksPage />}
					{router.query.page === 'audit' && <AuditPage />}
					{router.query.page === 'users' && <UsersPage />}
					{router.query.page === 'user' && <UserPage userId={expectString(router.query.userId)} />}
					{router.query.page === 'group' && <GroupPage groupId={expectString(router.query.groupId)} />}
					{router.query.page === 'profile' && <ProfilePage />}
				</main>
			)}
			{auth && !hasActiveLoginToken && <LoadingPage />}
			{!auth && <Login />}
		</>
	);
};

const LoadingPage: React.FC = () => {
	return (
		<div className='flex justify-center gap-4 py-24'>
			<span>Logging in...</span>
			<Spinner />
		</div>
	);
};

const expectString = (v: unknown): string => {
	if (typeof v !== 'string') {
		throw new Error('Invalid or missing URL parameter');
	}

	return v;
};

export default IndexPage;
