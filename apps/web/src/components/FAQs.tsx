import { Accordion, AccordionItem, AccordionButton } from '@reach/accordion';
import { ChevronRightIcon } from '@heroicons/react/solid';
import classNames from 'classnames';

interface FaqProps {
  title: string,
  className?: string,
}

const FAQs: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Accordion className="bg-white rounded text-left text-gray-500" collapsible>
    {children}
  </Accordion>
);

export const FAQ: React.FC<React.PropsWithChildren<FaqProps>> = ({ className, title, children }) => (
  <AccordionItem className={classNames(className, 'FAQ hover:text-black')}>
    <AccordionButton className="p-4 text-left w-full flex">
      <ChevronRightIcon className="transition-transform w-7 h-7 align-text-top flex-shrink-0" />
      <span className="text-2xl ml-2 align-text-top">{title}</span>
    </AccordionButton>
    <div
      className={classNames('transition-all duration-500 overflow-y-hidden')}
    >
      <div className="px-4 pb-4 text-xl font-light">
        {children}
      </div>
    </div>
  </AccordionItem>
);

export default FAQs;
