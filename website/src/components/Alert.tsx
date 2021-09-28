import * as React from "react"
import { ExclamationCircleIcon, ExclamationIcon } from "@heroicons/react/outline"
import classNames from "classnames"

interface Props {
  variant?: "error" | "warning",
  className?: string,
  children: React.ReactNode | Error,
}

const Alert: React.FC<Props> = ({ children, variant = "error", className }) => (
  <p className={classNames("Alert", className)}>
    {variant === "error" && <ExclamationCircleIcon className="w-6 h-6 mr-2 mt-1" />}
    {variant === "warning" && <ExclamationIcon className="w-6 h-6 mr-2 mt-1" />}
    <span className="flex-1">
      {variant === "error" && "Error"}
      {variant === "warning" && "Warning"}
      : {children instanceof Error ? (
        <>
          {children.message}
          {"isAxiosError" in children && <><br /><code className="text-sm">{JSON.stringify((children as any).response.data)}</code></>}
        </>
      ) : children}
    </span>
  </p>
)

export default Alert
