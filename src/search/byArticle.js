// Pesquisa agrupada por artigo (NC-009 da auditoria DOCS-011), usada pela página /search e pela caixa da barra
// superior. O plugin @easyops-cn/docusaurus-search-local 0.55.3 devolve uma linha por secção («Mensagem»,
// «Como utilizar»…); aqui junta-se por artigo. Ordem: primeiro os artigos que acertam no título, depois em
// secções, descrição ou palavras-chave, depois só no texto; dentro de cada nível, a soma da pontuação do lunr.
import {fetchIndexesByWorker, searchByWorker as searchSections} from '@easyops-cn/docusaurus-search-local/dist/client/client/theme/searchByWorker';

// Tipos do plugin: 0 título, 1 secção, 2 descrição, 3 palavras-chave, 4 texto.
const TIER = {0: 0, 1: 1, 2: 1, 3: 1, 4: 2};

export function groupByArticle(results) {
  const groups = new Map();
  for (const r of results) {
    const page = r.type === 0 ? r.document : r.page;
    if (!page) continue;
    let g = groups.get(page.i);
    if (!g) groups.set(page.i, (g = {page, hits: [], tier: 9, score: 0}));
    g.hits.push(r);
    g.tier = Math.min(g.tier, TIER[r.type] ?? 2);
    g.score += r.score;
  }
  return [...groups.values()].sort((a, b) => a.tier - b.tier || b.score - a.score);
}

export {fetchIndexesByWorker, searchSections};

// Todas as secções que acertam, sem corte: com 100, um termo frequente («certificação»: 166 secções em 36 artigos)
// deixava artigos inteiros de fora, e quais dependia da pontuação, diferente com e sem acento (4.ª auditoria, check-search).
export const ALL_SECTIONS = Infinity;

// Para a caixa da barra superior (trocada por esta função em docusaurus.config.js): uma linha por artigo,
// com o título do artigo, pela mesma ordem da página /search.
export async function searchByWorker(baseUrl, searchContext, input, limit) {
  const groups = groupByArticle(await searchSections(baseUrl, searchContext, input, ALL_SECTIONS));
  // Tipo 3 (palavras-chave): o modelo de sugestão do plugin mostra então «document.s» realçado pelos termos
  // pesquisados (sem precisar das posições do lunr) e o trilho da página por baixo.
  return groups.slice(0, limit).map(({page, hits, score}) => ({document: {...page, s: page.t}, type: 3, metadata: {}, tokens: hits[0].tokens, score}));
}
