import classNames from "classnames"
import * as React from "react"

interface Props {
  to: string,
  variant?: "red" | "outline",
  className?: string,
}

const Button: React.FC<Props> = ({
  children, to, variant = "outline", className,
}) => (
  <a
    href={to}
    className={classNames("py-2 px-4 rounded transform -skew-x-15 transition-all duration-250 shadow hover:shadow-lg scale-100 hover:scale-105", {
      "bg-raise-red hover:text-gray-200": variant === "red",
      "border-4 border-white hover:text-raise-blue hover:bg-white": variant === "outline",
    }, className)}
  >
    <span className="inline-block transform skew-x-15">{children}</span>
  </a>
)

export default Button
