// Centro de documentação do fiscaldoo. Esqueleto local: NÃO publicar sem autorização (DEC-1261).
import {themes as prismThemes} from 'prism-react-renderer';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

// Acentos e sinónimos no índice da pesquisa (NC-001/NC-002): tem de carregar antes do plugin construir o índice.
createRequire(import.meta.url)('./scripts/search-pipeline.cjs');

/** @type {import('@docusaurus/types').Config} */
export default {
  title: 'fiscaldoo — Documentação',
  tagline: 'Certificação PT para o ERP Odoo.',
  favicon: 'img/favicon.svg',
  url: 'https://docs.fiscaldoo.pt',
  baseUrl: '/',
  trailingSlash: false,
  // Imagens e vídeos dos artigos em public/ (estrutura da secção 20 do master prompt); static/ guarda as letras, o favicon e a marca.
  staticDirectories: ['static', 'public'],
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'throw'}},
  // Novos idiomas: acrescentar a «locales» e correr «docusaurus write-translations».
  i18n: {defaultLocale: 'pt-PT', locales: ['pt-PT']},

  headTags: [
    {tagName: 'link', attributes: {rel: 'icon', href: '/img/favicon.ico', sizes: 'any'}},
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png'}},
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          // URLs na raiz: docs.fiscaldoo.pt/fiscal-core/series-documentais (secção 10 do master prompt).
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          showLastUpdateTime: true,
          breadcrumbs: true,
          // Versões: «npx docusaurus docs:version <x>» congela a versão atual; esta fica como a em curso.
          lastVersion: 'current',
          versions: {current: {label: 'Odoo 20', badge: false}},
        },
        blog: false,
        theme: {customCss: ['./src/css/core.css', './src/css/docs.css']},
      }),
    ],
  ],

  plugins: [
    // As categorias da página inicial vêm da arquitetura (NC-003): nomes e ordem iguais aos da lateral.
    () => ({
      name: 'fd-categorias',
      contentLoaded({actions}) {
        const {categorias} = JSON.parse(readFileSync(new URL('./data/documentation-architecture.json', import.meta.url), 'utf8'));
        actions.setGlobalData(categorias.map(({slug, titulo, descricao}) => ({slug, titulo, descricao})));
      },
    }),
    // NC-009: a caixa de pesquisa da barra superior mostra um resultado por artigo, como a página /search.
    // shortcut: troca o módulo de pesquisa que o SearchBar do plugin 0.55.3 importa; rever ao mudar de versão.
    () => ({
      name: 'fd-pesquisa-por-artigo',
      configureWebpack(config, isServer, {currentBundler}) {
        const byArticle = fileURLToPath(new URL('./src/search/byArticle.js', import.meta.url));
        const replace = (r) => {
          if (r.request === '../searchByWorker' && /[\\/]theme[\\/]SearchBar$/.test(r.context)) r.request = byArticle;
        };
        return {plugins: [new currentBundler.instance.NormalModuleReplacementPlugin(/searchByWorker$/, replace)]};
      },
    }),
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      /** @type {import('@easyops-cn/docusaurus-search-local').PluginOptions} */
      ({
        hashed: true,
        language: ['pt'],
        docsRouteBasePath: '/',
        indexBlog: false,
        indexPages: false,
        // Sinónimos: o campo «keywords» de cada artigo e os grupos de data/pesquisa.json (scripts/search-pipeline.cjs).
        fuzzyMatchingDistance: 1,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        searchResultLimits: 8,
        searchBarShortcutHint: false,
      }),
    ],
  ],

  /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
  themeConfig: {
    // O site fiscaldoo só existe em modo claro (core.css: color-scheme: light).
    colorMode: {defaultMode: 'light', disableSwitch: true, respectPrefersColorScheme: false},
    navbar: {
      hideOnScroll: false,
      // Marca do site: ponto azul 9×9 (core.css .brand .dot) + «fiscaldoo»; a etiqueta «docs» vem do CSS.
      title: 'fiscaldoo',
      logo: {alt: '', src: 'img/brand-dot.svg', width: 9, height: 9},
      items: [
        {type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Artigos'},
        {href: 'https://www.fiscaldoo.pt/novidades.html', label: 'Novidades', position: 'left'},
        {href: 'mailto:fiscaldoo@fiscaldoo.pt', label: 'Suporte', position: 'left'},
        {type: 'search', position: 'right'},
        {href: 'https://painel.fiscaldoo.pt/', label: 'Entrar', position: 'right', className: 'btn ghost small navbar-cta'},
      ],
    },
    docs: {sidebar: {hideable: false, autoCollapseCategories: true}},
    tableOfContents: {minHeadingLevel: 2, maxHeadingLevel: 3},
    footer: {
      style: 'light',
      links: [
        {
          title: 'fiscaldoo',
          items: [
            {label: 'Site oficial', href: 'https://www.fiscaldoo.pt/'},
            {label: 'Preços', href: 'https://www.fiscaldoo.pt/precos.html'},
            {label: 'Novidades', href: 'https://www.fiscaldoo.pt/novidades.html'},
          ],
        },
        {
          title: 'Ajuda',
          items: [
            {label: 'Tem dúvidas? Contacte-nos', href: 'mailto:fiscaldoo@fiscaldoo.pt'},
            {label: 'Parceiros', href: 'mailto:parceiros@fiscaldoo.pt'},
          ],
        },
      ],
      copyright: 'Certificação PT para o ERP Odoo. Produtor certificado AT n.º 2790.',
    },
    prism: {theme: prismThemes.github},
  },
};
