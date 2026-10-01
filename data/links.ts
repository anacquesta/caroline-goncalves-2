import { social } from "./content";
export function contactLinks(settings: Record<string, string>) {
  return social.map(([name, fallback]) => {
    const value = settings["Contato" + name];
    const greeting =
      settings["ContatoMensagem WhatsApp"] ||
      "Olá, Carol! Conheci seu trabalho pelo seu site e gostaria de conversar sobre um projeto.";
    const href =
      name === "WhatsApp"
        ? (value ? "https://wa.me/" + value.replace(/\D/g, "") : fallback) +
          "?text=" +
          encodeURIComponent(greeting)
        : value
          ? name === "E-mail"
            ? "mailto:" + value
            : value
          : fallback;
    return [name, href];
  });
}
