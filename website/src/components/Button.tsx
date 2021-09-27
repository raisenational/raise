import classNames from "classnames"
import * as React from "react"

interface Props {
  href?: string,
  onClick?: React.MouseEventHandler,
  variant?: "red" | "outline",
  className?: string,
}

const Button: React.FC<Props> = ({
  children, href, onClick, variant = "outline", className,
}) => (
  <a
    href={href}
    onClick={onClick}
    className={classNames("py-2 px-4 rounded cursor-pointer transform -skew-x-15 transition-all duration-250 shadow hover:shadow-lg scale-100 hover:scale-105", {
      "bg-raise-red hover:text-gray-200": variant === "red",
      "border-4 border-white hover:text-raise-blue hover:bg-white": variant === "outline",
    }, className)}
  >
    <span className="inline-block transform skew-x-15">{children}</span>
  </a>
)

export default Button
