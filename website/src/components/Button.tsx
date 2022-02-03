import classNames from "classnames"
import * as React from "react"
import Link from "./Link"

interface Props {
  href?: string,
  target?: React.HTMLAttributeAnchorTarget,
  onClick?: React.EventHandler<React.MouseEvent | React.KeyboardEvent>,
  variant?: "red" | "purple" | "outline" | "blue" | "gray",
  size?: "normal" | "small" | "large",
  skew?: boolean,
  className?: string,
  disabled?: boolean,
  children?: React.ReactNode,
}

const Button = React.forwardRef<any, Props>(({
  children, href, target, onClick, variant = "outline", size = "normal", skew = true, className, disabled, ...other
}, ref) => (
  <Link
    href={href}
    target={target}
    onClick={onClick}
    className={classNames("Button", {
      "bg-raise-red border-raise-red hover:text-gray-200": variant === "red",
      "bg-raise-purple border-raise-purple hover:text-gray-200": variant === "purple",
      "border-white hover:text-raise-blue hover:bg-white": variant === "outline",
      "bg-raise-blue border-raise-blue hover:text-gray-200": variant === "blue",
      "bg-gray-400 border-gray-400 hover:text-gray-200": variant === "gray",
      "px-2 py-0": size === "small",
      "border-4": size === "normal",
      "border-4 py-2 px-5 text-[130%]": size === "large",
      "-skew-x-15": skew,
    }, className)}
    disabled={disabled}
    role="button"
    ref={ref}
    {...other}
  >
    <span className={classNames("inline-block", { "skew-x-15": skew })}>{children}</span>
  </Link>
))

export default Button
