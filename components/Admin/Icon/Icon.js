import React from 'react';

const paths = {
  plus: 'M12 5v14m-7-7h14',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-6-6',
  check: 'M5 13l4 4L19 7',
  draft: 'M12 20h9', // base line
  draft2: 'M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z',
  trash: 'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-1 0l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6h14',
  edit: 'M11 4h9M4 13l9-9 4 4-9 9H4v-4z',
  x: 'M6 18L18 6M6 6l12 12',
  grid: 'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 8v-8h8v8h-8z',
  chevronLeft: 'M15 19l-7-7 7-7',
  chevronRight: 'M9 5l7 7-7 7',
  chevronUp: 'M5 15l7-7 7 7',
  chevronDown: 'M19 9l-7 7-7-7',
};

export default function Icon({ name, size = 18, stroke = 2, className = '', title }) {
  if (name === 'draft') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={title ? undefined : true} role="img">
        {title ? <title>{title}</title> : null}
        <path d={paths.draft2} />
        <path d={paths.draft} />
      </svg>
    );
  }
  const d = paths[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <path d={d} />
    </svg>
  );
}
