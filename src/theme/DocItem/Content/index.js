import React from 'react';
import Content from '@theme-original/DocItem/Content';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import VersionBadge from '@site/src/components/VersionBadge';

// Estado do artigo (front matter «validation»): sem valor conta como pendente — nunca se apresenta como validado.
const STATUS = {
  exemplo: ['warn', 'Exemplo — não validado'],
  pendente: ['warn', 'Pendente de validação'],
  validado: ['good', 'Validado'],
};

export default function ContentWrapper(props) {
  const {frontMatter} = useDoc();
  const [kind, label] = STATUS[frontMatter.validation] || STATUS.pendente;
  return (
    <>
      <div className="fd-meta">
        <span className={`pill ${kind}`}>
          <span className="d" aria-hidden="true" />
          {label}
        </span>
        <VersionBadge odoo={frontMatter.odoo_versions} edition={frontMatter.editions} />
      </div>
      <Content {...props} />
    </>
  );
}
