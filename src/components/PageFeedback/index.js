import React, {useState} from 'react';

// shortcut: a resposta não é guardada em lado nenhum; ligar a um registo quando as métricas (secção 22) forem decididas.
export default function PageFeedback({title}) {
  const [answer, setAnswer] = useState(null);
  const mail = `mailto:fiscaldoo@fiscaldoo.pt?subject=${encodeURIComponent(`Documentação: ${title}`)}`;
  return (
    <div className="fd-feedback">
      <strong id="fd-feedback-q">Esta página foi útil?</strong>
      {answer === null ? (
        <span role="group" aria-labelledby="fd-feedback-q" className="fd-docinfo__actions">
          <button type="button" className="btn ghost small" onClick={() => setAnswer('sim')}>Sim</button>
          <button type="button" className="btn ghost small" onClick={() => setAnswer('nao')}>Não</button>
        </span>
      ) : (
        <span role="status">
          Obrigado pela resposta.{' '}
          {answer === 'nao' && <a href={mail}>Diga-nos o que faltou</a>}
        </span>
      )}
    </div>
  );
}
