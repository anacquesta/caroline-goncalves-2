# Caroline Gonçalves — protótipo editorial

Protótipo navegável em React/TypeScript (Next.js App Router com runtime Vinext), Motion e TipTap. Sem backend definitivo.

## Executar localmente

Requer Node.js 22.13 ou superior.

```bash
npm install
npm run dev
```

Abra http://localhost:5173. Painel demonstrativo: http://localhost:5173/admin.

```bash
npx tsc --noEmit
npm run build
```

## Demonstração

- Home com três perspectivas orbitais e transições de 650–700 ms. Clique novamente para voltar. Mobile usa painéis expansíveis. Movimento reduzido é respeitado.
- Sidebar expansível por hover, clique e foco; menu mobile em tela cheia.
- Páginas de perfil, jornalismo, comunicação, 4 projetos, fotografia (12 imagens e 3 álbuns), 6 artigos, 10 depoimentos e contato.
- Galeria com filtros e visualização de imagens (Escape fecha; setas navegam).
- CMS com busca, filtros, edição, duplicação, estados de publicação, exclusão confirmada, upload local e reordenação de fotos.
- Editor TipTap: títulos, listas, negrito, itálico, sublinhado, links, citações, divisor e imagens com legenda, crédito, alt e alinhamento.
- Textos publicados pelo CMS aparecem no blog público neste mesmo navegador. Rascunhos e textos pausados ficam fora da listagem após abrir o CMS. Outros módulos demonstram gerenciamento em estado local.
- O CMS persiste dados apenas no localStorage deste navegador. Não é um CMS autenticado de produção.
- Formulário e agenda simulam confirmações locais e não enviam mensagens ou reservas.
- As configurações de site no admin são uma demonstração de edição e não modificam o código estático das páginas públicas.

## Substituir o conteúdo

Os retratos fornecidos estão em `public/images/caroline-principal.png` (home) e `public/images/caroline-perfil-home.png` (prévia de perfil na home) e `public/images/caroline-perfil.png` (página de perfil); os caminhos estão em `data/content.ts`. Projetos, cronologia, artigos e depoimentos demonstrativos devem ser aprovados/substituídos pela cliente.

Fotografias ilustrativas baixadas de Unsplash em `public/images`. Não são fotografias de autoria da cliente. Tipografia Newsreader + Manrope via Google Fonts, com fallback local de sistema.

## Revisão

Capturas e relatório de navegação em `artifacts/qa`. Para repetir a checagem com o servidor ativo:

```bash
npx playwright install chromium
node scripts/qa-prototype.mjs
node scripts/qa-interactions.mjs
```

O protótipo também pode ser executado localmente com os comandos acima.




