import * as React from "react"
import {
  Path, SubmitHandler, UnpackNestedValue, useForm, useWatch,
} from "react-hook-form"
import Alert from "./Alert"
import Button from "./Button"
import { SectionTitle } from "./Section"

export type InputType<V> = V extends string ?
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

const ifNaN = <T,>(n: number, otherwise: T): number | T => (Number.isNaN(n) ? otherwise : n)

export const toInput = <T,>(raw: T, inputType: InputType<T>): string | boolean => {
  if (raw === undefined || raw === null) return ""
  if (inputType === "amount") return (raw as unknown as number / 100).toFixed(2)
  if (inputType === "date" || inputType === "datetime-local") return new Date((raw as unknown as number * 1000) - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 19)
  if (inputType === "checkbox") return raw as unknown as boolean
  return String(raw)
}

export const fromInput = <T,>(raw: string | boolean, inputType: InputType<T>): T => {
  if (inputType === "text" || inputType === "tel" || inputType === "email") return (raw === "" ? null : raw) as unknown as T
  if (inputType === "checkbox" || typeof raw === "boolean") return raw as unknown as T // NB: typeof raw === "boolean" if-and-only-if inputType === "checkbox"
  if (inputType === "number") return ifNaN(parseInt(raw, 10), null) as unknown as T
  if (inputType === "date" || inputType === "datetime-local") return ifNaN((new Date(raw).getTime()) / 1000, null) as unknown as T
  if (inputType === "amount") return ifNaN(Math.round(parseFloat(raw) * 100), null) as unknown as T
  // if (inputType === "select") return TODO as unknown as T
  // if (inputType === "multiselect") return TODO as unknown as T

  throw new Error(`Unsupported inputType ${inputType}`)
}

export const LabelledInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { id: string, label: string }>(({
  id, label, className, type, ...rest
}, ref) => (
  <div className={className}>
    {type === "checkbox" && <input id={id} ref={ref} type={type} className="mt-1 mr-1 mb-3" {...rest} />}
    <label htmlFor={id} className="text-gray-700 font-bold">{label}</label>
    {type !== "checkbox" && <input id={id} ref={ref} type={type} className="w-full py-2 px-3 mt-1 mb-1 appearance-none block rounded border cursor-text transition-all text-gray-700 bg-gray-200 border-gray-200 hover:bg-gray-100 hover:border-gray-400 outline-none focus:border-gray-800 focus:bg-white" {...rest} />}
  </div>
))

type PropertyDefinition<T, V> = {
  label?: string,
  formatter?: (v: V) => string,
  warning?: string,
  inputType: InputType<V>,
} & (V extends string[] ? { selectOptions: string[] } : {})

interface FormProps<T> {
  title?: string,
  warning?: string,
  definition: { [K in keyof UnpackNestedValue<T>]: PropertyDefinition<UnpackNestedValue<T>, UnpackNestedValue<T>[K]> },
  initialValues: UnpackNestedValue<T>,
  showCurrent?: boolean,
  onSubmit: (item: UnpackNestedValue<T>) => void,
}

export const Form = <T,>({
  title, warning, definition, initialValues, showCurrent = true, onSubmit,
}: FormProps<T>) => {
  const [error, setError] = React.useState<Error | undefined>()
  // TODO: support direct post/patch endpoint calling
  // const axios = useRawAxios()

  const {
    register, handleSubmit, control, formState: { isSubmitting },
  } = useForm<T>({ defaultValues: initialValues })
  const newValues = useWatch({ control }) as UnpackNestedValue<T>

  const internalOnSubmit: SubmitHandler<T> = (data) => {
    // TODO: translate all data through fromInput
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {title !== undefined && <SectionTitle>{title}</SectionTitle>}
      {warning !== undefined && <Alert>{warning}</Alert>}
      {Object.entries(definition).map(([_k, _v], i, arr) => {
        const k = _k as keyof UnpackNestedValue<T>
        const v = _v as PropertyDefinition<UnpackNestedValue<T>, UnpackNestedValue<T>[keyof UnpackNestedValue<T>]>
        const nInputType = v.inputType === "amount" ? "number" : v.inputType as React.HTMLInputTypeAttribute

        return (
          <div className={i === arr.length - 1 ? "mb-2" : "mb-8"}>
            {v.warning && <Alert variant="warning" className="mb-4">{v.warning}</Alert>}
            <LabelledInput label={v.label ?? String(k)} id="editorValue" autoComplete="off" type={nInputType} step={nInputType === "number" ? "any" : undefined} {...register(k as Path<T>)} />
            {showCurrent && <p>Current value: {v.formatter ? v.formatter(initialValues[k]) : (initialValues[k] ?? "—")}</p>}
            <p>New value: {v.formatter ? v.formatter(newValues[k]) : (newValues[k] ?? "—")}</p>
          </div>
        )
      })}
      {error && <Alert className="mt-2">{error}</Alert>}
      <Button variant="blue" className="mt-4" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</Button>
    </form>
  )
}
