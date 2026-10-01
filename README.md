# Carol Gonzaga — modelo 2

Aplicação editorial em **Next.js 16, React 19 e TypeScript**, com páginas renderizadas no servidor, TipTap e integração com Supabase. Nova capa editorial usando os três retratos enviados. O nome profissional é Carol Gonzaga; o nome civil é Caroline Gonçalves.

## Executar

```sh
npm ci
npm run dev
```

Abra http://localhost:5174. Sem variáveis de banco, o site mostra conteúdo de exemplo e o painel fica bloqueado. O formulário não simula confirmação de envio.

```sh
npx tsc --noEmit
npm run build
npm start
```

## Conectar o Supabase

1. Crie um projeto Supabase. Execute `supabase/schema.sql` no SQL Editor uma única vez.
2. Crie a conta administrativa em Authentication. Insira o UUID dela em `public.cms_admins`, seguindo o comentário final de `schema.sql`. Uma conta autenticada sem essa autorização não acessa o CMS.
3. Se desejar os exemplos iniciais, execute `supabase/seed.sql` **em um banco vazio**. Inclui três artigos Lorem Ipsum, projetos e fotografias ilustrativos e dez lugares reservados para depoimentos em rascunho.
4. Copie `.env.example` para `.env.local`. Defina `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SITE_URL` com o domínio definitivo. A chave anon/publishable é pública por definição; as políticas RLS restringem as operações. Nenhuma chave service-role é necessária.
5. Reinicie o servidor. Acesse `/admin` com a conta cadastrada. Configure os canais de contato e o link de agendamento no painel.

**As credenciais, o banco real, a autorização da administradora e a hospedagem ainda não foram fornecidos/conectados.** O teste integrado usa um serviço HTTP isolado: valida os fluxos da aplicação, mas não prova as políticas RLS em um Supabase real. A ativação em produção exige essa validação.

## Publicação

Use uma hospedagem com runtime Next.js (por exemplo, um projeto Vercel conectado ao repositório indicado) e configure as variáveis acima no ambiente. Faça um novo build após mudar variáveis `NEXT_PUBLIC_*`. GitHub Pages é apenas uma prévia estática: não executa autenticação, banco, mensagens ou SSR. O workflow Pages é manual para evitar apresentar a prévia como aplicação completa.

O código foi preparado para `https://github.com/anacquesta/caroline-goncalves-2.git`. O projeto Sites antigo, se presente em `.openai`, pertence à base anterior e não é usado pelo build Next.js deste modelo.

## Conteúdo e rotas

`/`, `/sobre`, `/trabalhos`, `/projetos/[slug]`, `/jornalismo`, `/comunicacao`, `/fotografia`, `/fotografia/[slug]`, `/blog`, `/blog/[slug]`, `/depoimentos`, `/contato`, `/agendamento`, `/privacidade`, `/admin`.

- Home assimétrica, navegação editorial numerada, imagens responsivas WebP, teclado, movimento reduzido e menu mobile.
- Coleções de textos, projetos, fotografias, álbuns e depoimentos persistidas em PostgreSQL. Estados de publicação são aplicados na consulta pública e por RLS; artigos pausados, rascunhos e agendamentos futuros retornam 404 com noindex.
- Rich text com formatação, listas, citações, alinhamento, desfazer/refazer, links, vídeos YouTube, imagens, legenda, crédito, alt, redimensionamento e upload por arraste. Rascunhos são salvos automaticamente. Publicações existentes exigem salvar/publicar explicitamente.
- Upload múltiplo de fotografias com compressão WebP no navegador, reordenação e vínculo a álbuns. Originais locais fornecidos têm variantes 480/960/1600. Uploads novos geram versões WebP de 480/960/1600 px; o site seleciona a versão adequada via srcset.
- Mensagens salvas no banco e consultadas pelo painel. Honeypot, validação, espera mínima, limite de frequência no banco e verificação de origem. Não há envio de e-mail/transacional integrado.
- Login com cookies httpOnly, renovação de sessão e logout. Autorização validada pelo Supabase Auth e pela lista de administradores. HTML publicado sanitizado no servidor.
- Metadata, canonical, Open Graph, Twitter Cards, Person, BreadcrumbList e BlogPosting; sitemap exclui exemplos e conteúdo privado; robots bloqueia `/admin` e `/api`.
- Agendamento por Calendly, Cal.com ou Google Calendar: configure o link. A reserva é feita no serviço escolhido.

Os retratos pertencem ao material enviado. As demais imagens são **ilustrativas**, herdadas da base, e não são apresentadas como fotografias de autoria de Carol. Projetos são conceitos de exemplo; artigos estão marcados como placeholders. Depoimentos não aprovados ficam em rascunho. Períodos profissionais não confirmados não são tratados como datas reais. Canais de contato herdados precisam de conferência antes da publicação.

## Dados

`content_records` armazena as cinco coleções editoriais com documento por registro, posição, slug único por coleção e publicação controlada por RLS. `cms_admins` autoriza usuários do Supabase Auth; `contact_messages` guarda contatos; `site_settings` guarda configurações; Storage guarda arquivos. A persistência substitui as coleções de forma atômica. Sessões administrativas simultâneas podem sobrescrever alterações; uma revisão com controle de conflitos é necessária se houver vários editores.

## Verificação

```sh
node scripts/qa-model2.mjs        # servidor local ativo em 5174
node scripts/qa-accessibility.mjs # servidor local ativo em 5174
node scripts/qa-cms.mjs           # após build; usa backend isolado e servidor em 5176
```

Relatórios em `artifacts/model2`. Os scripts de integração usam apenas credenciais fictícias locais. A auditoria automática de acessibilidade complementa, mas não substitui, a revisão manual. Metas Lighthouse só podem ser afirmadas com os resultados medidos no ambiente final.
