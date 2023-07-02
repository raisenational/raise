import { ChevronDownIcon } from '@heroicons/react/outline';
import classNames from 'classnames';

const Cover: React.FC<React.PropsWithChildren<{ className?: string, heightClassName?: string }>> = ({ className, heightClassName = 'min-h-screen', children }) => (
  <section className={classNames('flex flex-col content-center justify-between', className, heightClassName)}>
    {children}
  </section>
);

export const CTADown: React.FC<{ text: string, href: string }> = ({ text, href }) => (
  <a href={href} className="text-center mb-6 mt-8 group">
    <p>{text}</p>
    <ChevronDownIcon className="h-6 w-6 transition-transform -translate-y-1 group-hover:translate-y-0" />
  </a>
);

export default Cover;
