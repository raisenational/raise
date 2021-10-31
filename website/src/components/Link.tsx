import * as React from "react"
import { Link as GatsbyLink } from "gatsby"
import classNames from "classnames"

interface Props {
  href?: string,
  onClick?: React.MouseEventHandler,
  className?: string,
  disabled?: boolean,
}

const Link: React.FC<Props> = ({
  children, href, onClick, className, disabled,
}) => {
  if (disabled || (href === undefined && onClick === undefined)) {
    return (
      <a href={href} onClick={() => false} className={classNames("opacity-40 pointer-events-none", className)}>
        {children}
      </a>
    )
  }

  const isInternal = href && /^(\.?\/(?!\/))|(\.\.)/.test(href)

  // Use Gatsby Link for internal links, and <a> for others
  if (isInternal && href) {
    return (
      <GatsbyLink
        to={href}
        onClick={onClick}
        className={classNames("cursor-pointer", className)}
      >
        {children}
      </GatsbyLink>
    )
  }

  if (href !== undefined) {
    return (
      <a href={href} onClick={onClick} className={classNames("cursor-pointer", className)}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} className={classNames("cursor-pointer", className)}>
      {children}
    </button>
  )
}

export default Link
