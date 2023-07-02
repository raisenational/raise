import { Disclosure, DisclosureButton, DisclosurePanel } from '@reach/disclosure';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import { useState } from 'react';
import { SectionNoPadding } from './Section';
import Button from './Button';
import Link from './Link';

interface LinkDefinition { text: string, href?: string, onClick?: React.MouseEventHandler }

const Navigation: React.FC<{ left: LinkDefinition[], right: LinkDefinition[] }> = ({ left, right }) => {
  const [open, setOpen] = useState(false);

  return (
    <nav className={classNames('text-3xl md:text-xl lg:text-2xl md:bg-transparent', { 'bg-raise-purple': open })}>
      <Disclosure open={open} onChange={() => setOpen(!open)}>
        <SectionNoPadding>
          {/* Mobile nav: menu button */}
          <div className="text-left pt-4 md:hidden">
            <DisclosureButton className="p-2 rounded outline-none focus:ring-2 focus:ring-white" aria-label={open ? 'Close main menu' : 'Open main menu'}>
              {open ? (
                <XIcon className="block h-8 w-8" />
              ) : (
                <MenuIcon className="block h-8 w-8" />
              )}
            </DisclosureButton>
          </div>

          {/* Mobile nav: (optional) singular right button */}
          {!open && right.length === 1 && (
            <div className="md:hidden ml-16 -mt-[3.25rem] mr-2 mb-4 text-right text-2xl">
              <Button key={right[0].text} href={right[0].href} onClick={right[0].onClick} variant="red">{right[0].text}</Button>
            </div>
          )}

          {/* Mobile nav: menu contents */}
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

          {/* Desktop nav */}
          <div className="hidden md:flex py-4">
            <div className="flex-1 flex items-center justify-center md:items-stretch md:justify-start">
              <div>
                <div className="flex space-x-2">
                  {left.map((item, i) => (
                    <Link
                      key={item.text}
                      href={item.href}
                      onClick={item.onClick}
                      className={classNames('hover:text-gray-100 transform transition-all duration-250 scale-100 hover:scale-105 p-2', { 'pl-0': i === 0 })}
                    >
                      {item.text}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:static md:inset-auto md:ml-6 md:pr-0">
              <div>
                <div className="flex space-x-2">
                  {right.map((item) => (
                    <Button key={item.text} href={item.href} onClick={item.onClick} variant="red">{item.text}</Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionNoPadding>
      </Disclosure>
    </nav>
  );
};

export const TopNavigation: React.FC = () => (
  <Navigation
    left={[
      { text: 'Home', href: '/' },
      { text: 'Our Chapters', href: '/chapters/' },
      { text: 'Alumni', href: '/alumni/' },
      { text: 'Team', href: '/team/' },
    ]}
    right={[
      { text: 'Find your chapter', href: '/chapters/' },
    ]}
  />
);

export default Navigation;
