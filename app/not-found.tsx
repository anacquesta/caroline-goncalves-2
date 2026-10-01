import Link from "next/link";
export default function NotFound() {
  return (
    <main className="page-heading">
      <span className="eyebrow">404 / FORA DE PAUTA</span>
      <h1>Esta história não está no arquivo.</h1>
      <Link href="/">Voltar ao início →</Link>
    </main>
  );
}
