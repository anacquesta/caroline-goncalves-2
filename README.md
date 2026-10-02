# Caroline Gonçalves — portfólio

Portfólio editorial da Caroline Gonçalves, baseado no briefing e nos retratos fornecidos. Fundo claro, tipografia em caixa alta, imagens em preto e branco e detalhes dourados. Inclui perfil, fotografia, blog, trajetória e contatos.

## Site publicado

https://anacquesta.github.io/caroline-goncalves-2/

O workflow `.github/workflows/pages.yml` publica a versão atual a cada push na branch padrão `codex/editorial-cms`. Em Settings → Pages, a origem deve ser **GitHub Actions**.

## Executar a versão GitHub Pages

```sh
npm ci
npm run build:pages
npm run preview:pages -- --host 127.0.0.1 --port 5180
```

Abra http://127.0.0.1:5180/caroline-goncalves-2/.

O build estático fica em `dist-pages`. Os caminhos de imagens, fontes e navegação usam `/caroline-goncalves-2/`. As páginas internas têm arquivos HTML próprios, permitindo acesso direto e atualização do navegador.

## Funcionalidades no Pages

- Perfil e trajetória baseados no material fornecido.
- Blog, projetos e galeria preparados para conteúdo real; os exemplos locais ficam em rascunho e não aparecem publicamente.
- WhatsApp, Instagram `carolquecomunica`, LinkedIn e e-mail.
- Formulário prepara a mensagem no aplicativo de e-mail do visitante; não envia nem armazena mensagens no site.
- Agendamento por WhatsApp enquanto não houver link de calendário.
- O painel administrativo online não faz parte da hospedagem estática e fica oculto na navegação.

O GitHub Pages não executa os endpoints de servidor. O código Next.js do painel e da integração Supabase foi preservado para uso opcional em uma hospedagem com servidor; a publicação Pages não depende deles nem de credenciais.

## Conteúdo

A apresentação está em `components/editorial/cover.tsx` e `components/editorial/reference-sections.tsx`. As demais páginas estão em `components/editorial/pages.tsx`. Os estilos ficam em `app/globals.css`; retratos e fontes ficam em `public`.

Para adicionar artigos, fotografias, álbuns ou projetos na versão estática, atualize `data/content.ts` e `lib/cms/seed.ts`, marque apenas o material aprovado como `Publicado` e acrescente novas rotas de detalhe a `scripts/prepare-pages.mjs`.

## Validação

Com a prévia estática ativa na porta 5180:

```sh
node scripts/qa-pages.mjs
```

Verifica as páginas públicas, rotas diretas, imagens, navegação móvel, ausência de chamadas a APIs de servidor e acessibilidade em 1440, 834, 390 e 320 px. Os resultados ficam em `artifacts/qa`.

## Versão com servidor (opcional)

```sh
npm run dev
npm run build
npm start
```

A versão Next.js usa a porta 5174. Para habilitar painel e armazenamento de mensagens, configure as variáveis de `.env.example`, execute `supabase/schema.sql` no seu banco e autorize a conta administrativa em `cms_admins`. Nunca publique credenciais no repositório.
