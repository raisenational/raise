/* eslint-disable react/destructuring-assignment */
import {
  ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption,
} from "@reach/listbox"
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

// TODO: Replace this mess (the whole file) with more maintainable and type-safe code

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

export const toInput = <T,>(raw: T, inputType: InputType<T>): string | string[] | boolean => {
  if (raw !== undefined && inputType === "hidden") return JSON.stringify(raw)
  if (raw === undefined || raw === null) return ""
  if (inputType === "amount") return (raw as unknown as number / 100).toFixed(2)
  if (inputType === "date" || inputType === "datetime-local") return new Date((raw as unknown as number * 1000) - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 19)
  if (inputType === "checkbox") return raw as unknown as boolean
  if (inputType === "multiselect") return raw as unknown as string[]
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
  if (inputType === "multiselect" && selectOptions) return raw as unknown as T // NB: selectOptions !== undefined if typeof raw === "multiselect"

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
const mapToInput = <T,>(item: UnpackNestedValue<T>, definition: FormProps<T>["definition"]): UnpackNestedValue<T> & UnpackNestedValue<DeepPartial<T>> => objMap(item, (k, v) => toInput(v, definition[k].inputType))
// @ts-ignore
const mapFromInput = <T,>(item: UnpackNestedValue<T>, definition: FormProps<T>["definition"]): UnpackNestedValue<T> => objMap(item, (k, v) => fromInput(v, definition[k].inputType, definition[k].selectOptions))

export type LabelledInputProps = React.InputHTMLAttributes<HTMLInputElement> & { id: string, label?: React.ReactNode, error?: string, inputClassName?: string } & ({
  type: "select" | "multiselect",
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

export const LabelledInput = React.forwardRef<HTMLInputElement, LabelledInputProps>(({
  id, label, error, className, inputClassName, type, options, prefix, suffix, ...rest
}, ref) => {
  if (type === "hidden") return <input id={id} ref={ref} type={type} className={className} {...rest} />

  if (type === "select" || type === "multiselect") {
    const formContext = useFormContext()

    if (!formContext) {
      const [value, setValue] = React.useState<string | string[] | undefined>(rest.value as string | string[] | undefined)
      return (
        <div className={className}>
          {label && <label htmlFor={id} className={classNames("text-gray-700 font-bold block pb-1")}>{label}</label>}
          {/* @ts-ignore */}
          <Select type={type} value={value} onChange={(v) => { setValue(v); if (rest.onChange) rest.onChange({ target: { value: v } } as React.ChangeEvent<HTMLInputElement>) }} error={error} options={options} />
          {error && <span className="text-raise-red">{error}</span>}
        </div>
      )
    }

    return (
      <Controller
        name={id}
        control={formContext.control}
        render={({ field }) => (
          <div className={className}>
            {label && <label htmlFor={id} className={classNames("text-gray-700 font-bold block pb-1")}>{label}</label>}
            {/* @ts-ignore */}
            <Select type={type} value={field.value} onChange={(v) => field.onChange({ target: { value: v } } as React.ChangeEvent<HTMLInputElement>)} error={error} options={options} />
            {error && <span className="text-raise-red">{error}</span>}
          </div>
        )}
      />
    )
  }

  return (
    <div className={className}>
      {type === "checkbox" && <input id={id} ref={ref} type={type} className="mt-1 mr-1 mb-3" {...rest} />}
      {label && <label htmlFor={id} className={classNames("text-gray-700 font-bold", { "block pb-1": type !== "checkbox", "text-raise-red": error })}>{label}</label>}
      <div className="flex flex-row mb-1">
        {prefix && (
          <span className={classNames(inputClassName, "rounded-l py-2 px-3", {
            "bg-gray-300": !error,
            "bg-red-200": error,
          })}
          >{prefix}
          </span>
        )}
        {type !== "checkbox" && (
          <input
            id={id}
            ref={ref}
            type={type}
            step={type === "number" ? "any" : undefined}
            className={classNames(inputClassName, "w-full flex-1 py-2 px-3 appearance-none block border cursor-text transition-all text-gray-700 outline-none", {
              "rounded-l": !prefix,
              "rounded-r": !suffix,
              "bg-gray-200 border-gray-200 hover:bg-gray-100 hover:border-gray-400 focus:border-gray-800 focus:bg-white": !error,
              "bg-red-100 border-red-100 hover:bg-red-50 hover:border-red-400 focus:border-red-800 focus:bg-red-50": error,
            })}
            {...rest}
          />
        )}
        {suffix && (
          <span className={classNames(inputClassName, "rounded-l py-2 px-3", {
            "bg-gray-300": !error,
            "bg-red-200": error,
          })}
          >{suffix}
          </span>
        )}
      </div>
      {error && <span className="text-raise-red">{error}</span>}
    </div>
  )
})

const normalizeArray = <T,>(value: T | T[] | undefined) => {
  if (Array.isArray(value)) return value
  if (value !== undefined) return [value]
  return []
}

const Select: React.FC<({ type: "select", value?: string, onChange: (s: string) => void } | { type: "multiselect", value?: string[], onChange: (s: string[]) => void }) & { options: string[] | Record<string, string | null>, error?: string }> = (props) => {
  const [selected, setSelected] = React.useState<string[]>(normalizeArray(props.value))
  const options: Record<string, string | null> = Array.isArray(props.options) ? props.options.reduce((acc, cur) => { acc[cur] = cur; return acc }, {} as Record<string, string>) : (props.options)

  return (
    <ListboxInput
      value="null" // hack so we can manage the value
      onChange={(k: string) => {
        if (props.type === "select") {
          setSelected([k])
          props.onChange(k)
          return
        }

        const newSelected: string[] = selected.includes(k)
          ? selected.filter((s) => s !== k)
          : [...selected, k]

        setSelected(newSelected)
        props.onChange(newSelected)
      }}
    >
      <div className="relative">
        <ListboxButton className={classNames("relative text-left w-full py-2 px-3 mb-1 appearance-none block rounded border cursor-text transition-all text-gray-700 outline-none", {
          "bg-gray-200 border-gray-200 hover:bg-gray-100 hover:border-gray-400 focus:border-gray-800 focus:bg-white": !props.error,
          "bg-red-100 border-red-100 hover:bg-red-50 hover:border-red-400 focus:border-red-800 focus:bg-red-50": props.error,
        })}
        >
          <span className={classNames("block truncate", { "text-gray-400": selected.length === 0 })}>{(selected.length > 0 && (selected.map((v) => options[v]).join(", "))) || "(none selected)"}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDownIcon
              className="w-5 h-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </ListboxButton>
        <ListboxPopover portal={false} className="absolute z-10 w-full mt-1 py-1 overflow-auto text-base bg-white rounded shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <ListboxList className="outline-none">
            {Object.entries(options).map(([k, v]) => (
              <ListboxOption
                key={k}
                className={classNames("relative py-2 pl-10 pr-4", { "font-black": selected.includes(k) })}
                value={k}
              >
                <>
                  <span className="block truncate">{v}</span>
                  {selected.includes(k) && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <CheckIcon className="w-5 h-5" aria-hidden="true" />
                    </span>
                  )}
                </>
              </ListboxOption>
            ))}
          </ListboxList>
        </ListboxPopover>
      </div>
    </ListboxInput>
  )
}

type PropertyDefinition<I, V> = {
  label?: string,
  formatter?: (v: V, i: I) => string,
  warning?: string,
} & (
    | { inputType: Exclude<InputType<V>, "select" | "multiselect"> }
    | { inputType: InputType<V> & ("select" | "multiselect"), selectOptions: string[] }
  )

export interface FormProps<T> {
  title?: string,
  warning?: string,
  definition: { [K in keyof UnpackNestedValue<T>]: PropertyDefinition<UnpackNestedValue<T>, UnpackNestedValue<T>[K]> },
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
        {warning !== undefined && <Alert variant="warning" className="mb-4">{warning}</Alert>}
        {Object.entries(definition).map(([_k, _v], i, arr) => {
          const k = _k as keyof UnpackNestedValue<T> & Path<T>
          const v = _v as PropertyDefinition<UnpackNestedValue<T>, UnpackNestedValue<T>[keyof UnpackNestedValue<T>]>
          const nInputType = v.inputType === "amount" ? "number" : v.inputType as LabelledInputProps["type"]
          if (nInputType === "hidden") {
            return <input type="hidden" {...register(k)} />
          }

          return (
            <div key={k} className={i === arr.length - 1 ? "mb-2" : "mb-8"}>
              {v.warning && <Alert variant="warning" className="mb-4">{v.warning}</Alert>}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <LabelledInput label={v.label ?? String(k)} id={String(k)} type={nInputType as any} options={(v as any).selectOptions} {...register(k)} />
              {showCurrent && <p>Current value: {v.formatter ? v.formatter(initialValues[k], initialValues) : (initialValues[k] ?? "—")}</p>}
              <p>{showCurrent ? "New value" : "Value"}: {v.formatter ? v.formatter(newValues[k], newValues) : (newValues[k] ?? "—")}</p>
            </div>
          )
        })}
        {error && <Alert className="mt-2">{error}</Alert>}
        <Button variant="blue" className="mt-4" onClick={handleSubmit(internalOnSubmit)} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</Button>
      </form>
    </FormProvider>
  )
}
