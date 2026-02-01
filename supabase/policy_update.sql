-- Run this in your Supabase SQL Editor to enable Theatre Deletion

-- 1. Allow Host to delete their own Theatre
create policy "Host can delete theatre." 
on theatres 
for delete 
using (auth.uid() = host_id);

-- 2. Allow Host to delete ALL sessions explicitly (needed if CASCADE is not set up)
create policy "Host can delete sessions." 
on theatre_sessions 
for delete 
using (
  exists (
    select 1 from theatres 
    where id = theatre_sessions.theatre_id 
    and host_id = auth.uid()
  )
);
