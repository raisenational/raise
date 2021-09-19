import classNames from "classnames"
import * as React from "react"

interface Props {
  image?: string,
  title: string,
  text: string,
  className?: string,
}

const Panel: React.FC<Props> = ({
  image, title, text, className,
}) => (
  <div className={classNames("shadow-raise rounded px-8 py-8 flex flex-col items-center", className)}>
    {image && <img alt="" src={image} style={{ height: 64 }} className="mb-4" />}
    <h3 className="text-5xl font-normal pb-2">{title}</h3>
    <p className="text-xl font-light">{text}</p>
  </div>
)

export default Panel
