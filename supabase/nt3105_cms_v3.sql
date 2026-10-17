-- NT3105 Admin Studio V3: run in Supabase SQL Editor as project owner.
-- Keeps existing site_comments and site_comment_admins unchanged.
-- Requires public.is_site_comment_admin() created during comments setup.
begin;
create table if not exists public.nt3105_cms_drafts (
  id text primary key default 'main' check (id='main'),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.nt3105_cms_published (
  id text primary key default 'main' check (id='main'),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.nt3105_cms_drafts enable row level security;
alter table public.nt3105_cms_published enable row level security;

revoke all on public.nt3105_cms_drafts from public, anon, authenticated;
revoke all on public.nt3105_cms_published from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.nt3105_cms_drafts to authenticated;
grant select on public.nt3105_cms_published to anon, authenticated;
grant insert, update, delete on public.nt3105_cms_published to authenticated;

drop policy if exists "CMS draft only admin" on public.nt3105_cms_drafts;
create policy "CMS draft only admin"
  on public.nt3105_cms_drafts for all to authenticated
  using ((select public.is_site_comment_admin()))
  with check ((select public.is_site_comment_admin()));

drop policy if exists "CMS published public read" on public.nt3105_cms_published;
create policy "CMS published public read"
  on public.nt3105_cms_published for select to anon, authenticated using (true);
drop policy if exists "CMS published only admin write" on public.nt3105_cms_published;
create policy "CMS published only admin write"
  on public.nt3105_cms_published for all to authenticated
  using ((select public.is_site_comment_admin()))
  with check ((select public.is_site_comment_admin()));

-- Public media bucket; uploaded assets should never be treated as private.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'nt3105-content','nt3105-content',true,20971520,
  array['image/jpeg','image/png','image/webp','image/gif','audio/mpeg','audio/wav','audio/ogg','audio/mp4']
)
on conflict (id) do nothing;

drop policy if exists "NT3105 admin upload" on storage.objects;
create policy "NT3105 admin upload" on storage.objects for insert to authenticated
with check (bucket_id='nt3105-content' and (select public.is_site_comment_admin()));
drop policy if exists "NT3105 admin edit media" on storage.objects;
create policy "NT3105 admin edit media" on storage.objects for update to authenticated
using (bucket_id='nt3105-content' and (select public.is_site_comment_admin()))
with check (bucket_id='nt3105-content' and (select public.is_site_comment_admin()));
drop policy if exists "NT3105 admin delete media" on storage.objects;
create policy "NT3105 admin delete media" on storage.objects for delete to authenticated
using (bucket_id='nt3105-content' and (select public.is_site_comment_admin()));
drop policy if exists "NT3105 public read media" on storage.objects;
create policy "NT3105 public read media" on storage.objects for select to anon,authenticated
using (bucket_id='nt3105-content');

commit;
-- Test after running (SQL Editor only):
-- select tablename, rowsecurity from pg_tables where schemaname='public' and tablename like 'nt3105_cms_%';
-- Media uploads are public; use only images/audio you intend to publish.
