-- 02_storage_policies.sql
create policy if not exists covers_public_read on storage.objects
  for select using (bucket_id = 'covers');
create policy if not exists covers_admin_insert on storage.objects
  for insert with check (bucket_id = 'covers' and exists (select 1 from public.admins where user_id = auth.uid()));
create policy if not exists covers_admin_delete on storage.objects
  for delete using (bucket_id = 'covers' and exists (select 1 from public.admins where user_id = auth.uid()));
