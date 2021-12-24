import * as React from "react"
import { Disclosure, DisclosureButton, DisclosurePanel } from "@reach/disclosure"
import { MenuIcon, XIcon } from "@heroicons/react/outline"
import classNames from "classnames"
import { SectionNoPadding } from "./Section"
import Button from "./Button"
import Link from "./Link"

interface Link { text: string, href?: string, onClick?: React.MouseEventHandler }

const Navigation: React.FC<{ left: Link[], right: Link[] }> = ({ left, right }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <nav className={classNames("text-3xl md:text-xl lg:text-2xl md:bg-transparent", { "bg-raise-purple": open })}>
      <Disclosure open={open} onChange={() => setOpen(!open)}>
        <SectionNoPadding>
          <div className="relative flex items-center justify-between h-20 w-16 md:w-auto py-4">
            <div className="flex items-center md:hidden">
              <DisclosureButton className="inline-flex items-center justify-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XIcon className="block h-10 w-10" aria-hidden="true" />
                ) : (
                  <MenuIcon className="block h-10 w-10" aria-hidden="true" />
                )}
              </DisclosureButton>
            </div>
            <div className="flex-1 flex items-center justify-center md:items-stretch md:justify-start">
              <div className="hidden md:block">
                <div className="flex space-x-2">
                  {left.map((item, i) => (
                    <Link
                      key={item.text}
                      href={item.href}
                      onClick={item.onClick}
                      className={classNames("hover:text-gray-100 transform transition-all duration-250 scale-100 hover:scale-105 p-2", { "pl-0": i === 0 })}
                    >
                      {item.text}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:static md:inset-auto md:ml-6 md:pr-0">
              <div className="hidden md:block">
                <div className="flex space-x-2">
                  {right.map((item) => (
                    <Button key={item.text} href={item.href} onClick={item.onClick} variant="red">{item.text}</Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DisclosurePanel className="md:hidden">
            <div className="px-8 -mt-12 pb-8 space-y-2">
              {left.map((item) => (
                <Link
                  key={item.text}
                  href={item.href}
                  onClick={item.onClick}
                  className="rounded block py-4 mx-8"
                >
                  {item.text}
                </Link>
              ))}
              {right.map((item) => (
                <Button key={item.text} href={item.href} onClick={item.onClick} variant="red" className="block py-4 px-4 mx-8">{item.text}</Button>
              ))}
            </div>
          </DisclosurePanel>
        </SectionNoPadding>
      </Disclosure>
    </nav>
  )
}

export default Navigation
