import classNames from 'classnames';
import React from 'react';
import { navigate } from 'gatsby';
import { ResponseValues } from '../helpers/networking';
import Alert from './Alert';

interface PropertyDefinition<I, V> {
  label?: string,
  formatter?: (v: V, i: I) => string,
  className?: string,
}

interface Props<I> {
  definition: Partial<{ [K in keyof I]: PropertyDefinition<I, I[K]> } & { [s: `_${string}`]: PropertyDefinition<I, unknown> }>,
  items?: I[] | ResponseValues<I[], unknown, unknown>,
  primaryKey?: keyof I,
  onClick?: (item: I, event: React.MouseEvent | React.KeyboardEvent) => void,
  emptyMessage?: string,
  renderItem?: (item: I, index: number) => JSX.Element,
  className?: string,
  href?: (item: I) => string,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Table = <I extends Record<string, any>>({
  definition, items, primaryKey, onClick, emptyMessage = 'There are no entries', renderItem, className, href,
}: Props<I>) => {
  // Normalized properties
  const nItems = ((items === undefined || Array.isArray(items)) ? items : items.data) ?? [];
  const nPrimaryKey = primaryKey ?? (nItems && nItems[0] && 'id' in nItems[0] ? 'id' as keyof I : undefined);

  // Loading and error states
  if (items && !Array.isArray(items)) {
    if (items.loading) return <div className={classNames(className, 'overflow-x-auto bg-black bg-opacity-20 rounded p-4')}><span className="animate-pulse">Loading...</span></div>;
    if (items.error) return <Alert className={className} variant="error">{items.error}</Alert>;
  }

  return (
    <div className={classNames(className, 'overflow-x-auto bg-black bg-opacity-20 rounded py-2')}>
      <table className="w-full">
        <thead>
          <tr>
            {Object.entries(definition).map(([k, v], index, arr) => (
              <th key={k} className={classNames('p-2', { 'pl-4': index === 0, 'pr-4': index === arr.length - 1 }, v.className)}>{v.label ?? k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nItems.map(renderItem || ((item, rowIndex) => {
            const onTrigger = (href || onClick) ? (e: React.MouseEvent | React.KeyboardEvent) => {
              if (onClick) onClick(item, e);
              if (href) {
                if (!e.ctrlKey) {
                  navigate(href(item));
                } else {
                  window.open(href(item), '_blank');
                }
              }
            } : undefined;

            return (
              <tr
                key={nPrimaryKey ? String(item[nPrimaryKey]) : rowIndex}
                className={classNames('hover:bg-black hover:bg-opacity-20', href || onClick ? 'cursor-pointer' : '')}
                onClick={onTrigger}
                onKeyDown={onTrigger ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onTrigger(e);
                    e.preventDefault();
                  }
                } : undefined}
                tabIndex={onClick || href ? 0 : undefined}
              >
                {Object.entries(definition).map(([k, v], cellIndex, arr) => (
                  <td key={k} className={classNames('p-2', { 'pl-4': cellIndex === 0, 'pr-4': cellIndex === arr.length - 1 }, v.className)}>
                    {v.formatter ? v.formatter(item[k as keyof I], item) : (item[k as keyof I] ?? '—')}
                  </td>
                ))}
              </tr>
            );
          }))}
        </tbody>
      </table>
      {nItems.length === 0 && <p className="px-4 pt-2 pb-1 text-center">{emptyMessage}</p>}
    </div>
  );
};

export default Table;
