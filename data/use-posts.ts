"use client";
import {useEffect,useState} from 'react';
import type {RecordItem} from '@/components/admin/text-editor';
import {posts} from './content';
export type PublicPost=(typeof posts)[number]&{body?:string};
export function usePosts(){const[items,setItems]=useState<PublicPost[]>(posts);useEffect(()=>{try{const raw=localStorage.getItem('carol-cms-v1');if(!raw)return;const records=(JSON.parse(raw).Textos||[]) as RecordItem[];setItems(records.filter(r=>r.status==='Publicado').map(r=>{const original=posts.find(p=>p.slug===r.slug);return {slug:r.slug,title:r.title,category:r.category,date:r.date.split('-').reverse().join('.'),minutes:original?.minutes||4,image:r.image||original?.image||'/images/editorial.jpg',excerpt:String(r.subtitle||original?.excerpt||'Uma nova perspectiva sobre comunicação e o mundo ao redor.'),body:r.bodyEdited?r.body:undefined}}))}catch{}},[]);return items}
