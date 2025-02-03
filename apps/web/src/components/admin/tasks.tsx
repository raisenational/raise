import TasksPanel from '../../components/TasksPanel';
import Section, {SectionTitle} from '../../components/Section';

const TasksPage: React.FC = () => {
	return (
		<Section>
			<div className='flex'>
				<SectionTitle className='flex-1'>Tasks</SectionTitle>
			</div>
			<TasksPanel />
		</Section>
	);
};

export default TasksPage;
