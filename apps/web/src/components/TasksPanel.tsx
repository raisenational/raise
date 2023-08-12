import { useState } from 'react';
import { useReq } from '../helpers/networking';
import { SectionTitle } from './Section';
import Table from './Table';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import { Task } from '../helpers/generated-api-client';

const TasksPanel: React.FC = () => {
  const [selected, setSelected] = useState<Task | undefined>();
  const [tasks] = useReq('get /admin/tasks');
  const [runResult, runTask] = useReq('post /admin/tasks/{taskId}', { taskId: selected?.id ?? '' }, { manual: true });

  const taskItems = ((tasks === undefined || Array.isArray(tasks)) ? tasks : tasks.data) ?? [];
  return (
    <>
      <Modal open={!!selected} onClose={() => { setSelected(undefined); }}>
        <SectionTitle>{selected?.name}</SectionTitle>
        <Button
          variant="blue"
          onClick={async () => {
            try {
              await runTask();
            } catch {
              // errors handled by useReq hook logic
            }
          }}
          disabled={runResult.loading}
        >
          Run task
        </Button>
        {!runResult.loading && runResult && (runResult.response?.config.url === `/admin/tasks/${selected?.id}` || runResult.error?.response?.config.url === `/admin/tasks/${selected?.id}`) && (
          runResult.error
            ? <Alert className="mt-4" variant="error">{runResult.error}</Alert>
            : <Alert className="mt-4" variant="success">Task ran successfully</Alert>
        )}
      </Modal>
      {(taskItems.length === 0)
        ? <Alert> You do not have access to any Tasks</Alert>
        : (
          <Table<Task>
            definition={{
              name: { label: 'Name', className: 'whitespace-nowrap' },
              id: { label: 'ID', className: 'whitespace-nowrap' },
            }}
            items={tasks}
            onClick={(task) => setSelected(task)}
          />
        )}
    </>
  );
};

export default TasksPanel;
