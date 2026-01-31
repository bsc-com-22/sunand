-- Seed Pages and Sections for Sun & Soil CMS

-- 1. Ensure unique constraint exists for sections to allow ON CONFLICT
-- This makes section_name unique per page
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'sections_page_id_section_name_key'
    ) THEN
        ALTER TABLE sections ADD CONSTRAINT sections_page_id_section_name_key UNIQUE (page_id, section_name);
    END IF;
END $$;

-- 2. Insert Pages
INSERT INTO pages (title, slug) VALUES
('Home', 'index.html'),
('About Us', 'about.html'),
('Our Work', 'work.html'),
('Impact', 'impact.html'),
('Projects', 'projects.html'),
('News', 'news.html'),
('Contact', 'contact.html'),
('Donate', 'donate.html')
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title;

-- 3. Insert Sections
-- Home Page
INSERT INTO sections (page_id, section_name, content)
SELECT id, 'home_hero_title', jsonb_build_object('html', 'Cultivating Resilience, <br><span class="highlight">Powering Progress.</span>') FROM pages WHERE slug = 'index.html'
UNION ALL
SELECT id, 'home_hero_subtitle', jsonb_build_object('html', 'Empowering Malawian women and youth through sustainable agribusiness and clean energy solutions.') FROM pages WHERE slug = 'index.html'
UNION ALL
SELECT id, 'home_challenge_title', jsonb_build_object('html', 'The Challenge') FROM pages WHERE slug = 'index.html'
UNION ALL
SELECT id, 'home_challenge_content', jsonb_build_object('html', '<p>Malawi''s food system is under pressure. Rising input prices, high fuel costs, and climate shocks are threatening the livelihoods of millions.</p><p>We address these systemic issues by empowering the most vulnerable—women and youth—to build resilient, sustainable agricultural enterprises.</p>') FROM pages WHERE slug = 'index.html'
UNION ALL
SELECT id, 'home_work_title', jsonb_build_object('html', 'Our Integrated Delivery Model') FROM pages WHERE slug = 'index.html'
UNION ALL
SELECT id, 'home_work_subtitle', jsonb_build_object('html', 'A holistic approach to sustainable agricultural development.') FROM pages WHERE slug = 'index.html'
UNION ALL
SELECT id, 'home_cta_title', jsonb_build_object('html', 'Join Us in Building a Food-Secure Malawi') FROM pages WHERE slug = 'index.html'
UNION ALL
SELECT id, 'home_cta_subtitle', jsonb_build_object('html', 'Encourage donations, partnerships, and volunteering.') FROM pages WHERE slug = 'index.html'
ON CONFLICT (page_id, section_name) DO UPDATE SET content = EXCLUDED.content;

-- About Page
INSERT INTO sections (page_id, section_name, content)
SELECT id, 'about_hero_title', jsonb_build_object('html', 'About Us') FROM pages WHERE slug = 'about.html'
UNION ALL
SELECT id, 'about_hero_subtitle', jsonb_build_object('html', 'Driven by a passion for sustainable agriculture and community empowerment.') FROM pages WHERE slug = 'about.html'
UNION ALL
SELECT id, 'about_who_we_are_title', jsonb_build_object('html', 'Who Are We?') FROM pages WHERE slug = 'about.html'
UNION ALL
SELECT id, 'about_who_we_are_content', jsonb_build_object('html', '<p class="lead-text">Sun & Soil Foundation is a Malawian non-profit organisation strengthening rural livelihoods by integrating solar powered irrigation, climate-smart agriculture, and structured capacity building.</p><p>We support smallholder farmers, women, youths, and all vulnerable groups at risk to move from climate-vulnerable subsistence farming toward productive, market-oriented, and resilient agricultural systems.</p><p>Our work combines renewable energy deployment, hands-on training, and inclusive enterprise development, aligned with Malawi Vision 2063, the Sustainable Development Goals (SDGs), and ESG principles.</p><p>To date, Sun & Soil Foundation has implemented solar-powered irrigation installations and capacity-building programmes across Malawi, supporting 10 smallholder farmers and training 85 women, youth, and farmers, enabling year-round production, reduced fuel dependency, and improved household food security. Over the next five years, Sun & Soil Foundation aims to reach 50,000 farmers nationwide.</p>') FROM pages WHERE slug = 'about.html'
ON CONFLICT (page_id, section_name) DO UPDATE SET content = EXCLUDED.content;

