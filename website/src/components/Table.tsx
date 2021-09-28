import { ResponseValues } from "axios-hooks"
import classNames from "classnames"
import * as React from "react"

interface PropertyDefinition<I, V> {
  label?: string,
  formatter?: (v: V, i: I) => string,
  className?: string,
}

interface Props<I> {
  definition: Partial<{ [K in keyof I]: PropertyDefinition<I, I[K]> } & { [s: `_${string}`]: PropertyDefinition<I, unknown> }>,
  items?: I[] | ResponseValues<I[], unknown>,
  primaryKey?: keyof I,
  onClick?: (item: I, event: React.MouseEvent) => void,
}

const Table = <I,>({
  definition, items, primaryKey, onClick,
}: Props<I>) => {
  // TODO: handle empty, loading and error states

  // Normalized properties
  const nItems = ((items === undefined || Array.isArray(items)) ? items : items.data) ?? []
  const nPrimaryKey = primaryKey || (nItems && nItems[0] && "id" in nItems[0] ? "id" as keyof I : undefined)

  return (
    <div className="overflow-x-auto bg-black bg-opacity-20 rounded pb-2">
      <table className="w-full">
        <thead>
          <tr>
            {Object.entries(definition).map(([k, v], index, arr) => (
              <th className={classNames("p-2 pt-4", { "pl-4": index === 0, "pr-4": index === arr.length - 1 }, v.className)}>{v.label || k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nItems.map((item, rowIndex) => (
            <tr key={nPrimaryKey ? String(item[nPrimaryKey]) : rowIndex} className={classNames("hover:bg-black hover:bg-opacity-20", { "cursor-pointer": onClick !== undefined })} onClick={onClick === undefined ? undefined : (e) => onClick(item, e)}>
              {Object.entries(definition).map(([k, v], cellIndex, arr) => (
                <td className={classNames("p-2", { "pl-4": cellIndex === 0, "pr-4": cellIndex === arr.length - 1 }, v.className)}>{v.formatter ? v.formatter(item[k as keyof I]) : item[k as keyof I]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const amountFormatter = (amountInPence?: number) => (amountInPence === undefined ? "—" : `£${amountInPence / 100}`)
export const dateFormatter = (unixTimestamp?: number) => (unixTimestamp === undefined ? "—" : new Date(unixTimestamp * 1000).toLocaleDateString())
export const percentFormatter = (percentageInPoints?: number) => (percentageInPoints === undefined ? "—" : `${percentageInPoints}%`)
export const timestampFormatter = (unixTimestamp?: number) => (unixTimestamp === undefined ? "—" : new Date(unixTimestamp * 1000).toLocaleString())

export default Table
