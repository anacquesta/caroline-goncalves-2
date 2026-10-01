export const homeProfilePortrait = '/images/caroline-perfil-home.png';
export const profilePortrait = '/images/caroline-perfil.png';
export const portrait = '/images/caroline-principal.png'; // Retrato principal fornecido por Caroline.
export const perspectives = [
 {name:'Jornalismo',subtitle:'& produção editorial',route:'/jornalismo',areas:['Reportagens','Entrevistas','Produção editorial','Coberturas','Artigos','Assessoria']},
 {name:'Comunicação',subtitle:'estratégica',route:'/comunicacao',areas:['Estratégia','Social Media','Conteúdo','SEO','Comunicação institucional','Projetos digitais']},
 {name:'Fotografia',subtitle:'um olhar, muitas histórias',route:'/fotografia',areas:['Eventos','Retratos','Editorial','Projetos autorais','Cultura','Lifestyle']}
];
export const social = [['E-mail','mailto:jornalistacarolinegoncalves@gmail.com'],['WhatsApp','https://wa.me/5561981921769'],['Instagram','https://www.instagram.com/ideiascomca/'],['LinkedIn','https://www.linkedin.com/in/comunicologacaroline/']];
export const projects = [
 {slug:'cidade-em-voz-alta',title:'A cidade em voz alta',category:'Jornalismo',year:'2026',image:'/images/city.jpg',client:'Projeto editorial demonstrativo',description:'Uma cobertura sobre o cotidiano de Brasília, contada por quem transforma os espaços da cidade em lugares de encontro.'},
 {slug:'presenca-que-aproxima',title:'Presença que aproxima',category:'Comunicação',year:'2025',image:'/images/editorial.jpg',client:'Projeto de comunicação demonstrativo',description:'Planejamento editorial e estratégia de conteúdo para construir relações mais próximas entre uma instituição e seu público.'},
 {slug:'entre-luz-e-silencio',title:'Entre luz e silêncio',category:'Fotografia',year:'2026',image:'/images/light.jpg',client:'Ensaio autoral demonstrativo',description:'Um ensaio sobre pausas, arquitetura e a luz que revela outras formas de perceber a cidade.'},
 {slug:'vozes-do-encontro',title:'Vozes do encontro',category:'Jornalismo',year:'2025',image:'/images/culture.jpg',client:'Produção editorial demonstrativa',description:'Entrevistas e registros que aproximam diferentes perspectivas sobre cultura, território e pertencimento.'}
];
export const posts = [
 {slug:'historias-continuam-importando',title:'As histórias continuam importando em um mundo de conteúdo instantâneo.',category:'Comunicação',date:'04.09.2026',minutes:6,image:'/images/editorial.jpg',excerpt:'Entre a velocidade de publicar e a vontade de dizer algo, existe um espaço para escuta, contexto e intenção.'},
 {slug:'a-pergunta-antes-da-resposta',title:'A pergunta que vem antes da resposta.',category:'Jornalismo',date:'28.08.2026',minutes:4,image:'/images/city.jpg',excerpt:'O que muda quando escutamos uma fonte sem antecipar a história que queremos contar?'},
 {slug:'a-cidade-em-pequenos-gestos',title:'A cidade também se conta em pequenos gestos.',category:'Cultura',date:'15.08.2026',minutes:5,image:'/images/culture.jpg',excerpt:'Um olhar sobre os encontros que dão sentido aos espaços que atravessamos todos os dias.'},
 {slug:'fotografar-e-perceber',title:'Fotografar é aprender a perceber.',category:'Fotografia',date:'07.08.2026',minutes:3,image:'/images/light.jpg',excerpt:'Antes do enquadramento, vem o olhar. Antes do olhar, a disponibilidade para estar presente.'},
 {slug:'conteudo-com-intencao',title:'Conteúdo com intenção, comunicação com presença.',category:'Comunicação',date:'22.07.2026',minutes:5,image:'/images/work.jpg',excerpt:'Uma estratégia começa pelas pessoas, suas perguntas e as relações que queremos construir.'},
 {slug:'o-tempo-da-escuta',title:'Sobre o tempo da escuta.',category:'Opinião',date:'10.07.2026',minutes:4,image:'/images/sea.jpg',excerpt:'Algumas respostas só chegam quando fazemos espaço para o silêncio.'}
];
export const albums = [
 {slug:'brasilia-em-pausa',name:'Brasília em pausa',category:'Projetos autorais',year:'2026',place:'Brasília, DF',description:'Geometria, silêncio e movimento. Um passeio visual pela cidade que se revela entre um compromisso e outro.'},
 {slug:'presencas',name:'Presenças',category:'Retratos',year:'2025',place:'Brasília, DF',description:'Pessoas, expressões e os pequenos gestos que tornam cada encontro singular.'},
 {slug:'cultura-em-movimento',name:'Cultura em movimento',category:'Cultura',year:'2026',place:'Brasília, DF',description:'O encontro entre arte e público, em cenas de um cotidiano cultural compartilhado.'}
];
export const photos = Array.from({length:12},(_,i)=>({id:i+1,title:['Intervalo urbano','Um instante de presença','Encontro','Luz de passagem','Paisagem íntima','Entre pessoas','Horizonte','No caminho','Expressão','Pausa','Movimento','Detalhes'][i],src:'/images/'+['city','portrait','culture','light','sea','work','architecture','street','portrait2','nature','event','detail'][i]+'.jpg',album:albums[[0,1,2,0,0,1,0,0,1,0,2,1][i]].slug,category:['Projetos autorais','Retratos','Cultura','Editorial','Projetos autorais','Editorial','Projetos autorais','Projetos autorais','Retratos','Projetos autorais','Eventos','Editorial'][i],visible:true}));
export const testimonials = Array.from({length:10},(_,i)=>({id:i+1,name:'Nome da Pessoa '+String(i+1).padStart(2,'0'),role:'Relação profissional',company:'Empresa / projeto',text:['Um olhar atento, uma escuta cuidadosa e a capacidade de transformar informação em uma história que faz sentido.','Da primeira conversa à entrega, o cuidado com cada palavra fez toda a diferença.','Sensibilidade para observar. Clareza para comunicar. Uma parceria construída com atenção e proximidade.'][i%3],visible:true,featured:i===0}));



