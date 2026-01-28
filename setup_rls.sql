-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Newsletter Subscribers Policies
DROP POLICY IF EXISTS "Allow public to subscribe" ON newsletter_subscribers;
CREATE POLICY "Allow public to subscribe" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admins to view subscribers" ON newsletter_subscribers;
CREATE POLICY "Allow admins to view subscribers" ON newsletter_subscribers
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admins to delete subscribers" ON newsletter_subscribers;
CREATE POLICY "Allow admins to delete subscribers" ON newsletter_subscribers
    FOR DELETE USING (auth.role() = 'authenticated');

-- Contact Messages Policies
DROP POLICY IF EXISTS "Allow public to send messages" ON contact_messages;
CREATE POLICY "Allow public to send messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admins to view messages" ON contact_messages;
CREATE POLICY "Allow admins to view messages" ON contact_messages
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admins to delete messages" ON contact_messages;
CREATE POLICY "Allow admins to delete messages" ON contact_messages
    FOR DELETE USING (auth.role() = 'authenticated');

-- Public Read-Only Tables (Projects, News, etc.)
-- Projects
DROP POLICY IF EXISTS "Allow public to view projects" ON projects;
CREATE POLICY "Allow public to view projects" ON projects
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage projects" ON projects;
CREATE POLICY "Allow admins to manage projects" ON projects
    FOR ALL USING (auth.role() = 'authenticated');

-- News
DROP POLICY IF EXISTS "Allow public to view news" ON news;
CREATE POLICY "Allow public to view news" ON news
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage news" ON news;
CREATE POLICY "Allow admins to manage news" ON news
    FOR ALL USING (auth.role() = 'authenticated');

-- News Attachments
DROP POLICY IF EXISTS "Allow public to view news attachments" ON news_attachments;
CREATE POLICY "Allow public to view news attachments" ON news_attachments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage news attachments" ON news_attachments;
CREATE POLICY "Allow admins to manage news attachments" ON news_attachments
    FOR ALL USING (auth.role() = 'authenticated');

-- Team Members
DROP POLICY IF EXISTS "Allow public to view team members" ON team_members;
CREATE POLICY "Allow public to view team members" ON team_members
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage team members" ON team_members;
CREATE POLICY "Allow admins to manage team members" ON team_members
    FOR ALL USING (auth.role() = 'authenticated');

-- Site Settings
DROP POLICY IF EXISTS "Allow public to view site settings" ON site_settings;
CREATE POLICY "Allow public to view site settings" ON site_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage site settings" ON site_settings;
CREATE POLICY "Allow admins to manage site settings" ON site_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Pages
DROP POLICY IF EXISTS "Allow public to view pages" ON pages;
CREATE POLICY "Allow public to view pages" ON pages
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage pages" ON pages;
CREATE POLICY "Allow admins to manage pages" ON pages
    FOR ALL USING (auth.role() = 'authenticated');

-- Sections
DROP POLICY IF EXISTS "Allow public to view sections" ON sections;
CREATE POLICY "Allow public to view sections" ON sections
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage sections" ON sections;
CREATE POLICY "Allow admins to manage sections" ON sections
    FOR ALL USING (auth.role() = 'authenticated');

-- Programs
DROP POLICY IF EXISTS "Allow public to view programs" ON programs;
CREATE POLICY "Allow public to view programs" ON programs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage programs" ON programs;
CREATE POLICY "Allow admins to manage programs" ON programs
    FOR ALL USING (auth.role() = 'authenticated');

-- Storage Policies (Buckets: projects, news, news_attachments, team)
-- Note: These assume the buckets already exist. 

-- Public Access to Storage
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id IN ('projects', 'news', 'news_attachments', 'team'));

-- Admin Management of Storage
DROP POLICY IF EXISTS "Admin Manage" ON storage.objects;
CREATE POLICY "Admin Manage" ON storage.objects
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        bucket_id IN ('projects', 'news', 'news_attachments', 'team')
    );
