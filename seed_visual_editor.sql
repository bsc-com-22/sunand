-- Ensure all visual editor sections exist in the database with valid JSON format

DO $$
DECLARE
    home_id UUID;
    about_id UUID;
    work_id UUID;
    impact_id UUID;
    contact_id UUID;
BEGIN
    -- 1. Get Page IDs
    SELECT id INTO home_id FROM pages WHERE slug = 'index.html';
    SELECT id INTO about_id FROM pages WHERE slug = 'about.html';
    SELECT id INTO work_id FROM pages WHERE slug = 'work.html';
    SELECT id INTO impact_id FROM pages WHERE slug = 'impact.html';
    SELECT id INTO contact_id FROM pages WHERE slug = 'contact.html';

    -- 2. Seed Home Sections
    IF home_id IS NOT NULL THEN
        INSERT INTO sections (page_id, section_name, content) VALUES
        (home_id, 'home_hero_title', '{"html": "Empowering Rural Communities through Sustainable Agriculture"}'),
        (home_id, 'home_hero_subtitle', '{"html": "We provide the tools, training, and technology to help smallholder farmers thrive in a changing climate."}'),
        (home_id, 'home_stats', '{"stats": [{"label": "Farmers Trained", "number": "850"}, {"label": "Hectares Covered", "number": "1,200"}, {"label": "Youth Empowered", "number": "450"}]}'),
        (home_id, 'home_challenge_title', '{"html": "The Challenge"}'),
        (home_id, 'home_challenge_content', '{"html": "<p>Smallholder farmers face increasing challenges from climate change and lack of access to modern tools.</p>"}'),
        (home_id, 'home_work_title', '{"html": "Our Integrated Model"}'),
        (home_id, 'home_work_subtitle', '{"html": "A holistic approach to sustainable development."}'),
        (home_id, 'home_cta_title', '{"html": "Ready to make an impact?"}'),
        (home_id, 'home_cta_subtitle', '{"html": "Join us in our mission to build resilient food systems."}'),
        (home_id, 'home_cta_btn1_label', '{"html": "Donate Now"}'),
        (home_id, 'home_cta_btn1_link', '{"html": "donate.html"}'),
        (home_id, 'home_cta_btn2_label', '{"html": "Our Work"}'),
        (home_id, 'home_cta_btn2_link', '{"html": "work.html"}')
        ON CONFLICT (page_id, section_name) DO UPDATE SET content = EXCLUDED.content;
    END IF;

    -- 3. Seed About Sections
    IF about_id IS NOT NULL THEN
        INSERT INTO sections (page_id, section_name, content) VALUES
        (about_id, 'about_hero_title', '{"html": "Our Story"}'),
        (about_id, 'about_hero_subtitle', '{"html": "Dedicated to sustainable growth and community resilience."}'),
        (about_id, 'about_who_we_are_title', '{"html": "Who We Are"}'),
        (about_id, 'about_who_we_are_content', '{"html": "<p>Sun & Soil Foundation is a non-profit organization dedicated to empowering communities through sustainable agriculture and clean energy solutions.</p>"}')
        ON CONFLICT (page_id, section_name) DO UPDATE SET content = EXCLUDED.content;
    END IF;

    -- 4. Seed Work Sections
    IF work_id IS NOT NULL THEN
        INSERT INTO sections (page_id, section_name, content) VALUES
        (work_id, 'work_hero_title', '{"html": "Our Work"}'),
        (work_id, 'work_hero_subtitle', '{"html": "Scaling impact through innovation and community-led solutions."}'),
        (work_id, 'work_model_title', '{"html": "Our Integrated Model"}'),
        (work_id, 'work_model_content', '{"html": "<p>We combine technology, training, and financing to create sustainable change.</p>"}')
        ON CONFLICT (page_id, section_name) DO UPDATE SET content = EXCLUDED.content;
    END IF;

    -- 5. Seed Impact Sections
    IF impact_id IS NOT NULL THEN
        INSERT INTO sections (page_id, section_name, content) VALUES
        (impact_id, 'impact_hero_title', '{"html": "Our Impact"}'),
        (impact_id, 'impact_hero_subtitle', '{"html": "Measuring progress and celebrating community success."}'),
        (impact_id, 'impact_scaling_title', '{"html": "Scaling Forward"}'),
        (impact_id, 'impact_scaling_target', '{"html": "10,000"}'),
        (impact_id, 'impact_scaling_subtext', '{"html": "Farmers we aim to reach by 2030."}')
        ON CONFLICT (page_id, section_name) DO UPDATE SET content = EXCLUDED.content;
    END IF;

    -- 6. Seed Contact Sections
    IF contact_id IS NOT NULL THEN
        INSERT INTO sections (page_id, section_name, content) VALUES
        (contact_id, 'contact_hero_title', '{"html": "Contact Us"}'),
        (contact_id, 'contact_hero_subtitle', '{"html": "We would love to hear from you. Reach out for partnerships or inquiries."}'),
        (contact_id, 'contact_form_title', '{"html": "Send us a Message"}')
        ON CONFLICT (page_id, section_name) DO UPDATE SET content = EXCLUDED.content;
    END IF;

END $$;
