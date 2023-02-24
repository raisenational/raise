import classNames from 'classnames';
import React from 'react';

interface Props {
  id?: string,
  className?: string,
}

export const SectionNoPadding = React.forwardRef<HTMLElement, React.PropsWithChildren<Props>>(({ children, id, className }, ref) => <section ref={ref} id={id} className={classNames('SectionNoPadding', className)}>{children}</section>);

const Section = React.forwardRef<HTMLElement, React.PropsWithChildren<Props>>(({ id, children, className }, ref) => <SectionNoPadding ref={ref} id={id} className={classNames('Section', className)}>{children}</SectionNoPadding>);

export const SectionTitle: React.FC<React.PropsWithChildren<Props>> = ({ children, id, className }) => <h2 id={id} className={classNames('text-4xl sm:text-6xl font-raise-header font-black mb-4', className)}>{children}</h2>;

export default Section;
