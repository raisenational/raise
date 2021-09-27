import classNames from "classnames"
import * as React from "react"

interface Props {
  id?: string,
  className?: string,
}

export const SectionNoPadding: React.FC<Props> = ({ children, id, className }) => <section id={id} className={classNames("max-w-5xl md:w-11/12 mx-auto px-4", className)}>{children}</section>

const Section: React.FC<Props> = ({ children, id, className }) => <SectionNoPadding id={id} className={classNames("Section pt-8", className)}>{children}</SectionNoPadding>

export const SectionTitle: React.FC<Props> = ({ children, id, className }) => <h2 id={id} className={classNames("text-4xl sm:text-6xl font-raise-header font-black mb-4", className)}>{children}</h2>

export default Section
