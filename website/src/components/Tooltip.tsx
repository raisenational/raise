import * as React from "react"

const Tooltip: React.FC<{
  label: React.ReactNode,
  children: React.ReactNode,
}> = ({ label, children }) => (
  <span className="relative group underline underline-offset-1 decoration-dotted cursor-help">
    {children}
    <span className="tooltip">{label}</span>
  </span>
)

export default Tooltip
