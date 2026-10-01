"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="page-heading">
      <span className="eyebrow">ARQUIVO TEMPORARIAMENTE INDISPONÍVEL</span>
      <h1>Vamos tentar de novo?</h1>
      <p>
        Não foi possível carregar o conteúdo. Tente novamente em alguns
        instantes.
      </p>
      <button className="ink-button" onClick={reset}>
        Tentar novamente →
      </button>
    </main>
  );
}
