import classNames from "classnames"
import * as React from "react"
import Link from "./Link"

interface Props {
  href?: string,
  target?: React.HTMLAttributeAnchorTarget,
  onClick?: React.EventHandler<React.MouseEvent | React.KeyboardEvent>,
  variant?: "red" | "outline" | "blue" | "gray",
  size?: "normal" | "small",
  className?: string,
  disabled?: boolean,
}

const Button: React.FC<Props> = ({
  children, href, target, onClick, variant = "outline", size = "normal", className, disabled,
}) => (
  <Link
    href={href}
    target={target}
    onClick={onClick}
    className={classNames("Button", {
      "bg-raise-red border-raise-red hover:text-gray-200": variant === "red",
      "border-white hover:text-raise-blue hover:bg-white": variant === "outline",
      "bg-raise-blue border-raise-blue hover:text-gray-200": variant === "blue",
      "bg-gray-400 border-gray-400 hover:text-gray-200": variant === "gray",
      "px-2 py-0": size === "small",
      "border-4": size === "normal",
    }, className)}
    disabled={disabled}
  >
    <span className="inline-block transform skew-x-15">{children}</span>
  </Link>
)

export default Button
