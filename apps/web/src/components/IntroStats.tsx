import classNames from 'clsx';
import Logo from './Logo';
import AnimatedNumber from './AnimatedNumber';

type Props = {
	title: string;
	tagline: string;
	statistics: {
		years: number;
		students: number;
		raised: number;
		protected: number;
	};
};

const IntroStats: React.FC<Props> = ({title, tagline, statistics}) => {
	return (
		<div>
			<Logo className='mb-8 w-24' />
			<h1 className='text-5xl lg:text-7xl font-raise-header font-black'>{title}</h1>
			<p className='text-2xl lg:text-3xl'>{tagline}</p>
			<div className='grid grid-cols-2 md:flex md:-skew-x-15 shadow-raise mt-8 rounded overflow-hidden font-light'>
				<Statistic value={statistics.years} description={statistics.years !== 1 ? 'years' : 'year'} className='bg-raise-purple' numberClassName='sm:w-10' durationMs={1000} />
				<Statistic value={statistics.students} description='students' className='bg-raise-red' numberClassName='sm:w-24' durationMs={2000} />
				<Statistic prefix='£' value={statistics.raised} description='raised' className='bg-raise-orange' numberClassName='sm:w-44' durationMs={3000} />
				<Statistic value={statistics.protected} description='people protected' className='bg-raise-yellow text-black' numberClassName='sm:w-44' durationMs={4000} />
			</div>
		</div>
	);
};

const Statistic: React.FC<{value: number; description: string; prefix?: string; durationMs?: number; className?: string; numberClassName?: string}> = ({
	value, description, prefix, durationMs, className, numberClassName,
}) => (
	<div className={classNames('flex-auto items-center p-2 md:py-3 text-center', className)}>
		<div className='md:skew-x-15'>
			<p className={classNames('text-3xl md:text-5xl stat-animate mx-auto', numberClassName)}>{prefix}<AnimatedNumber value={value} durationMs={durationMs} /></p>
			<p className='text-xl'>{description}</p>
		</div>
	</div>
);

export default IntroStats;
