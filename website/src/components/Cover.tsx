import * as React from "react"
import { ChevronDownIcon } from "@heroicons/react/outline"
import classNames from "classnames"

const Cover: React.FC<{ className?: string }> = ({ className, children }) => (
  <section className={classNames("min-h-screen flex flex-col content-center justify-between", className)}>
    {children}
  </section>
)

export const CTADown: React.FC<{ text: string, href: string }> = ({ text, href }) => (
  <a href={href} className="text-center mb-6 mt-8 group">
    <p>{text}</p>
    <ChevronDownIcon className="h-6 w-6 transition-transform transform -translate-y-1 group-hover:translate-y-0" />
  </a>
)

export default Cover
