export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5173").replace(
    /\/$/,
    "",
  );
}
export function structuredData(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
export const labels: Record<string, string> = {
  sobre: "Quem sou",
  jornalismo: "Jornalismo em Brasília",
  comunicacao: "Comunicação estratégica",
  fotografia: "Fotografia",
  projetos: "Trabalhos selecionados",
  trabalhos: "Trabalhos selecionados",
  blog: "Escritos",
  depoimentos: "Depoimentos",
  contato: "Contato",
  agendamento: "Agendamento",
  privacidade: "Privacidade",
  cookies: "Cookies",
  admin: "Painel privado",
};
