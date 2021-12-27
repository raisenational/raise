import * as React from "react"
import { CheckCircleIcon, ExclamationCircleIcon, ExclamationIcon } from "@heroicons/react/outline"
import classNames from "classnames"

interface Props {
  variant?: "error" | "warning" | "success",
  className?: string,
  children: React.ReactNode | Error,
}

const Alert: React.FC<Props> = ({ children, variant = "error", className }) => (
  <p className={classNames("Alert",
    {
      "bg-raise-red text-white": variant === "error",
      "bg-raise-yellow text-black": variant === "warning",
      "bg-green-600 text-white": variant === "success",
    },
    className)}
  >
    {variant === "error" && <ExclamationCircleIcon className="w-6 h-6 min-w-min mr-2 mt-1" />}
    {variant === "warning" && <ExclamationIcon className="w-6 h-6 min-w-min mr-2 mt-1" />}
    {variant === "success" && <CheckCircleIcon className="w-6 h-6 min-w-min mr-2 mt-1" />}
    <span className="flex-1">
      {variant === "error" && "Error"}
      {variant === "warning" && "Warning"}
      {variant === "success" && "Success"}
      : {children instanceof Error ? (
        <>
          {children.message}
          {/* @ts-ignore */}
          {"isAxiosError" in children && children.response && children.response.data && <><br />{"message" in children.response.data && Object.keys(children.response.data).length === 1 ? children.response.data.message : <code className="text-sm whitespace-pre-wrap">{JSON.stringify(children.response.data, undefined, 2)}</code>}</>}
        </>
      ) : children}
    </span>
  </p>
)

export default Alert
