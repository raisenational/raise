import classNames from "classnames"
import * as React from "react"
import { useState, useRef, useLayoutEffect } from "react"
import logo from "../images/logo.png"

interface Props {
  title: string,
  tagline: string,
  statistics: {
    years: number,
    students: number,
    raised: number,
    protected: number,
  },
}

function ease(startValue: number, endValue: number, duration: number, elapsedTime: number) {
  if (elapsedTime >= duration) {
    return endValue
  }
  if (elapsedTime <= 0) {
    return startValue
  }

  const proportionThroughAnimation = elapsedTime / duration
  return startValue + (endValue - startValue) * proportionThroughAnimation
}

function standardIntegerFormatter(value: number): string {
  return value.toLocaleString("en-GB", { style: "decimal", maximumFractionDigits: 0 })
}

function integerPoundsFormatter(value: number): string {
  return `£${standardIntegerFormatter(value)}`
}

function animateNumber(element: HTMLElement, startValue: number, durationMs: number) {
  if (!/^£?\d[,\d]*$/.test(element.innerText)) {
    // eslint-disable-next-line no-console
    console.error(`Invalid value '${element.innerText}' found for animated element`, element)
    return
  }

  const formatter = element.innerText.includes("£") ? integerPoundsFormatter : standardIntegerFormatter
  const endValue = parseInt(element.innerText.replace(/\D/g, ""), 10)

  const displayValue = (unformattedValue: number) => {
    const formattedValue = formatter(unformattedValue)
    // eslint-disable-next-line no-param-reassign
    element.textContent = formattedValue
  }

  const startTime = Date.now()

  const animate = () => {
    const currentTime = Date.now()
    const elapsedTime = currentTime - startTime

    if (elapsedTime < durationMs) {
      const easedValue = ease(startValue, endValue, durationMs, elapsedTime)
      displayValue(easedValue)
      window.requestAnimationFrame(animate)
    } else {
      // make sure the final value is rendered
      displayValue(endValue)
    }
  }

  animate()
}

function animateStatsIn(element: HTMLElement) {
  const elements = element.getElementsByClassName("stat-animate")
  for (let i = 0; i < elements.length; i++) {
    animateNumber(elements[i] as HTMLElement, 0, (i + 1) * 1000)
  }
}

const IntroStats: React.FC<Props> = ({ title, tagline, statistics }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useLayoutEffect(() => {
    if (ref.current && !hasAnimated) {
      animateStatsIn(ref.current)
      setHasAnimated(true)
    }
  })

  return (
    <div ref={ref}>
      <img alt="" src={logo} height={60} width={95} className="mb-8" />
      <h1 className="text-5xl sm:text-7xl font-raise-header font-black">{title}</h1>
      <p className="text-2xl sm:text-3xl">{tagline}</p>
      <div className="grid grid-cols-2 sm:flex transform sm:-skew-x-15 shadow-raise mt-8 rounded overflow-hidden font-light">
        <Statistic value={statistics.years} description={statistics.years !== 1 ? "years" : "year"} className="bg-raise-purple" numberClassName="sm:w-10" />
        <Statistic value={statistics.students.toLocaleString()} description="students" className="bg-raise-red" numberClassName="sm:w-20" />
        <Statistic value={`£${statistics.raised.toLocaleString()}`} description="raised" className="bg-raise-orange" numberClassName="sm:w-44" />
        <Statistic value={statistics.protected.toLocaleString()} description="people protected" className="bg-raise-yellow text-black" numberClassName="sm:w-44" />
      </div>
    </div>
  )
}

const Statistic: React.FC<{ value: string | number, description: string, className?: string, numberClassName?: string }> = ({
  value, description, className, numberClassName,
}) => (
  <div className={classNames("flex-auto items-center p-2 sm:py-3 md:p-5 text-center", className)}>
    <div className="transform sm:skew-x-15">
      <p className={classNames("text-3xl sm:text-5xl stat-animate mx-auto", numberClassName)}>{value}</p>
      <p className="text-xl">{description}</p>
    </div>
  </div>
)

export default IntroStats
