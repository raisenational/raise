import classNames from "classnames"
import * as React from "react"
import Link from "./Link"

interface Props {
  href?: string,
  onClick?: React.MouseEventHandler,
  variant?: "red" | "outline" | "blue",
  size?: "normal" | "small",
  className?: string,
}

const Button: React.FC<Props> = ({
  children, href, onClick, variant = "outline", size = "normal", className,
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={classNames("Button", {
      "bg-raise-red hover:text-gray-200": variant === "red",
      "bg-raise-blue hover:text-gray-200": variant === "blue",
      "border-2 border-white hover:text-raise-blue hover:bg-white": variant === "outline",
      "px-2 py-0": size === "small",
      "border-4": variant === "outline" && size === "normal",
    }, className)}
  >
    <span className="inline-block transform skew-x-15">{children}</span>
  </Link>
)

export default Button
