import React from 'react';

// Etiquetas de versão: «odoo» aceita uma versão ou uma lista; «edition» é texto livre.
export default function VersionBadge({odoo, edition, fiscaldoo}) {
  const versions = [].concat(odoo || []);
  return (
    <>
      {versions.map((v) => (
        <span key={v} className="fd-badge">Odoo {v}</span>
      ))}
      {edition && <span className="fd-badge">{edition}</span>}
      {fiscaldoo && <span className="fd-badge">fiscaldoo {fiscaldoo}</span>}
    </>
  );
}
