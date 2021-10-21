import * as React from "react"
import { ResponseValues } from "axios-hooks"

import Alert from "./Alert"
import Table from "./Table"
import Modal from "./Modal"
import { Form, FormProps, InputType } from "./Form"

type PropertyDefinition<I, V> = {
  label?: string,
  formatter?: (v: V) => string,
  className?: string,
  warning?: string,
} & (
    | { inputType?: Exclude<InputType<V>, "select" | "multiselect"> }
    | { inputType: InputType<V> & ("select" | "multiselect"), selectOptions: string[] }
  )

interface Props<I> {
  definition: Partial<{ [K in keyof I]: PropertyDefinition<I, I[K]> }> & { [s: `_${string}`]: PropertyDefinition<I, unknown> },
  item?: I | ResponseValues<I, unknown>,
  onClick?: (key: keyof I, event: React.MouseEvent) => void,
  onSave?: (data: Partial<I>) => void | Promise<void>,
}

// I (the item type) should not have a loading prop, but there doesn't seem like a nice TS way to do this
const PropertyEditor = <I,>({
  definition, item, onClick, onSave,
}: Props<I>) => {
  const [editingProperty, setEditingProperty] = React.useState<keyof I | undefined>()

  // Loading and error states
  if (!item || ("loading" in item && item.loading)) return <div className="overflow-x-auto bg-black bg-opacity-20 rounded p-4"><span className="animate-pulse">Loading...</span></div>
  if ("loading" in item && item.error) return <Alert variant="error">{item.error}</Alert>
  if ("loading" in item && item.data === undefined) return <Alert variant="error">Data not found</Alert> // NB: A common cause of this is trying to find a new item you just created without refreshing the data (try useAxios.clearCache()).

  // Normalized properties
  const nItem = ((item !== undefined && "loading" in item) ? item.data : item) as I

  return (
    <>
      <Modal open={editingProperty !== undefined} onClose={() => { setEditingProperty(undefined) }}>
        {editingProperty && (
          <Form<Partial<I>>
            title={`Editing ${definition[editingProperty]?.label?.toLowerCase()}` ?? editingProperty}
            definition={{
              [editingProperty]: definition[editingProperty],
            } as unknown as FormProps<Partial<I>>["definition"]}
            initialValues={{
              [editingProperty]: nItem[editingProperty],
            } as FormProps<Partial<I>>["initialValues"]}
            onSubmit={async (data) => {
              if (onSave) await onSave(data)
              setEditingProperty(undefined)
              return undefined
            }}
          />
        )}
      </Modal>
      <Table
        definition={{
          label: { label: "Property" },
          value: { label: "Value" },
        }}
        // TODO: disable cursor-pointer for non-editable properties
        items={Object.entries(definition).map(([k, v]) => ({
          property: k as keyof I,
          label: v.label ?? k,
          value: v.formatter ? v.formatter(nItem[k as keyof I]) : (nItem[k as keyof I] ?? "—"),
        }))}
        onClick={(i, event) => {
          if (onClick) onClick(i.property, event)

          if (definition[i.property]?.inputType === undefined) {
            alert("This property is not editable")
            return
          }

          setEditingProperty(i.property)
        }}
        primaryKey="property"
      />
    </>
  )
}

export default PropertyEditor
