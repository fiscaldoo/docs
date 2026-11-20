import React from 'react';

// Embrulha uma lista numerada em Markdown: um passo = uma ação concreta (master prompt, secção 7).
export default function StepByStep({children}) {
  return <div className="fd-steps">{children}</div>;
}
