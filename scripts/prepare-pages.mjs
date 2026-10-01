import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist-pages');
const routes = [
  'sobre', 'jornalismo', 'comunicacao', 'projetos', 'fotografia',
  'blog', 'depoimentos', 'contato', 'admin',
  ...['cidade-em-voz-alta', 'presenca-que-aproxima', 'entre-luz-e-silencio', 'vozes-do-encontro'].map(slug => `projetos/${slug}`),
  ...['brasilia-em-pausa', 'presencas', 'cultura-em-movimento'].map(slug => `fotografia/${slug}`),
  ...['historias-continuam-importando', 'a-pergunta-antes-da-resposta', 'a-cidade-em-pequenos-gestos', 'fotografar-e-perceber', 'conteudo-com-intencao', 'o-tempo-da-escuta'].map(slug => `blog/${slug}`),
];

for (const route of routes) {
  const directory = path.join(output, route);
  mkdirSync(directory, { recursive: true });
  copyFileSync(path.join(output, 'index.html'), path.join(directory, 'index.html'));
}
copyFileSync(path.join(output, 'index.html'), path.join(output, '404.html'));
writeFileSync(path.join(output, '.nojekyll'), '');
console.log(`GitHub Pages: ${routes.length + 1} rotas estáticas preparadas.`);