-- Our Work Page
INSERT INTO sections (page_id, section_name, content)
SELECT id, 'work_hero_title', jsonb_build_object('html', 'Our Approach & Programs') FROM pages WHERE slug = 'work.html'
UNION ALL
SELECT id, 'work_hero_subtitle', jsonb_build_object('html', 'An integrated model ensuring technology, skills, and sustainability advance together.') FROM pages WHERE slug = 'work.html'
UNION ALL
SELECT id, 'work_model_title', jsonb_build_object('html', 'Our Integrated Model') FROM pages WHERE slug = 'work.html'
UNION ALL
SELECT id, 'work_model_content', jsonb_build_object('html', '<p>Sun & Soil Foundation applies an integrated delivery model that ensures technology, skills, and sustainability advance together. We don''t just provide equipment; we build the ecosystem for long-term success.</p>') FROM pages WHERE slug = 'work.html'
ON CONFLICT (page_id, section_name) DO UPDATE SET content = EXCLUDED.content;

-- Impact Page
INSERT INTO sections (page_id, section_name, content)
SELECT id, 'impact_hero_title', jsonb_build_object('html', 'Alignment & Impact') FROM pages WHERE slug = 'impact.html'
UNION ALL
SELECT id, 'impact_hero_subtitle', jsonb_build_object('html', 'Driving national and global goals through local action.') FROM pages WHERE slug = 'impact.html'
UNION ALL
SELECT id, 'impact_scaling_title', jsonb_build_object('html', 'Scaling Forward (2025–2030)') FROM pages WHERE slug = 'impact.html'
UNION ALL
SELECT id, 'impact_scaling_target', jsonb_build_object('html', '50,000 Farmers') FROM pages WHERE slug = 'impact.html'
UNION ALL
SELECT id, 'impact_scaling_subtext', jsonb_build_object('html', 'Our commitment to reach 50,000 farmers in 5 years (2026-2030), benefiting 10,000 farmers each year.') FROM pages WHERE slug = 'impact.html'
ON CONFLICT (page_id, section_name) DO UPDATE SET content = EXCLUDED.content;

-- Projects Page
INSERT INTO sections (page_id, section_name, content)
SELECT id, 'projects_hero_title', jsonb_build_object('html', 'Our Projects Portfolio') FROM pages WHERE slug = 'projects.html'
UNION ALL
SELECT id, 'projects_hero_subtitle', jsonb_build_object('html', 'Making a tangible difference through solar irrigation and training.') FROM pages WHERE slug = 'projects.html'
ON CONFLICT (page_id, section_name) DO UPDATE SET content = EXCLUDED.content;

-- News Page
INSERT INTO sections (page_id, section_name, content)
SELECT id, 'news_hero_title', jsonb_build_object('html', 'Latest News & Updates') FROM pages WHERE slug = 'news.html'
UNION ALL
SELECT id, 'news_hero_subtitle', jsonb_build_object('html', 'Stories of impact, innovation, and community resilience from across Malawi.') FROM pages WHERE slug = 'news.html'
ON CONFLICT (page_id, section_name) DO UPDATE SET content = EXCLUDED.content;

-- Contact Page
INSERT INTO sections (page_id, section_name, content)
SELECT id, 'contact_hero_title', jsonb_build_object('html', 'Get In Touch') FROM pages WHERE slug = 'contact.html'
UNION ALL
SELECT id, 'contact_hero_subtitle', jsonb_build_object('html', 'Have questions or want to join our mission? We''re here to help.') FROM pages WHERE slug = 'contact.html'
UNION ALL
SELECT id, 'contact_form_title', jsonb_build_object('html', 'Send us a Message') FROM pages WHERE slug = 'contact.html'
ON CONFLICT (page_id, section_name) DO UPDATE SET content = EXCLUDED.content;

-- Donate Page
INSERT INTO sections (page_id, section_name, content)
SELECT id, 'donate_hero_title', jsonb_build_object('html', 'Support Our Mission') FROM pages WHERE slug = 'donate.html'
UNION ALL
SELECT id, 'donate_hero_subtitle', jsonb_build_object('html', 'Your contribution directly empowers women and youth farmers in Malawi.') FROM pages WHERE slug = 'donate.html'
UNION ALL
SELECT id, 'donate_impact_title', jsonb_build_object('html', 'Choose Your Impact') FROM pages WHERE slug = 'donate.html'
UNION ALL
SELECT id, 'donate_transparency_title', jsonb_build_object('html', 'Our Commitment to Transparency') FROM pages WHERE slug = 'donate.html'
ON CONFLICT (page_id, section_name) DO UPDATE SET content = EXCLUDED.content;
