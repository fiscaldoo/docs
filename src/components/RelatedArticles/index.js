import React from 'react';
import Link from '@docusaurus/Link';
import {useDocById, useActiveVersion} from '@docusaurus/plugin-content-docs/client';

// Por id do artigo (não por URL): um id que não exista faz falhar a compilação, por isso nunca há ligações mortas.
function Item({id, version}) {
  const doc = useDocById(id);
  const path = version.docs.find((d) => d.id === id)?.path;
  return (
    <li>
      <span>
        <Link to={path}>{doc.title}</Link>
        {doc.description && <small>{doc.description}</small>}
      </span>
    </li>
  );
}

export default function RelatedArticles({ids = [], title = 'Artigos relacionados'}) {
  const version = useActiveVersion(undefined);
  if (!ids.length || !version) return null;
  return (
    <nav className="fd-related" aria-label={title}>
      <h2>{title}</h2>
      <ul>
        {ids.map((id) => (
          <Item key={id} id={id} version={version} />
        ))}
      </ul>
    </nav>
  );
}
