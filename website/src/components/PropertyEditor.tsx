import * as React from "react"
import { ResponseValues } from "axios-hooks"
import { useForm, useWatch, SubmitHandler } from "react-hook-form"

import Alert from "./Alert"
import Table from "./Table"
import Modal from "./Modal"
import { SectionTitle } from "./Section"
import Button from "./Button"
import { useRawAxios } from "./networking"
import {
  fromInput, InputType, LabelledInput, toInput,
} from "./Form"

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
  onSave?: (property: keyof I, data: I[keyof I]) => void | Promise<void>,
  patchEndpoint?: string,
}

// I (the item type) should not have a loading prop, but there doesn't seem like a nice TS way to do this
const PropertyEditor = <I,>({
  definition, item, onClick, onSave, patchEndpoint,
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
        {editingProperty !== undefined && <Editor property={editingProperty} definition={definition[editingProperty] as EditorProps<I, I[keyof I]>["definition"]} initialValue={nItem[editingProperty]} onSave={(data) => { setEditingProperty(undefined); if (onSave) onSave(editingProperty, data) }} patchEndpoint={patchEndpoint} />}
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

interface EditorProps<I, T> {
  property: keyof I,
  definition: Exclude<PropertyDefinition<I, T>, "inputType"> & (
    | { inputType: Exclude<InputType<T>, "select" | "multiselect"> }
    | { inputType: InputType<T> & ("select" | "multiselect"), selectOptions: string[] }
  ),
  initialValue: T,
  onSave?: (data: T) => void | Promise<void>,
  patchEndpoint?: string,
}

const Editor = <I, T>({
  property, definition, initialValue, onSave, patchEndpoint,
}: EditorProps<I, T>) => {
  const [error, setError] = React.useState<Error | undefined>()
  const axios = useRawAxios()
  const nInputType = definition.inputType === "amount" ? "number" : definition.inputType as React.HTMLInputTypeAttribute
  const nDefaultValue = toInput<T>(initialValue, definition.inputType)
  const {
    register, handleSubmit, control, formState: { isSubmitting },
  } = useForm({ defaultValues: { value: nDefaultValue } })
  // @ts-ignore
  const newValue = fromInput<T>(useWatch({ control, name: "value" }), definition.inputType, definition.selectOptions)
  const internalOnSubmit: SubmitHandler<{ value: string | boolean }> = () => {
    try {
      if (patchEndpoint !== undefined) {
        return axios.patch(patchEndpoint, { [property]: newValue })
          .then(() => { // TODO: confirmation it was successful would be nice
            if (onSave) return onSave(newValue)
            return undefined
          })
          .catch((err) => {
            if (err instanceof Error) setError(err)
            else setError(new Error(String(err)))
          })
      }
      if (onSave) return onSave(newValue)
      return undefined
    } catch (err) {
      if (err instanceof Error) setError(err)
      else setError(new Error(String(err)))
      return undefined
    }
  }

  // TODO: handle string array as (multi-)select

  return (
    <form onSubmit={handleSubmit(internalOnSubmit)}>
      <SectionTitle>Editing {definition.label?.toLowerCase() ?? property}</SectionTitle>
      {definition.warning && <Alert variant="warning" className="mb-4">{definition.warning}</Alert>}
      <LabelledInput label={definition.label ?? property as string} id="editorValue" className="w-1/2" autoComplete="off" type={nInputType} step={nInputType === "number" ? "any" : undefined} {...register("value")} />
      <p>Current value: {definition.formatter ? definition.formatter(initialValue) : (initialValue ?? "—")}</p>
      <p>New value: {definition.formatter ? definition.formatter(newValue) : (newValue ?? "—")}</p>
      {error && <Alert className="mt-2">{error}</Alert>}
      <Button variant="blue" className="mt-4" onClick={handleSubmit(internalOnSubmit)} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
    </form>
  )
}

export default PropertyEditor
