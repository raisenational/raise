import escapeHTML from 'escape-html';

const isRenderedHtml = Symbol('isRenderedHtml');

export interface RenderedHtml {
  [isRenderedHtml]: true,
  string: string,
}

export default (templateParts: TemplateStringsArray, ...values: (string | RenderedHtml | RenderedHtml[])[]): RenderedHtml => {
  if (templateParts.length !== values.length + 1) {
    throw new Error('Expected template parts to be one more than the number of substituting values');
  }

  let s = '';
  for (let i = 0; i < templateParts.length - 1; i++) {
    s += templateParts[i];
    const value = values[i];
    if (typeof value === 'string') {
      s += escapeHTML(value);
    } else {
      s += (Array.isArray(value) ? value : [value]).map(({ string }) => string).join('');
    }
  }
  s += templateParts[templateParts.length - 1];

  return { [isRenderedHtml]: true, string: s };
};
