-- 1. Update Pages Table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- 2. Update Contact Messages Table
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- 3. Update Programs Table (Predefined List)
-- First, clear existing programs to ensure a clean slate if needed, 
-- or we can just upsert. The JS seeder handles upsert.
-- But let's ensure the descriptions are updated via SQL for immediate effect.

-- 4. Storage Policies for Heroes
-- Create bucket if not exists (handled in dashboard usually, but policies here)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('heroes', 'heroes', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access Heroes" ON storage.objects;
CREATE POLICY "Public Access Heroes" ON storage.objects
    FOR SELECT USING (bucket_id = 'heroes');

DROP POLICY IF EXISTS "Admin Manage Heroes" ON storage.objects;
CREATE POLICY "Admin Manage Heroes" ON storage.objects
    FOR ALL USING (auth.role() = 'authenticated' AND bucket_id = 'heroes');

-- 5. Add is_read to RLS policies for contact_messages if not already covered by ALL
-- (Our previous setup_rls.sql used ALL for authenticated users, so it should be fine)
