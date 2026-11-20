import React, {useEffect, useRef} from 'react';
import SearchBar from '@theme-original/SearchBar';

// Correções de acessibilidade ao plugin de pesquisa (@easyops-cn/docusaurus-search-local 0.55.3).
// shortcut: retirar quando o plugin traduzir o aria-label e deixar de devolver o foco ao campo.
export default function SearchBarWrapper(props) {
  const ref = useRef(null);
  useEffect(() => {
    const input = ref.current?.querySelector('input');
    if (!input) return undefined;
    // 1) o plugin fixa aria-label="Search" (inglês).
    input.setAttribute('aria-label', 'Pesquisar na documentação');
    // 2) quem passa pelo campo com Tab dispara o carregamento do índice e, quando acaba, o plugin
    //    devolve o foco ao campo (WCAG 3.2.1). Carregar o índice antes, pelo caminho do «hover», evita isso.
    const preload = () => input.dispatchEvent(new MouseEvent('mouseover', {bubbles: true, relatedTarget: document.body}));
    const id = window.requestIdleCallback ? window.requestIdleCallback(preload) : window.setTimeout(preload, 500);
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : window.clearTimeout(id));
  }, []);
  return (
    <div ref={ref} style={{display: 'contents'}}>
      <SearchBar {...props} />
    </div>
  );
}
