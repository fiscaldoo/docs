import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {translate} from '@docusaurus/Translate';
import {usePluralForm} from '@docusaurus/theme-common';
// Peças do plugin @easyops-cn/docusaurus-search-local 0.55.3 (a pesquisa em si não muda).
import useSearchQuery from '@easyops-cn/docusaurus-search-local/dist/client/client/theme/hooks/useSearchQuery';
import {highlight} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/highlight';
import {highlightStemmed} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/highlightStemmed';
import {getStemmedPositions} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/getStemmedPositions';
import styles from '@easyops-cn/docusaurus-search-local/dist/client/client/theme/SearchPage/SearchPage.module.css';
import {ALL_SECTIONS, fetchIndexesByWorker, groupByArticle, searchSections} from '@site/src/search/byArticle';

// NC-009: um resultado por artigo (título do artigo; a secção onde acertou vai por baixo) e contagem de artigos.

function ArticleResult({group: {page, hits}}) {
  const tokens = hits[0].tokens;
  // A secção com mais peso na pesquisa (fora o título): mostra-se por baixo e o artigo abre nesse ponto.
  const hit = hits.filter((h) => h.type !== 0).sort((a, b) => b.score - a.score)[0];
  const target = hit && (hit.type === 1 || hit.type === 4) ? hit.document : page;
  const query = tokens.length ? `?${tokens.map((t) => `_highlight=${encodeURIComponent(t)}`).join('&')}` : '';
  const section = hit && (hit.type === 4 ? hit.document.s : hit.type === 1 ? hit.document.t : '');
  const snippet = hit && hit.type !== 1 ? highlightStemmed(hit.document.t, getStemmedPositions(hit.metadata, 't'), tokens, 100) : '';
  return (
    <article className={styles.searchResultItem}>
      <h2>
        <Link to={target.u + query + (target.h || '')} dangerouslySetInnerHTML={{__html: highlight(page.t, tokens)}} />
      </h2>
      {page.b?.length > 0 && <p className={styles.searchResultItemPath}>{page.b.join(' › ')}</p>}
      {(section || snippet) && (
        <p className="fd-search-hit">
          {section && <span className="fd-search-hit__section">{section}</span>}
          {snippet && <span dangerouslySetInnerHTML={{__html: snippet}} />}
        </p>
      )}
    </article>
  );
}

export default function SearchPage() {
  const {siteConfig: {baseUrl}} = useDocusaurusContext();
  const {selectMessage} = usePluralForm();
  const {searchValue, searchContext, searchVersion, updateSearchPath} = useSearchQuery();
  const [query, setQuery] = useState(searchValue);
  const [groups, setGroups] = useState();
  const [ready, setReady] = useState(false);
  const versionUrl = `${baseUrl}${searchVersion}`;

  useEffect(() => {
    if (searchValue && searchValue !== query) setQuery(searchValue);
  }, [searchValue]);
  useEffect(() => {
    fetchIndexesByWorker(versionUrl, searchContext).then(() => setReady(true));
  }, [versionUrl, searchContext]);
  useEffect(() => {
    updateSearchPath(query);
    if (!query) return setGroups(undefined);
    let live = true;
    searchSections(versionUrl, searchContext, query, ALL_SECTIONS).then((r) => live && setGroups(groupByArticle(r)));
    return () => {
      live = false;
    };
  }, [query, versionUrl, searchContext]);

  const title = query
    ? translate({id: 'theme.SearchPage.existingResultsTitle', message: 'Resultados para «{query}»'}, {query})
    : translate({id: 'theme.SearchPage.emptyResultsTitle', message: 'Pesquisar na documentação'});
  return (
    <Layout>
      <Head>
        <meta property="robots" content="noindex, follow" />
        <title>{title}</title>
      </Head>
      <div className="container margin-vert--lg">
        <h1>{title}</h1>
        <input
          type="search"
          name="q"
          className={styles.searchQueryInput}
          aria-label="Pesquisar na documentação"
          onChange={(e) => setQuery(e.target.value)}
          value={query}
          autoComplete="off"
          autoFocus
        />
        {!ready && query && <p>A carregar…</p>}
        {groups && (
          <p className="fd-search-count" role="status">
            {groups.length
              ? selectMessage(groups.length, translate({id: 'theme.SearchPage.documentsFound.plurals', message: '1 artigo encontrado|{count} artigos encontrados'}, {count: groups.length}))
              : translate({id: 'theme.SearchPage.noResultsText', message: 'Não encontrámos artigos.'})}
          </p>
        )}
        <section>
          {groups?.map((g) => (
            <ArticleResult key={g.page.i} group={g} />
          ))}
        </section>
      </div>
    </Layout>
  );
}
