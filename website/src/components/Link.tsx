import * as React from "react"
import { Link as GatsbyLink } from "gatsby"
import classNames from "classnames"

interface Props {
  href?: string,
  target?: React.HTMLAttributeAnchorTarget,
  onClick?: React.EventHandler<React.MouseEvent | React.KeyboardEvent>,
  className?: string,
  disabled?: boolean,
}

const Link: React.FC<Props> = ({
  children, href, target, onClick, className, disabled,
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

  return (
    <a href={href} target={target} rel="noreferrer" onClick={onClick} onKeyPress={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(e) } : undefined} tabIndex={0} className={classNames("cursor-pointer", className)}>
      {children}
    </a>
  )
}

export default Link
