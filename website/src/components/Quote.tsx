import * as React from "react"
import classNames from "classnames"

const Quote: React.FC<{ className?: string, by: string, headshotSrc: string, imagePlacement?: "left" | "right" }> = ({
  children, className, by, headshotSrc, imagePlacement = "right", ...props
}) => (
  <div className={classNames("flex", className)} {...props}>
    {imagePlacement === "left" && <QuoteImage by={by} headshotSrc={headshotSrc} imagePlacement={imagePlacement} />}
    <div className={classNames("relative", imagePlacement === "right" ? "mr-12 ml-8" : "ml-12 mr-8")}>
      <p className="text-left before:content-['“'] before:absolute before:text-[20rem] before:leading-none before:font-black before:-left-12 before:-top-12 before:opacity-20">
        {children}
      </p>
      <p className="text-right font-bold mt-2">
        {by}
      </p>
    </div>
    {imagePlacement === "right" && <QuoteImage by={by} headshotSrc={headshotSrc} imagePlacement={imagePlacement} />}
  </div>
)

const QuoteImage: React.FC<{ by: string, headshotSrc: string, imagePlacement: "left" | "right" }> = ({
  by, headshotSrc, imagePlacement,
}) => (
  <div className="hidden sm:block w-40 flex-shrink-0">
    <img
      src={headshotSrc}
      alt={`Headshot of ${by}`}
      className={classNames(
        "shadow-raise rounded-full transition-all duration-500 ease-out",
        imagePlacement === "right" ? "hover:rotate-6" : "hover:-rotate-6",
      )}
    />
  </div>
)

export default Quote
