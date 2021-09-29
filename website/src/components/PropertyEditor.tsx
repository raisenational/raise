import * as React from "react"
import { ResponseValues } from "axios-hooks"

import Alert from "./Alert"
import Table from "./Table"

interface PropertyDefinition<I, V> {
  label?: string,
  formatter?: (v: V, i: I) => string,
  className?: string,
}

interface Props<I> {
  definition: Partial<{ [K in keyof I]: PropertyDefinition<I, I[K]> }>,
  item?: I | ResponseValues<I, unknown>,
  onClick?: (key: keyof I, event: React.MouseEvent) => void,
}

// I should not have a loading prop, but there doesn't seem like a nice TS way to do this
const PropertyEditor = <I,>({ definition, item, onClick }: Props<I>) => {
  // Loading and error states
  if (!item || ("loading" in item && item.loading)) return <div className="overflow-x-auto bg-black bg-opacity-20 rounded p-4"><span className="animate-pulse">Loading...</span></div>
  if ("loading" in item && (item as ResponseValues<I, unknown>).error) return <Alert variant="error">{(item as ResponseValues<I, unknown>).error}</Alert>

  // Normalized properties
  const nItem = ((item !== undefined && "loading" in item) ? (item as ResponseValues<I, unknown>).data : item) as I

  return (
    <Table
      definition={{
        label: { label: "Property" },
        value: { label: "Value" },
      }}
      items={Object.entries(definition).map(([k, v]) => ({
        property: k as keyof I,
        label: v.label ?? k,
        value: v.formatter ? v.formatter(nItem[k as keyof I]) : nItem[k as keyof I],
      }))}
      onClick={onClick === undefined ? undefined : (i, event) => onClick(i.property, event)}
      primaryKey="property"
    />
  )
}

export default PropertyEditor
