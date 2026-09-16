-- Wedstrijd vergrendelen na een uitslag.
alter table matches add column if not exists locked boolean not null default false;
