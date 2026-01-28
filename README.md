# Sun & Soil Foundation Website

A modern, dynamic website and Content Management System (CMS) for the Sun & Soil Foundation, a Malawian non-profit organisation dedicated to empowering women and youth through sustainable agribusiness and clean energy solutions.

## 🚀 Features

- **Dynamic Content:** All website content (text, images, projects, news) is managed through a secure admin dashboard.
- **Integrated CMS:** Custom-built admin panel for managing:
  - **Projects:** Showcase impact with images, beneficiary counts, and technology details.
  - **News & Updates:** Share stories with support for document attachments (PDF/DOCX).
  - **Team Members:** Manage the organisation's leadership profiles.
  - **Site Settings:** Update contact info and global configuration easily.
  - **Newsletter:** Automated subscriber collection.
  - **Contact Messages:** Centralised inbox for website inquiries.
- **Modern Design:** Responsive, mobile-first design with a focus on accessibility and premium aesthetics.
- **Supabase Integration:** Powered by Supabase for authentication, real-time database, and cloud storage.

## 🛠️ Tech Stack

- **Frontend:** HTML5, Vanilla CSS3, JavaScript (ES6+)
- **Backend/Database:** [Supabase](https://supabase.com/)
  - PostgreSQL Database
  - Supabase Auth (Admin Security)
  - Supabase Storage (Image & Document Hosting)
- **Typography:** Inter (via Google Fonts)
- **Icons:** Lucide Icons (SVG)

## ⚙️ Setup & Installation

### 1. Supabase Configuration
1. Create a new project on [Supabase](https://supabase.com/).
2. Run the provided SQL scripts in the Supabase SQL Editor:
   - `seed-cms.sql`: Initializes the database schema and default content.
   - `setup_rls.sql`: Configures Row-Level Security (RLS) policies for security.
3. Create the following Storage Buckets in your Supabase dashboard and set them to **Public**:
   - `projects`
   - `news`
   - `news_attachments`
   - `team`

### 2. Local Configuration
1. Open `js/config.js`.
2. Replace the `url` and `anonKey` with your Supabase project credentials (found in Project Settings > API).

```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
export default SUPABASE_CONFIG;
```

### 3. Running the Project
Simply open `index.html` in any modern web browser, or use a local development server like Live Server (VS Code extension).

## 📂 Project Structure

- `/admin`: Admin dashboard and login pages.
- `/assets`: Static images and brand assets.
- `/js`: JavaScript modules for Supabase integration and UI logic.
- `/styles.css`: Main stylesheet for the entire website.
- `*.html`: Public-facing website pages.

## 📄 License

This project is built for the Sun & Soil Foundation. All rights reserved.
