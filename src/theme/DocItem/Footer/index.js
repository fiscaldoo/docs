import React, {useState} from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import RelatedArticles from '@site/src/components/RelatedArticles';
import VersionBadge from '@site/src/components/VersionBadge';
import PageFeedback from '@site/src/components/PageFeedback';

// Substitui o rodapé do tema: relacionados, data de atualização (do git), versões, ID documental, copiar/imprimir e «foi útil?».
export default function DocItemFooter() {
  const {metadata, frontMatter} = useDoc();
  const [copied, setCopied] = useState(false);
  const updated = metadata.lastUpdatedAt
    ? new Intl.DateTimeFormat('pt-PT', {dateStyle: 'long'}).format(new Date(metadata.lastUpdatedAt))
    : null; // sem data enquanto o ficheiro não estiver no git
  const copy = () => navigator.clipboard?.writeText(window.location.href).then(() => setCopied(true));
  return (
    <footer className="theme-doc-footer">
      <RelatedArticles ids={frontMatter.related || []} />
      <div className="fd-docinfo">
        <div className="fd-docinfo__row">
          {updated && (
            <span>
              Atualizado em <strong>{updated}</strong>
            </span>
          )}
          <span className="fd-meta" style={{margin: 0}}>
            Versões:{' '}
            <VersionBadge odoo={frontMatter.odoo_versions} edition={frontMatter.editions} fiscaldoo={frontMatter.fiscaldoo_version} />
          </span>
          {frontMatter.doc_id && (
            <span>
              ID <code>{frontMatter.doc_id}</code>
            </span>
          )}
        </div>
        <div className="fd-docinfo__actions">
          <button type="button" className="btn ghost small" onClick={copy}>
            {copied ? 'Ligação copiada' : 'Copiar ligação'}
          </button>
          <button type="button" className="btn ghost small" onClick={() => window.print()}>
            Imprimir
          </button>
        </div>
        <PageFeedback title={metadata.title} />
      </div>
    </footer>
  );
}
