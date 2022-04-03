import * as React from "react"
import { RouteComponentProps } from "@gatsbyjs/reach-router"
import { Task } from "@raise/shared"
import { useAxios } from "../../helpers/networking"
import Section, { SectionTitle } from "../../components/Section"
import Table from "../../components/Table"
import Modal from "../../components/Modal"
import Button from "../../components/Button"
import Alert from "../../components/Alert"

const TasksPage: React.FC<RouteComponentProps> = () => {
  const [selected, setSelected] = React.useState<Task | undefined>()
  const [tasks] = useAxios<Task[]>("/admin/tasks")
  const [runResult, runTask] = useAxios<undefined>({ url: `/admin/tasks/${selected?.id}`, method: "post" }, { manual: true })

  return (
    <Section>
      <div className="flex">
        <SectionTitle className="flex-1">Tasks</SectionTitle>
      </div>
      <Modal open={!!selected} onClose={() => { setSelected(undefined) }}>
        <SectionTitle>{selected?.name}</SectionTitle>
        <Button
          variant="blue"
          onClick={async () => {
            try {
              await runTask()
            } catch {
              // errors handled by axios hook logic
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
      <Table<Task>
        definition={{
          name: { label: "Name", className: "whitespace-nowrap" },
          id: { label: "ID", className: "whitespace-nowrap" },
        }}
        items={tasks}
        onClick={(task) => setSelected(task)}
      />
    </Section>
  )
}

export default TasksPage
