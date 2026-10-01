import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Caroline Gonçalves — Histórias por diferentes perspectivas',description:'Jornalismo, produção editorial, comunicação estratégica e fotografia. Conheça o trabalho e o olhar de Caroline Gonçalves.',openGraph:{title:'Caroline Gonçalves — Histórias por diferentes perspectivas',description:'Jornalismo · Comunicação · Fotografia',locale:'pt_BR',type:'website'},icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body>{children}</body></html>}

