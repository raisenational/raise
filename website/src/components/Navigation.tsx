import * as React from "react"
import { Disclosure } from "@headlessui/react"
import { MenuIcon, XIcon } from "@heroicons/react/outline"
import classNames from "classnames"
import { SectionNoPadding } from "./Section"
import Button from "./Button"

interface Link { text: string, href?: string, onClick?: React.MouseEventHandler }

const Navigation: React.FC<{ left: Link[], right: Link[] }> = ({ left, right }) => (
  <Disclosure as={React.Fragment}>
    {({ open }) => (
      <nav className={classNames("text-3xl md:text-xl lg:text-2xl md:bg-transparent pb-8 mb-8 md:mb-0", { "bg-raise-purple": open })}>
        <SectionNoPadding>
          <div className="relative flex items-center justify-between h-16 pt-4">
            <div className="flex items-center md:hidden">
              <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XIcon className="block h-10 w-10" aria-hidden="true" />
                ) : (
                  <MenuIcon className="block h-10 w-10" aria-hidden="true" />
                )}
              </Disclosure.Button>
            </div>
            <div className="flex-1 flex items-center justify-center md:items-stretch md:justify-start">
              <div className="hidden md:block">
                <div className="flex space-x-2">
                  {left.map((item) => (
                    <a
                      key={item.text}
                      href={item.href}
                      onClick={item.onClick}
                      className="hover:text-gray-100 p-2 transform transition-all duration-250 scale-100 hover:scale-105"
                    >
                      {item.text}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:static md:inset-auto md:ml-6 md:pr-0">
              <div className="hidden md:block">
                <div className="flex space-x-2">
                  {right.map((item) => (
                    <Button key={item.href} href={item.href} onClick={item.onClick} variant="red">{item.text}</Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="px-8 -mt-8 space-y-2">
              {left.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={item.onClick}
                  className="rounded block py-4 hover:bg-raise-red"
                >
                  {item.text}
                </a>
              ))}
              {right.map((item) => (
                <Button key={item.href} href={item.href} onClick={item.onClick} variant="red" className="block py-4 px-4">{item.text}</Button>
              ))}
            </div>
          </Disclosure.Panel>
        </SectionNoPadding>
      </nav>
    )}
  </Disclosure>
)

export default Navigation
