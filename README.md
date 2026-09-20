# Praveenkumar G - Portfolio

A premium, installable Progressive Web App (PWA) portfolio built with React, Vite, Tailwind CSS, Framer Motion, React Three Fiber, and Supabase.

## Features
- **3D Ambient Hero**: Subtle interactive particles using React Three Fiber.
- **Masonry Gallery**: Smooth staggered animations with Framer Motion.
- **PWA**: Installable app with offline shell support.
- **Admin Dashboard**: Secure, hidden upload flow via Supabase Auth and Storage.

## Local Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Duplicate `.env.example` to `.env.local` and fill in your Supabase details (see below).

3. Run the development server:
   ```bash
   npm run dev
   ```

## Supabase Setup

1. Create a new project on [Supabase](https://supabase.com).
2. Go to **Project Settings -> API** to find your `URL` and `anon` key. Add these to your `.env.local`.
3. Go to the **SQL Editor** in Supabase and paste the contents of `supabase_schema.sql` to run the migration. This creates the `artworks` table, the `portfolio-images` storage bucket, and sets up the Row Level Security (RLS) policies.
4. Go to **Authentication -> Users** and invite yourself or create a new user. This will be your "owner" account.

## Uploading Artwork
1. Run the app and navigate to `/admin`.
2. Sign in with the owner account you created in Supabase.
3. Once signed in, a floating **Upload** button will appear in the bottom right corner of all pages.
4. Click the button to open the drag-and-drop uploader. It handles client-side compression and uploads directly to your Supabase bucket.

## Vercel Deployment

This project is configured to be deployed easily on Vercel with GitHub integration.

1. Push this code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and click **Add New -> Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
5. Click **Deploy**. Vercel will automatically build and deploy your site. Any future pushes to the `main` branch will trigger an automatic redeploy!
