// Pesquisa tolerante (NC-001, NC-002 da auditoria DOCS-011): acentos e sinónimos resolvidos no ÍNDICE.
// O plugin @easyops-cn/docusaurus-search-local 0.55.3 não tem opção para isto. Este ficheiro junta três
// funções ao pipeline de indexação do lunr em português (só na construção do índice, nunca no browser):
//   1) cada palavra com acentos entra também sem acentos («certificação» e «certificacao»);
//   2) as palavras de cada grupo de sinónimos de data/pesquisa.json entram umas pelas outras («anular» também
//      como «cancelar» e «estornar»; «fatura» também como «FT»);
//   3) cada palavra entra uma só vez com cada radical (sem isto, «serie» e «série» ordenavam de outra maneira).
// A consulta não muda: o lunr aplica-lhe o mesmo radical (stemmer) e encontra a forma indexada.
// O radical português trata «ção» à parte («certificação» → certific, «certificacao» → certificaca); por isso o
// radical sem acentos de cada palavra acentuada dos artigos passa a valer também para as palavras da mesma família
// («certificado» também como certificaca), e «certificacao» encontra o mesmo que «certificação».
// shortcut: liga-se ao lunr partilhado do plugin (Builder.use); rever se o plugin mudar de versão ou passar a ter sinónimos.
const lunr = require('lunr');
require('lunr-languages/lunr.stemmer.support')(lunr);
require('lunr-languages/lunr.pt')(lunr);
const {readdirSync, readFileSync} = require('node:fs');
const {join} = require('node:path');
const {sinonimos} = require('../data/pesquisa.json');

const stem = (word) => lunr.pt.stemmer(new lunr.Token(word)).toString();
const plain = (s) => s.normalize('NFD').replace(/\p{M}/gu, '');

// radical -> radicais do mesmo grupo (as formas sem acentos também entram)
const groups = new Map();
for (const group of sinonimos) {
  const stems = [...new Set(group.flatMap((w) => [stem(w.toLowerCase()), stem(plain(w.toLowerCase()))]))];
  for (const s of stems) groups.set(s, [...new Set([...(groups.get(s) || []), ...stems])]);
}

// Palavras acentuadas de docs/ (artigos e categorias): radical com acentos -> radicais sem acentos.
const files = (dir) => readdirSync(dir, {withFileTypes: true}).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]));
for (const file of files(join(__dirname, '..', 'docs')).filter((f) => /\.(mdx?|json)$/.test(f))) {
  for (const word of new Set(readFileSync(file, 'utf8').toLowerCase().match(/\p{L}+/gu) || [])) {
    const flat = plain(word);
    if (flat === word) continue;
    const [a, b] = [stem(word), stem(flat)];
    if (a !== b) groups.set(a, [...new Set([...(groups.get(a) || [a]), b])]);
  }
}

function fold(token) {
  const flat = plain(token.toString());
  return flat === token.toString() ? token : [token, token.clone(() => flat)];
}
function expand(token) {
  const others = groups.get(token.toString());
  return others ? others.map((s) => token.clone(() => s)) : token;
}
lunr.Pipeline.registerFunction(fold, 'fd-fold-diacritics');
lunr.Pipeline.registerFunction(expand, 'fd-synonyms');
// Cada palavra conta uma vez por radical: «série» dava séri, seri (fold) e seri outra vez (expand), e a contagem dupla
// de «seri» ordenava «serie» de outra maneira que «série» (DOCS-074).
function dedup(token, i, tokens) {
  // As formas da mesma palavra vêm seguidas e partilham metadata.index (posição da palavra no campo).
  for (let j = i - 1; j >= 0 && tokens[j].metadata.index === token.metadata.index; j--) if (tokens[j].toString() === token.toString()) return undefined;
  return token;
}
lunr.Pipeline.registerFunction(dedup, 'fd-dedup');

const use = lunr.Builder.prototype.use;
lunr.Builder.prototype.use = function (fn, ...args) {
  use.call(this, fn, ...args);
  if (fn !== lunr.pt) return;
  // Depois do trimmer e antes das palavras vazias: «nao» (sem acento) fica pesquisável, «não» continua a ser ignorado.
  this.pipeline.before(lunr.pt.stopWordFilter, fold);
  this.pipeline.add(expand, dedup);
};

module.exports = {stem, plain, groups};
