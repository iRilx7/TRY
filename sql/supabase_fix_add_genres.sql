
-- NovelHub: genres migration (safe + idempotent)

alter table public.novels
  add column if not exists genres text[] default '{}'::text[];

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'novels'
      and column_name  = 'genre'
  ) then
    update public.novels
    set genres = array[coalesce(genre, 'General')]
    where (genres is null or array_length(genres, 1) is null);

    create or replace function public.novels_sync_genre()
    returns trigger language plpgsql as $fn$
    begin
      if (tg_op in ('INSERT','UPDATE')) then
        if new.genres is not null and array_length(new.genres,1) >= 1 then
          new.genre := new.genres[1];
        elsif new.genre is not null and (new.genres is null or array_length(new.genres,1) is null) then
          new.genres := array[new.genre];
        end if;
      end if;
      return new;
    end
    $fn$;

    drop trigger if exists trg_novels_sync_genre on public.novels;
    create trigger trg_novels_sync_genre
      before insert or update on public.novels
      for each row execute function public.novels_sync_genre();
  end if;
end $$;

create index if not exists idx_novels_genres on public.novels using gin (genres);

do $$
begin
  perform pg_notify('pgrst', 'reload schema');
exception when undefined_object then
  null;
end $$;
