-- Alleen nodig als schema.sql al eerder is uitgevoerd zonder de scout-kolom.
alter table matches add column if not exists scout jsonb not null default '{}'::jsonb;
