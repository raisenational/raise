import classNames from "classnames"
import * as React from "react"
import {
  Path, SubmitHandler, UnpackNestedValue, useForm, useWatch,
} from "react-hook-form"
import Alert from "./Alert"
import Button from "./Button"
import { SectionTitle } from "./Section"

// TODO: fix the typing in this file

export type InputType<V> = "hidden" | (
  | V extends string ?
  | "text"
  | "tel"
  | "email"
  | "select"
  : V extends number ?
  | "number"
  | "date" // epoch timestamp
  | "datetime-local" // epoch timestamp
  | "amount" // in pence
  : V extends boolean ?
  | "checkbox"
  : V extends string[] ?
  | "multiselect"
  // Otherwise not editable
  : never)

const ifNaN = <T,>(n: number, otherwise: T): number | T => (Number.isNaN(n) ? otherwise : n)

export const toInput = <T,>(raw: T, inputType: InputType<T>): string | boolean => {
  if (raw !== undefined && inputType === "hidden") return JSON.stringify(raw)
  if (raw === undefined || raw === null) return ""
  if (inputType === "amount") return (raw as unknown as number / 100).toFixed(2)
  if (inputType === "date" || inputType === "datetime-local") return new Date((raw as unknown as number * 1000) - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 19)
  if (inputType === "checkbox") return raw as unknown as boolean
  if (inputType === "multiselect") return (raw as unknown as string[]).join(",") as unknown as boolean
  return String(raw)
}

export const fromInput = <T,>(raw: string | boolean, inputType: InputType<T>, selectOptions: T extends string[] ? string[] : undefined): T => {
  if (inputType === "hidden") return raw === "" ? undefined : JSON.parse(raw as string)
  if (inputType === "text" || inputType === "tel" || inputType === "email") return (raw === "" ? null : raw) as unknown as T
  if (inputType === "checkbox" || typeof raw === "boolean") return raw as unknown as T // NB: typeof raw === "boolean" if-and-only-if inputType === "checkbox"
  if (inputType === "number") return ifNaN(parseInt(raw, 10), null) as unknown as T
  if (inputType === "date" || inputType === "datetime-local") return ifNaN((new Date(raw).getTime()) / 1000, null) as unknown as T
  if (inputType === "amount") return ifNaN(Math.round(parseFloat(raw) * 100), null) as unknown as T
  if (inputType === "select" && selectOptions) return (selectOptions.includes(raw) ? raw : null) as unknown as T // NB: selectOptions !== undefined if typeof raw === "select"
  if (inputType === "multiselect" && selectOptions) return (raw.split(",").filter((v) => selectOptions.includes(v))) as unknown as T // NB: selectOptions !== undefined if typeof raw === "multiselect"

  return raw as unknown as T
}

// Not very confident in the actual type safety of this function, especially given the high usage of "as"
const objMap = <T extends { [K in keyof T]: V }, U, V>(obj: T, mapper: (k: keyof T, v: V) => U): { [K in keyof T]: U } => {
  const newObj = {} as { [K in keyof T]: U }
  Object.entries(obj).forEach(([k, v]) => {
    newObj[k as keyof T] = mapper(k as keyof T, v as V)
  })
  return newObj
}

// @ts-ignore
const mapToInput = <T,>(item: UnpackNestedValue<T>, definition: FormProps<T>["definition"]): UnpackNestedValue<T> => objMap(item, (k, v) => toInput(v, definition[k].inputType))
// @ts-ignore
const mapFromInput = <T,>(item: UnpackNestedValue<T>, definition: FormProps<T>["definition"]): UnpackNestedValue<T> => objMap(item, (k, v) => fromInput(v, definition[k].inputType, definition[k].selectOptions))

// TODO: properly support select and multiselect inputs. Maybe https://github.com/tailwindlabs/headlessui/pull/648?
export const LabelledInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { id: string, label: string }>(({
  id, label, className, type, ...rest
}, ref) => (
  <div className={className}>
    {type === "checkbox" && <input id={id} ref={ref} type={type} className="mt-1 mr-1 mb-3" {...rest} />}
    <label htmlFor={id} className={classNames("text-gray-700 font-bold", { "block pb-1": type !== "checkbox" })}>{label}</label>
    {type !== "checkbox" && <input id={id} ref={ref} type={type} className="w-full py-2 px-3 mb-1 appearance-none block rounded border cursor-text transition-all text-gray-700 bg-gray-200 border-gray-200 hover:bg-gray-100 hover:border-gray-400 outline-none focus:border-gray-800 focus:bg-white" {...rest} />}
  </div>
))

type PropertyDefinition<V> = {
  label?: string,
  formatter?: (v: V) => string,
  warning?: string,
} & (
    | { inputType: Exclude<InputType<V>, "select" | "multiselect"> }
    | { inputType: InputType<V> & ("select" | "multiselect"), selectOptions: string[] }
  )

interface FormProps<T> {
  title?: string,
  warning?: string,
  definition: { [K in keyof UnpackNestedValue<T>]: PropertyDefinition<UnpackNestedValue<T>[K]> },
  initialValues: UnpackNestedValue<T>,
  showCurrent?: boolean,
  onSubmit: (item: UnpackNestedValue<T>) => void | Promise<void>,
}

export const Form = <T,>({
  title, warning, definition, initialValues, showCurrent = true, onSubmit,
}: FormProps<T>) => {
  const [error, setError] = React.useState<Error | undefined>()
  const {
    register, handleSubmit, control, formState: { isSubmitting },
  } = useForm<T>({ defaultValues: mapToInput(initialValues, definition) })
  const newValues = mapFromInput(useWatch({ control }) as UnpackNestedValue<T>, definition)

  const internalOnSubmit: SubmitHandler<T> = () => {
    try {
      const promise = onSubmit(newValues)
      if (promise) {
        promise.catch((err) => {
          if (err instanceof Error) setError(err)
          else setError(new Error(String(err)))
        })
      }
    } catch (err) {
      if (err instanceof Error) setError(err)
      else setError(new Error(String(err)))
    }
  }

  return (
    <form onSubmit={handleSubmit(internalOnSubmit)}>
      {title !== undefined && <SectionTitle>{title}</SectionTitle>}
      {warning !== undefined && <Alert>{warning}</Alert>}
      {Object.entries(definition).map(([_k, _v], i, arr) => {
        const k = _k as keyof UnpackNestedValue<T> & Path<T>
        const v = _v as PropertyDefinition<UnpackNestedValue<T>[keyof UnpackNestedValue<T>]>
        const nInputType = v.inputType === "amount" ? "number" : v.inputType as React.HTMLInputTypeAttribute
        if (nInputType === "hidden") {
          return <input type="hidden" {...register(k)} />
        }

        return (
          <div key={k} className={i === arr.length - 1 ? "mb-2" : "mb-8"}>
            {v.warning && <Alert variant="warning" className="mb-4">{v.warning}</Alert>}
            <LabelledInput label={v.label ?? String(k)} id={String(k)} autoComplete="off" type={nInputType} step={nInputType === "number" ? "any" : undefined} {...register(k)} />
            {showCurrent && <p>Current value: {v.formatter ? v.formatter(initialValues[k]) : (initialValues[k] ?? "—")}</p>}
            <p>New value: {v.formatter ? v.formatter(newValues[k]) : (newValues[k] ?? "—")}</p>
          </div>
        )
      })}
      {error && <Alert className="mt-2">{error}</Alert>}
      <Button variant="blue" className="mt-4" onClick={handleSubmit(internalOnSubmit)} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</Button>
    </form>
  )
}
