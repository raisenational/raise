import * as React from "react"
import { RouteComponentProps } from "@reach/router"
import {
  AuditLog, AuditLogs, format,
} from "@raise/shared"
import { FormProvider, useForm } from "react-hook-form"
import jsonexport from "jsonexport/dist"
import { DownloadIcon } from "@heroicons/react/outline"
import { useAxios } from "../../helpers/networking"
import Section, { SectionTitle } from "../../components/Section"
import Table from "../../components/Table"
import { LabelledInput } from "../../components/Form"
import Button from "../../components/Button"
import { RequireGroup } from "../../helpers/security"
import Alert from "../../components/Alert"

const AuditPage: React.FC<RouteComponentProps> = () => {
  const [auditLogs, fetchAuditLogs] = useAxios<AuditLogs>("", { manual: true })

  const formMethods = useForm<{ queryType: "object" | "subject", query: string }>({
    defaultValues: {
      queryType: "object",
      query: "",
    },
  })

  const onSubmit = async (q: { queryType: "object" | "subject", query: string }) => {
    try {
      await fetchAuditLogs({ url: `/admin/audit-logs/by-${q.queryType}/${q.query}` })
    } catch { /* noop, we handle errors in table */ }
  }

  const downloadAsCSV = auditLogs.data ? async () => {
    const csv = auditLogs.data && await jsonexport(auditLogs.data.map((d) => ({ ...d, metadata: JSON.stringify(d.metadata) })))
    if (csv) {
      const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csv}`)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `${formMethods.getValues("queryType")}-${formMethods.getValues("query")}-audit-logs.csv`)
      document.body.appendChild(link)
      link.click()
    }
  } : undefined

  return (
    <Section>
      <RequireGroup group="National" otherwise={<Alert variant="error">You don't have permission to access this page</Alert>}>
        <div className="flex">
          <SectionTitle className="flex-1">Audit Logs</SectionTitle>
          <Button onClick={downloadAsCSV}><DownloadIcon className="h-6 mb-1" /> CSV</Button>
        </div>
        <FormProvider {...formMethods}>
          <form className="grid sm:grid-cols-[minmax(0,_1fr)_minmax(0,_2fr)] gap-4" onSubmit={formMethods.handleSubmit(onSubmit)}>
            <LabelledInput id="queryType" label={<span className="text-white">Search by</span>} type="select" options={["object", "subject"]} {...formMethods.register("queryType")} />
            <LabelledInput
              id="query"
              label={<span className="text-white">Query (hit enter to search)</span>}
              error={formMethods.formState.errors.query?.message}
              type="text"
              {...formMethods.register("query", {
                validate: (s: string): string | true => {
                  if (!s) return "Query must not be empty"
                  return true
                },
              })}
            />
          </form>
        </FormProvider>
        <Table<AuditLog>
          className="mt-4"
          definition={{
            at: { label: "At", formatter: format.timestamp, className: "whitespace-nowrap" },
            subject: { label: "Subject", className: "whitespace-nowrap" },
            object: { label: "Object", className: "whitespace-nowrap" },
            action: { label: "Action", className: "whitespace-nowrap" },
            sourceIp: { label: "IP address", className: "whitespace-nowrap" },
            metadata: { label: "Metadata", formatter: format.json },
            routeRaw: { label: "Route", className: "whitespace-nowrap" },
          }}
          items={auditLogs}
        />
      </RequireGroup>
    </Section>
  )
}

export default AuditPage
