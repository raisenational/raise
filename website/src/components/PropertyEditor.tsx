import * as React from "react"
import { ResponseValues } from "axios-hooks"
import { useForm, useWatch, SubmitHandler } from "react-hook-form"

import Alert from "./Alert"
import Table from "./Table"
import Modal from "./Modal"
import { SectionTitle } from "./Section"
import Button from "./Button"
import { useRawAxios } from "./networking"

type InputType<V> = V extends string ?
  | "text" | "tel" | "email" // string
  : V extends number ?
  | "number" // number
  | "date" // custom number
  | "datetime-local" // custom number
  | "amount" // custom number (handle input as string)
  : V extends boolean ?
  | "checkbox" // boolean
  : V extends string[] ?
  | "select"
  | "multiselect"
  // Otherwise not editable
  : never

type PropertyDefinition<I, V> = {
  label?: string,
  formatter?: (v: V) => string,
  className?: string,
  editWarning?: string,
  inputType?: InputType<V>,
} & (V extends string[] ? { selectOptions: string[] } | { inputType?: undefined } : {})

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
  if ("loading" in item && (item as ResponseValues<I, unknown>).error) return <Alert variant="error">{(item as ResponseValues<I, unknown>).error}</Alert>

  // Normalized properties
  const nItem = ((item !== undefined && "loading" in item) ? (item as ResponseValues<I, unknown>).data : item) as I

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
  definition: Omit<PropertyDefinition<I, T>, "inputType"> & { inputType: InputType<T> },
  initialValue: T,
  onSave?: (data: T) => void | Promise<void>,
  patchEndpoint?: string,
}

const ifNaN = <T,>(n: number, otherwise: T): number | T => (Number.isNaN(n) ? otherwise : n)

const toInput = <T,>(raw: T, inputType: InputType<T>): string | boolean => {
  if (raw === undefined || raw === null) return ""
  if (inputType === "amount") return (raw as unknown as number / 100).toFixed(2)
  if (inputType === "date" || inputType === "datetime-local") return new Date((raw as unknown as number * 1000) - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 19)
  if (inputType === "checkbox") return raw as unknown as boolean
  return String(raw)
}

const fromInput = <T,>(raw: string | boolean, inputType: InputType<T>): T => {
  if (inputType === "text" || inputType === "tel" || inputType === "email") return raw as unknown as T
  if (inputType === "checkbox" || typeof raw === "boolean") return raw as unknown as T // NB: typeof raw === "boolean" if-and-only-if inputType === "checkbox"
  if (inputType === "number") return ifNaN(parseInt(raw, 10), null) as unknown as T
  if (inputType === "date" || inputType === "datetime-local") return ifNaN((new Date(raw).getTime()) / 1000, null) as unknown as T
  if (inputType === "amount") return ifNaN(Math.round(parseFloat(raw) * 100), null) as unknown as T
  // if (inputType === "select") return TODO as unknown as T
  // if (inputType === "multiselect") return TODO as unknown as T

  throw new Error(`Unsupported inputType ${inputType}`)
}

const LabelledInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { id: string, label: string }>(({
  id, label, className, type, ...rest
}, ref) => (
  <div className={className}>
    {type === "checkbox" && <input id={id} ref={ref} type={type} className="mt-1 mr-1 mb-3" {...rest} />}
    <label htmlFor={id} className="text-gray-700 font-bold">{label}</label>
    {type !== "checkbox" && <input id={id} ref={ref} type={type} className="w-full py-2 px-3 mt-1 mb-3 appearance-none block rounded border cursor-text transition-all text-gray-700 bg-gray-200 border-gray-200 hover:bg-gray-100 hover:border-gray-400 outline-none focus:border-gray-800 focus:bg-white" {...rest} />}
  </div>
))

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
  const onSubmit: SubmitHandler<{ value: string | boolean }> = (data) => {
    const value = fromInput<T>(data.value, definition.inputType)
    if (patchEndpoint !== undefined) {
      return axios.patch(patchEndpoint, { [property]: value })
        .then(() => { // TODO: confirmation it was successful would be nice
          if (onSave) return onSave(value)
          return undefined
        })
        .catch((err) => {
          if (err instanceof Error) setError(err)
          else setError(new Error(String(err)))
        })
    }
    if (onSave) return onSave(value)
    return undefined
  }
  const newValue = fromInput<T>(useWatch({ control, name: "value" }), definition.inputType)

  // TODO: handle string array as (multi-)select

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SectionTitle>Editing {definition.label ?? property}</SectionTitle>
      {definition.editWarning && <Alert variant="warning" className="mb-4">{definition.editWarning}</Alert>}
      <LabelledInput label={definition.label ?? property as string} id="editorValue" className="w-1/2" autoComplete="off" type={nInputType} step={nInputType === "number" ? "any" : undefined} {...register("value")} />
      <p>Current value: {definition.formatter ? definition.formatter(initialValue) : (initialValue ?? "—")}</p>
      <p>New value: {definition.formatter ? definition.formatter(newValue) : (newValue ?? "—")}</p>
      {error && <Alert className="mt-2">{error}</Alert>}
      <Button variant="blue" className="mt-4" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
    </form>
  )
}

export default PropertyEditor
