import * as React from "react"
import { Link as GatsbyLink } from "gatsby"

interface Props {
  href?: string,
  onClick?: React.MouseEventHandler,
  className?: string,
}

const Link: React.FC<Props> = ({
  children, href, onClick, className,
}) => {
  const isInternal = href && /^(\.?\/(?!\/))|(\.\.)/.test(href)

  // Use Gatsby Link for internal links, and <a> for others
  if (isInternal && href) {
    return (
      <GatsbyLink
        to={href}
        onClick={onClick}
        className={className}
      >
        {children}
      </GatsbyLink>
    )
  }
  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  )
}

export default Link
