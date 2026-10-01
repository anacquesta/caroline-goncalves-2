-- Execute no SQL Editor do Supabase. Nenhuma senha ou chave privada faz parte deste arquivo.
create table public.cms_admins(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.cms_admins enable row level security;
create policy own_admin_row on public.cms_admins for select to authenticated using(user_id=auth.uid());
create function public.is_cms_admin() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from cms_admins where user_id=auth.uid())$$;
create table public.content_records(section text not null check(section in ('Textos','Projetos','Fotografias','Álbuns','Depoimentos')),id bigint not null,payload jsonb not null,position integer not null default 0,updated_at timestamptz not null default now(),primary key(section,id));
create unique index content_slug on public.content_records(section,(payload->>'slug'));
alter table public.content_records enable row level security;
create function public.content_is_public(data jsonb) returns boolean language plpgsql stable as $$begin return data->>'status'='Publicado' or (data->>'status'='Agendado' and (data->>'scheduledAt')::timestamptz<=now());exception when others then return false;end$$;
create policy public_content on public.content_records for select to anon,authenticated using(public.content_is_public(payload));
create policy admin_content on public.content_records for all to authenticated using(public.is_cms_admin()) with check(public.is_cms_admin());
create function public.replace_content(document jsonb) returns void language plpgsql security invoker set search_path=public as $$declare section_name text;item jsonb;position_index integer;begin
 if not public.is_cms_admin() then raise exception 'Unauthorized';end if;
 perform pg_advisory_xact_lock(7472026);
 -- Atomic replacement: no partially published collections.
 delete from content_records;
 for section_name in select jsonb_object_keys(document) loop
 position_index:=0;
 for item in select jsonb_array_elements(document->section_name) loop
 insert into content_records(section,id,payload,position) values(section_name,(item->>'id')::bigint,item,position_index);
 position_index:=position_index+1;
 end loop;end loop;
end$$;
revoke all on function public.replace_content(jsonb) from public;
grant execute on function public.replace_content(jsonb) to authenticated;
create table public.contact_messages(id uuid primary key default gen_random_uuid(),name text not null,email text not null,company text,subject text,message text,created_at timestamptz not null default now(),read boolean not null default false);
create index contact_sender_time on public.contact_messages(email,created_at);
alter table public.contact_messages enable row level security;
create policy admin_messages on public.contact_messages for all to authenticated using(public.is_cms_admin()) with check(public.is_cms_admin());
create function public.submit_contact(sender_name text,sender_email text,sender_company text,message_subject text,message_body text) returns void language plpgsql security definer set search_path=public as $$begin
 if length(trim(sender_name))<2 or length(sender_name)>150 or length(sender_email)>320 or sender_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(message_body)<10 or length(message_body)>5000 or length(sender_company)>200 or length(message_subject)>100 then raise exception 'Invalid fields';end if;
 perform pg_advisory_xact_lock(19740926);
 if (select count(*) from contact_messages where created_at>now()-interval '1 minute')>=30 then raise exception 'Rate limit';end if;
 if exists(select 1 from contact_messages where lower(email)=lower(sender_email) and created_at>now()-interval '5 minutes') then raise exception 'Rate limit';end if;
 insert into contact_messages(name,email,company,subject,message) values(trim(sender_name),lower(sender_email),sender_company,message_subject,message_body);
end$$;
revoke all on function public.submit_contact(text,text,text,text,text) from public;
grant execute on function public.submit_contact(text,text,text,text,text) to anon,authenticated;
create table public.site_settings(key text primary key,value text not null);
alter table public.site_settings enable row level security;
create policy public_settings on public.site_settings for select using(true);
create policy admin_settings on public.site_settings for all to authenticated using(public.is_cms_admin()) with check(public.is_cms_admin());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('editorial','editorial',true,12000000,array['image/jpeg','image/png','image/webp','image/avif']) on conflict(id) do nothing;
create policy editorial_upload on storage.objects for insert to authenticated with check(bucket_id='editorial' and public.is_cms_admin());
create policy editorial_delete on storage.objects for delete to authenticated using(bucket_id='editorial' and public.is_cms_admin());
create policy editorial_read on storage.objects for select using(bucket_id='editorial');
-- Após criar a usuária no Supabase Auth, execute com seu UUID real:
-- insert into public.cms_admins(user_id) values ('UUID-DA-USUARIA');
-- Privilégios explícitos, com todas as operações ainda limitadas pelas políticas RLS.
grant select on public.cms_admins to authenticated;
grant select on public.content_records to anon,authenticated;
grant insert,update,delete on public.content_records to authenticated;
grant select,insert,update,delete on public.contact_messages to authenticated;
grant select on public.site_settings to anon,authenticated;
grant insert,update,delete on public.site_settings to authenticated;
