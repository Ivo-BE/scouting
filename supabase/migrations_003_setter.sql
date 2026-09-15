-- Setter-markering (S) voor spelers.
alter table players add column if not exists is_setter boolean not null default false;
