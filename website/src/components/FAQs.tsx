import * as React from "react"
import { Disclosure } from "@headlessui/react"
import { ChevronRightIcon } from "@heroicons/react/solid"
import classNames from "classnames"

interface FaqProps {
  title: string,
  className?: string,
}

const FAQs: React.FC<{}> = ({ children }) => (
  <div className="bg-white rounded text-left text-gray-500">
    {children}
  </div>
)

export const FAQ: React.FC<FaqProps> = ({ className, title, children }) => (
  <Disclosure>
    {({ open }) => (
      <div className={classNames(className, "FAQ hover:text-black", { "text-black": open })}>
        <Disclosure.Button className="p-4 text-left">
          <ChevronRightIcon className={classNames("transition-transform w-7 h-7 align-text-top", { "rotate-90": open })} />
          <span className="text-2xl ml-2 align-text-top">{title}</span>
        </Disclosure.Button>
        <Disclosure.Panel
          static
          className={classNames("transition-all duration-500 overflow-y-hidden opacity-0 max-h-0", {
            "ease-in": open, "ease-out": !open, "opacity-100": open, "max-h-screen": open,
          })}
        >
          <div className="px-4 pb-4 text-xl font-light">
            {children}
          </div>
        </Disclosure.Panel>
      </div>
    )}
  </Disclosure>
)

export default FAQs
