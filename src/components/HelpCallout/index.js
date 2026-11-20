import React from 'react';

// Tipos: nota (informação), atencao (cuidado), risco (risco fiscal/legal → validação profissional), dica.
const LABELS = {nota: 'Nota', atencao: 'Atenção', risco: 'Risco fiscal', dica: 'Dica'};

export default function HelpCallout({type = 'nota', title, children}) {
  const kind = LABELS[type] ? type : 'nota';
  return (
    <aside className={`fd-callout fd-callout--${kind}`} aria-label={title || LABELS[kind]}>
      <strong className="fd-callout__title">{title || LABELS[kind]}</strong>
      {children}
    </aside>
  );
}
