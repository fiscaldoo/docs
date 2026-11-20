import React, {useEffect, useId, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

const PORTRAIT = '(max-width: 600px) and (orientation: portrait)';
const NARROW = '(max-width: 600px)';

// Vídeos sem som (secções 11–13): legendas PT-PT obrigatórias, nunca reprodução automática.
// NC-032: as legendas vão gravadas na faixa por baixo do Odoo (visíveis em ecrã inteiro e em qualquer leitor). O .vtt fica ligado
// como «descriptions» (o browser não o desenha, por isso não há legendas duplicadas) e o mesmo texto aparece como transcrição na
// página, que é o que um leitor de ecrã lê de forma fiável. O leitor tem uma faixa própria por baixo da imagem, para os controlos
// não taparem as legendas com o vídeo parado.
// NC-029: num telemóvel ao alto o texto do Odoo fica pequeno demais; ao carregar em reproduzir, o vídeo abre em ecrã inteiro na
// horizontal (onde o browser deixa) e a nota pede para rodar o telemóvel (onde não deixa, como no iPhone). Sem aproximações (§4).
// NC-033: em ecrãs estreitos a transcrição abre-se sozinha e a linha que o vídeo está a mostrar fica realçada: são as legendas,
// no tamanho do texto da página (e ampliáveis com ele), por baixo do vídeo e nunca por cima do Odoo. A faixa fica «hidden»: o browser
// lê os tempos mas não a desenha, por isso continua a não haver legendas duplicadas.
export default function VideoTutorial({src, captions, poster, title, duration, width, height}) {
  const video = useBaseUrl(src || '');
  const track = useBaseUrl(captions || '');
  const image = useBaseUrl(poster || '');
  const transcriptId = useId();
  const [cues, setCues] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const player = useRef(null);
  useEffect(() => { if (window.matchMedia(NARROW).matches) setOpen(true); }, []);
  useEffect(() => {
    const t = player.current?.textTracks?.[0];
    if (!t) return undefined;
    t.mode = 'hidden';
    const sync = () => setActive(t.activeCues?.length ? [...t.cues].indexOf(t.activeCues[0]) : -1);
    t.addEventListener('cuechange', sync);
    return () => t.removeEventListener('cuechange', sync);
  }, [captions, src]);
  useEffect(() => {
    if (!captions) return;
    fetch(track).then((r) => r.text()).then((vtt) => setCues(vtt.split(/\r?\n\r?\n/).map((block) => block.split(/\r?\n/))
      .filter((lines) => lines.some((l) => l.includes('-->'))).map((lines) => lines.slice(lines.findIndex((l) => l.includes('-->')) + 1).join(' '))))
      .catch(() => {});
  }, [captions, track]);
  if (!src) {
    return (
      <div className="fd-video fd-video--pending" role="note">
        <strong>Vídeo em preparação</strong>
        {title ? ` — ${title}` : ''}
      </div>
    );
  }
  const landscape = (e) => {
    if (!window.matchMedia(PORTRAIT).matches || document.fullscreenElement) return;
    e.currentTarget.requestFullscreen?.().then(() => screen.orientation?.lock?.('landscape')).catch(() => {});
  };
  return (
    <figure className="fd-video" style={width && height ? {'--ratio': height / width} : undefined}>
      <video ref={player} controls preload="none" playsInline poster={poster ? image : undefined} aria-label={title}
        aria-describedby={captions ? transcriptId : undefined} width={width} height={height} onPlay={landscape}>
        <source src={video} type="video/mp4" />
        {captions && <track kind="descriptions" src={track} srcLang="pt-PT" label="Português" />}
      </video>
      <p className="fd-video__rotate">No telemóvel, rode-o para a horizontal e veja o vídeo em ecrã inteiro: o texto do ecrã fica legível.</p>
      <figcaption>
        {title}
        {duration ? ` · ${duration}` : ''} · sem som, com legendas
        {captions && <> · <a href={track} download>legendas (WebVTT)</a></>}
      </figcaption>
      {captions && (
        <details className="fd-video__transcript" id={transcriptId} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
          <summary>Transcrição</summary>
          <ol>{cues.map((c, i) => <li key={i} aria-current={i === active ? 'step' : undefined}>{c}</li>)}</ol>
        </details>
      )}
    </figure>
  );
}
