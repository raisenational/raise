import classNames from 'classnames';
import { useState } from 'react';
import Alert from './Alert';
import Table from './Table';
import Modal from './Modal';
import { Form, FormProps, InputType } from './Form';
import { ResponseValues } from '../helpers/networking';

type PropertyDefinition<I, V> = {
  label?: string,
  formatter?: (v: V, i: I) => string,
  className?: string,
  warning?: string,
} & (
  | { inputType?: Exclude<InputType<V>, 'select' | 'multiselect'> }
  | { inputType: InputType<V> & ('select' | 'multiselect'), selectOptions: readonly string[] | { [key: string]: string } }
);

interface Props<I> {
  definition: Partial<{ [K in keyof I]: PropertyDefinition<I, I[K]> }> & { [s: `_${string}`]: PropertyDefinition<I, unknown> },
  item?: I | ResponseValues<I, unknown, unknown>,
  onClick?: (key: keyof I, event: React.MouseEvent) => void,
  onSave?: (data: Partial<I>) => void | Promise<void>,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PropertyEditor = <I extends Record<string, any>>({
  definition, item, onClick, onSave,
}: Props<I>) => {
  const [editingProperty, setEditingProperty] = useState<keyof I | undefined>();

  // Loading and error states
  if (!item || ('loading' in item && item.loading)) return <div className="overflow-x-auto bg-black bg-opacity-20 rounded p-4"><span className="animate-pulse">Loading...</span></div>;
  if ('loading' in item && item.error && item.error instanceof Error) return <Alert variant="error">{item.error}</Alert>;
  if ('loading' in item && item.data === undefined) return <Alert variant="error">Data not found</Alert>; // NB: A common cause of this is trying to find a new item you just created without refreshing the data (try useAxios.clearCache()).

  // Normalized properties
  const nItem = ((item !== undefined && 'loading' in item) ? item.data : item) as I;

  const tableDefinition = {
    label: { label: 'Property' },
    value: { label: 'Value' },
  };
  const tableOnClick = (i: { property: keyof I }, event: React.MouseEvent) => {
    if (onClick) onClick(i.property, event);
    setEditingProperty(i.property);
  };

  return (
    <>
      <Modal open={editingProperty !== undefined} onClose={() => { setEditingProperty(undefined); }}>
        {editingProperty && (
          <Form<Partial<I>>
            title={`Editing ${definition[editingProperty]?.label?.toLowerCase()}` ?? editingProperty}
            definition={{
              [editingProperty]: {
                ...definition[editingProperty],
                formatter: definition[editingProperty]?.formatter
                  ? (i: I[string]) => definition[editingProperty]?.formatter?.(i, nItem)
                  : undefined,
              },
            } as unknown as FormProps<Partial<I>>['definition']}
            initialValues={{
              [editingProperty]: nItem[editingProperty],
            } as FormProps<Partial<I>>['initialValues']}
            onSubmit={async (data) => {
              if (onSave) await onSave(data);
              setEditingProperty(undefined);
              return undefined;
            }}
          />
        )}
      </Modal>
      <Table
        definition={tableDefinition}
        items={Object.entries(definition).map(([k, v]) => ({
          property: k as keyof I,
          label: v?.label ?? k,
          value: v?.formatter ? v.formatter(nItem[k], nItem) : (nItem[k] ?? '—'),
        }))}
        renderItem={(i) => (
          <tr key={String(i.property)} className={classNames('hover:bg-black hover:bg-opacity-20', { 'cursor-pointer': definition[i.property]?.inputType !== undefined })} onClick={definition[i.property]?.inputType === undefined ? undefined : (e) => tableOnClick(i, e)}>
            {Object.keys(tableDefinition).map((k, cellIndex, arr) => (
              <td key={k} className={classNames('p-2 word-wrap', { 'pl-4 lg:min-w-[24rem]': cellIndex === 0, 'pr-4': cellIndex === arr.length - 1 })}>{(i[k as keyof typeof tableDefinition] ?? '—')}</td>
            ))}
          </tr>
        )}
        primaryKey="property"
      />
    </>
  );
};

export default PropertyEditor;
