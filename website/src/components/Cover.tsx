import * as React from "react"
import { ChevronDownIcon } from "@heroicons/react/outline"

const Cover: React.FC<{}> = ({ children }) => (
  <section className="min-h-screen flex flex-col content-center justify-between">
    {children}
  </section>
)

export const CTADown: React.FC<{ text: string, to: string }> = ({ text, to }) => (
  <a href={to} className="text-center mb-6 mt-8 group">
    <p>{text}</p>
    <ChevronDownIcon className="h-6 w-6 transition-transform transform -translate-y-1 group-hover:translate-y-0" />
  </a>
)

export default Cover
