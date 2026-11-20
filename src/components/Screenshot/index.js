import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

// Capturas dos artigos (NC-023): tiradas a 2×, mostradas no tamanho real do ecrã do Odoo (largura do ficheiro ÷ 2) e nunca abaixo de 86 %,
// para o texto do Odoo (14 px) ficar com pelo menos 12 px; num ecrã estreito a imagem desliza na horizontal em vez de encolher.
// Um clique abre a imagem inteira, a 2×, numa janela que fecha com Esc, com o botão ou com outro clique.
// Sem srcSet: num ecrã de alta densidade (telemóveis) o naturalWidth de um candidato 2x já vem dividido e a imagem ficava a metade.
// NC-029: quando desliza, uma linha por baixo di-lo; align="end" começa encostada à direita (elemento assinalado à direita).
export default function Screenshot({src, alt = '', title, align}) {
  const [width, setWidth] = useState(null);
  const [slides, setSlides] = useState(false);
  const [open, setOpen] = useState(false);
  const dialog = useRef(null);
  const img = useRef(null);
  const frame = useRef(null);
  // a imagem pode chegar antes de a página ganhar vida (o onLoad já não dispara): lê-se o tamanho também aqui
  useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth) setWidth(img.current.naturalWidth / 2);
  }, []);
  useEffect(() => {
    const box = frame.current;
    if (!box || !width) return undefined;
    const measure = () => {
      const over = box.scrollWidth > box.clientWidth + 1;
      setSlides(over);
      if (over && align === 'end') box.scrollLeft = box.scrollWidth;
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [width, align]);
  useEffect(() => {
    if (open && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [open]);
  return (
    <>
      <span ref={frame} className={`fd-shot${slides ? ' fd-shot--slides' : ''}`} style={width ? {'--w': `${width}px`} : undefined}>
        <button type="button" onClick={() => setOpen(true)} aria-label={`Ampliar a imagem: ${alt}`}>
          <img ref={img} src={src} alt={alt} title={title} loading="lazy" decoding="async"
            onLoad={(e) => setWidth(e.currentTarget.naturalWidth / 2)} />
        </button>
      </span>
      {slides && <span className="fd-shot-hint" aria-hidden="true">↔ A imagem continua para o lado: deslize-a, ou toque nela para a ampliar.</span>}
      {open && createPortal(
        <dialog ref={dialog} className="fd-shot-zoom" aria-label={alt} onClose={() => setOpen(false)}
          onClick={(e) => e.target === e.currentTarget && dialog.current.close()}>
          <form method="dialog"><button className="fd-shot-close" aria-label="Fechar a imagem ampliada">×</button></form>
          <img src={src} alt={alt} />
        </dialog>,
        document.body,
      )}
    </>
  );
}
