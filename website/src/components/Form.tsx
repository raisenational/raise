import { Listbox } from "@headlessui/react"
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/outline"
import classNames from "classnames"
import * as React from "react"
import {
  Controller,
  FormProvider,
  Path, SubmitHandler, UnpackNestedValue, useForm, useFormContext, useWatch,
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

export type LabelledInputProps = React.InputHTMLAttributes<HTMLInputElement> & { id: string, label: string } & ({
  type: "select" | "multiselect", // | "radio",
  options: string[] | Record<string, string | null>,
  prefix?: never,
  suffix?: never,
} | {
  type: "checkbox" | "hidden",
  options?: never,
  prefix?: never,
  suffix?: never,
} | {
  type: "date" | "datetime-local" | "email" | "number" | "password" | "tel" | "text" | "url",
  options?: never,
  prefix?: string,
  suffix?: string,
})

// TODO: properly support multiselect inputs. Maybe https://github.com/tailwindlabs/headlessui/pull/648?
// TODO: support radio inputs
// TODO: properly support prefix and suffix
export const LabelledInput = React.forwardRef<HTMLInputElement, LabelledInputProps>(({
  id, label, className, type, options, prefix, suffix, ...rest
}, ref) => {
  if (type === "hidden") return <input id={id} ref={ref} type={type} className={className} {...rest} />

  if (type === "select") {
    const formContext = useFormContext()

    if (!formContext) {
      const [value, setValue] = React.useState<string | undefined>(rest.value as string | undefined)
      return (
        <div className={className}>
          <label htmlFor={id} className={classNames("text-gray-700 font-bold block pb-1")}>{label}</label>
          {prefix}
          <Select value={value} onChange={(v) => { setValue(v); if (rest.onChange) rest.onChange({ target: { value: v } } as React.ChangeEvent<HTMLInputElement>) }} options={options!} />
          {suffix}
        </div>
      )
    }

    return (
      <Controller
        name={id}
        control={formContext.control}
        render={({ field }) => (
          <div className={className}>
            <label htmlFor={id} className={classNames("text-gray-700 font-bold block pb-1")}>{label}</label>
            {prefix}
            <Select value={field.value} onChange={(v) => field.onChange({ target: { value: v } } as React.ChangeEvent<HTMLInputElement>)} options={options!} />
            {suffix}
          </div>
        )}
      />
    )
  }

  return (
    <div className={className}>
      {type === "checkbox" && <input id={id} ref={ref} type={type} className="mt-1 mr-1 mb-3" {...rest} />}
      <label htmlFor={id} className={classNames("text-gray-700 font-bold", { "block pb-1": type !== "checkbox" })}>{label}</label>
      <div className="flex flex-row mb-1">
        {prefix && <span className="rounded-l bg-gray-300 py-2 px-3">{prefix}</span>}
        {type !== "checkbox" && <input id={id} ref={ref} type={type} step={type === "number" ? "any" : undefined} className={classNames("w-full flex-1 py-2 px-3 appearance-none block border cursor-text transition-all text-gray-700 bg-gray-200 border-gray-200 hover:bg-gray-100 hover:border-gray-400 outline-none focus:border-gray-800 focus:bg-white", { "rounded-l": !prefix, "rounded-r": !suffix })} {...rest} />}
        {suffix && <span className="rounded-r bg-gray-300 py-2 px-3">{suffix}</span>}
      </div>
    </div>
  )
})

const Select: React.FC<{ value?: string, onChange: (s: string) => void, options: string[] | Record<string, string | null> }> = ({ value, onChange, options }) => (
  <Listbox value={value} onChange={onChange}>
    <div className="relative">
      <Listbox.Button className="relative text-left w-full py-2 px-3 mb-1 appearance-none block rounded border cursor-text transition-all text-gray-700 bg-gray-200 border-gray-200 hover:bg-gray-100 hover:border-gray-400 outline-none focus:border-gray-800 focus:bg-white">
        <span className={classNames("block truncate", { "text-gray-400": !value })}>{(value && (Array.isArray(options) ? value : options[value])) ?? "(unspecified)"}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon
            className="w-5 h-5 text-gray-400"
            aria-hidden="true"
          />
        </span>
      </Listbox.Button>
      <Listbox.Options className="absolute z-10 w-full py-1 overflow-auto text-base bg-white rounded shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
        {(Array.isArray(options) ? options.map((o) => [o, o]) : Object.entries(options)).map(([k, v]) => (
          <Listbox.Option
            key={k}
            className={({ selected, active }) => classNames("select-none relative py-2 pl-10 pr-4", { "bg-gray-200": active, "font-black": selected })}
            value={k}
          >
            {({ selected }) => (
              <>
                <span className="block truncate">{v}</span>
                {selected && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <CheckIcon className="w-5 h-5" aria-hidden="true" />
                  </span>
                )}
              </>
            )}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </div>
  </Listbox>
)

type PropertyDefinition<V> = {
  label?: string,
  formatter?: (v: V) => string,
  warning?: string,
} & (
    | { inputType: Exclude<InputType<V>, "select" | "multiselect"> }
    | { inputType: InputType<V> & ("select" | "multiselect"), selectOptions: string[] }
  )

export interface FormProps<T> {
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
  const formMethods = useForm<T>({ defaultValues: mapToInput(initialValues, definition) })
  const {
    register, handleSubmit, control, formState: { isSubmitting },
  } = formMethods
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
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(internalOnSubmit)}>

        {title !== undefined && <SectionTitle>{title}</SectionTitle>}
        {warning !== undefined && <Alert>{warning}</Alert>}
        {Object.entries(definition).map(([_k, _v], i, arr) => {
          const k = _k as keyof UnpackNestedValue<T> & Path<T>
          const v = _v as PropertyDefinition<UnpackNestedValue<T>[keyof UnpackNestedValue<T>]>
          const nInputType = v.inputType === "amount" ? "number" : v.inputType as LabelledInputProps["type"]
          if (nInputType === "hidden") {
            return <input type="hidden" {...register(k)} />
          }

          return (
            <div key={k} className={i === arr.length - 1 ? "mb-2" : "mb-8"}>
              {v.warning && <Alert variant="warning" className="mb-4">{v.warning}</Alert>}
              <LabelledInput label={v.label ?? String(k)} id={String(k)} type={nInputType as any} options={(v as any).selectOptions} {...register(k)} />
              {showCurrent && <p>Current value: {v.formatter ? v.formatter(initialValues[k]) : (initialValues[k] ?? "—")}</p>}
              <p>New value: {v.formatter ? v.formatter(newValues[k]) : (newValues[k] ?? "—")}</p>
            </div>
          )
        })}
        {error && <Alert className="mt-2">{error}</Alert>}
        <Button variant="blue" className="mt-4" onClick={handleSubmit(internalOnSubmit)} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</Button>
      </form>
    </FormProvider>
  )
}
