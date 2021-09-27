import * as React from "react"
import { ExclamationCircleIcon, ExclamationIcon } from "@heroicons/react/outline"
import classNames from "classnames"

interface Props {
  variant: "error" | "warning",
  className?: string,
}

const Alert: React.FC<Props> = ({ children, variant, className }) => (
  <p className={classNames("mb-4 bg-raise-red rounded py-2 break-words", className)}>
    {variant === "error" && <ExclamationCircleIcon className="w-6 h-6 mr-2 inline align-middle" />}
    {variant === "warning" && <ExclamationIcon className="w-6 h-6 mr-2 inline align-middle" />}
    <span className="inline align-middle">
      {variant === "error" && "Error"}
      {variant === "warning" && "Warning"}
      : {children}
    </span>
  </p>
)

export default Alert
