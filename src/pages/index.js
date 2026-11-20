import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useAllDocsData} from '@docusaurus/plugin-content-docs/client';
import {usePluginData} from '@docusaurus/useGlobalData';
import pesquisa from '@site/data/pesquisa.json';

// Só artigos publicados (NC-004/NC-005): nada de listas «mais consultadas» sem métricas nem entradas por escrever.
// Cada entrada só aparece se o artigo estiver publicado; uma lista sem entradas não aparece.
const LISTS = [
  {title: 'Primeiros passos', items: [
    {label: 'O que é o fiscaldoo', to: '/getting-started/o-que-e-o-fiscaldoo'},
    {label: 'Criar uma série e comunicá-la à AT', to: '/fiscal-core/series-documentais'},
  ]},
  {title: 'Resolução de problemas', items: [
    {label: 'Não consigo alterar uma fatura já emitida', to: '/troubleshooting/nao-consigo-alterar-um-documento-certificado'},
  ]},
  {title: 'Novidades', items: [
    {label: 'Novidades do produto, no site fiscaldoo', to: 'https://www.fiscaldoo.pt/novidades.html'},
  ]},
];

export default function Home() {
  const searchUrl = useBaseUrl('/search');
  const docs = useAllDocsData().default.versions.find((v) => v.isLast).docs;
  const count = (base) => docs.filter((d) => d.path.startsWith(`${base}/`)).length;
  const categories = usePluginData('fd-categorias');
  const lists = LISTS.map((l) => ({...l, items: l.items.filter(({to}) => /^https?:/.test(to) || docs.some((d) => d.path === to))})).filter((l) => l.items.length);
  return (
    <Layout title="Documentação" description="Centro de ajuda do fiscaldoo: certificação fiscal e localização portuguesa para Odoo.">
      <main className="fd-home">
        <header className="fd-hero">
          <div className="wrap">
            <span className="kicker">Centro de ajuda</span>
            <h1>Como podemos ajudar?</h1>
            <p>Guias passo a passo para configurar e usar o fiscaldoo no Odoo, da primeira fatura ao fecho do ano.</p>
            <form className="fd-search" action={searchUrl} method="get" role="search">
              <input type="search" name="q" aria-label="Pesquisar na documentação" placeholder="Tarefa, menu ou mensagem de erro" />
              <button type="submit" className="btn primary">Pesquisar</button>
            </form>
            <div className="fd-examples">
              <span>Por exemplo:</span>
              {pesquisa.exemplos_inicio.map((q) => (
                <a key={q} href={`${searchUrl}?q=${encodeURIComponent(q)}`}>{q}</a>
              ))}
            </div>
          </div>
        </header>

        <section className="fd-section" aria-labelledby="fd-cats-title">
          <div className="wrap">
            <h2 id="fd-cats-title">Categorias</h2>
            <div className="fd-cats">
              {categories.map(({slug, titulo, descricao}) => {
                const n = count(`/${slug}`);
                return n ? (
                  <Link key={slug} className="fd-cat" to={`/${slug}`}>
                    <span className="fd-cat__name">{titulo}</span>
                    <p>{descricao}</p>
                    <span className="fd-cat__count">{`${n} ${n === 1 ? 'artigo' : 'artigos'}`}</span>
                  </Link>
                ) : (
                  <div key={slug} className="fd-cat fd-cat--empty">
                    <span className="fd-cat__name">{titulo}</span>
                    <p>{descricao}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="fd-section">
          <div className="wrap fd-lists">
            {lists.map(({title, items}) => (
              <div key={title} className="fd-list">
                <h2>{title}</h2>
                <ul>
                  {items.map(({label, to}) => (
                    <li key={label}>
                      <Link to={to}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="fd-section">
          <div className="wrap">
            <div className="fd-help">
              <p>
                <strong>Não encontrou a resposta?</strong>
                Escreva-nos com o nome do menu e a mensagem que aparece no ecrã.
              </p>
              <a className="btn ghost" href="mailto:fiscaldoo@fiscaldoo.pt">Contactar o suporte</a>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
