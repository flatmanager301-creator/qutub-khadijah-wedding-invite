-- Qutubuddin & Khadijah wedding invitation
-- Run this once in Supabase SQL Editor.
-- Then enable Anonymous Sign-Ins in Authentication > Providers > Anonymous.

create extension if not exists pgcrypto;

create table if not exists public.wedding_rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_code text not null,
  invited_name text not null,
  response_name text not null,
  attendance text not null check (attendance in ('Joyfully attending', 'Unable to attend')),
  attendee_count integer not null default 0 check (attendee_count between 0 and 30),
  event_selection text not null,
  message text,
  source_url text,
  created_at timestamptz not null default now()
);

alter table public.wedding_rsvps enable row level security;
revoke all on table public.wedding_rsvps from anon, authenticated;
grant insert on table public.wedding_rsvps to anon, authenticated;

drop policy if exists "Guests may submit wedding RSVPs" on public.wedding_rsvps;
create policy "Guests may submit wedding RSVPs"
on public.wedding_rsvps
for insert
to anon, authenticated
with check (
  char_length(guest_code) between 1 and 40
  and char_length(invited_name) between 1 and 100
  and char_length(response_name) between 1 and 100
  and attendee_count between 0 and 30
);

create table if not exists public.wedding_photo_uploads (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null default auth.uid(),
  guest_code text not null,
  guest_name text not null,
  file_path text not null unique,
  original_filename text not null,
  mime_type text,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 15728640),
  created_at timestamptz not null default now()
);

alter table public.wedding_photo_uploads enable row level security;
revoke all on table public.wedding_photo_uploads from anon, authenticated;
grant insert on table public.wedding_photo_uploads to authenticated;

drop policy if exists "Uploaders may record their own wedding files" on public.wedding_photo_uploads;
create policy "Uploaders may record their own wedding files"
on public.wedding_photo_uploads
for insert
to authenticated
with check (
  uploader_id = auth.uid()
  and char_length(guest_code) between 1 and 40
  and char_length(guest_name) between 1 and 100
  and size_bytes <= 15728640
);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'wedding-photos',
  'wedding-photos',
  false,
  15728640,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'video/mp4'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Each visitor is silently signed in as an anonymous Supabase user.
-- They can upload/read only files inside their own user-id folder.
drop policy if exists "Wedding guests upload to their own folder" on storage.objects;
create policy "Wedding guests upload to their own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'wedding-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Wedding guests can access their own uploads" on storage.objects;
create policy "Wedding guests can access their own uploads"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'wedding-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- No public SELECT policies are created on the RSVP or upload-log tables.
-- Review submissions and files from the Supabase dashboard/service role.
