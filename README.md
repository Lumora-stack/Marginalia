# Artville — A Personal Publication ✦

> *"Creating art from tiny feelings, peaceful thoughts, and a little bit of imagination — straight from Chennai 🤍."*

**Artville** is a personal publication and creative archive for the work, interests, and places of **Praveenkumar G**.

🔗 **Live Website:** [marginalia-alpha-ten.vercel.app](https://marginalia-alpha-ten.vercel.app)

---

## 🏛️ What the Website Consists Of

The app is organized into five areas:

- **Home** — An editorial introduction and links into each area.
- **Creative Journey** — Pencil Arts, Pixel Arts, Sketches, Doodles, DIY Crafts, and Games, with the existing gallery and game routes preserved.
- **Tech** — A space for personal topic notes and articles.
- **Explored Places** — Separate Food & Cafes and Travel collections, with a search form that opens Google Maps.
- **Watched** — A space for movie and series reviews.
- **Settings & About** — Theme preferences and the artist profile.
- **Owner portal** — Supabase sign-in, Creative artwork uploads, and publication content management.

Tech, Places, and Watched support curator-managed entries backed by Supabase. Each section keeps its own fields and filters while sharing the same publication controls.

## Publishing content

Sign in at `/admin` with the curator account. Creative Journey artwork continues to use the floating upload button. For Tech, Food & Cafes, Travel, and Watched, open the relevant page and use its **Add** button to publish an entry. The curator can edit or delete their entries; published entries are readable without signing in.

Publication entries are stored in `public.publication_entries`. The migration in `supabase/migrations/` enables row-level security and limits writes to the configured curator email. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the intended Supabase environment; never put a service-role key in the browser app.

---

## ✨ Experience Highlights

- **🌌 Interactive Ambient Hero** — Real-time WebGL Aurora with a static fallback for reduced-motion and lower-capability devices.
- **✍️ Editorial type** — Expressive variable Fraunces display lettering paired with clean Manrope body copy and monospaced details.
- **🖼️ Fullscreen Touch Lightbox** — Inspect artworks in detail with touch swipe navigation on phones and arrow keys on desktop.
- **🖌️ Exhibition Gallery Views** — Browse masonry or carousel display modes with date sorting.
- **🏛️ Cinematic Museum Flow** — Ambient hero, collection cards, shared room-cover transitions, and smooth scroll on supported devices.
- **📱 App-style navigation** — Responsive desktop navigation and a safe-area-aware mobile tab bar.
- **🔎 Global section search** — Quickly find areas and existing creative collections.
- **🗺️ Google Maps finder** — Search for a cafe, restaurant, landmark, or destination, then save it to a Maps list.
- **🌓 Four Theme Options** — Choose System, warm Light, classic Dark, or Acid Lime with midnight black, cobalt blue, and vivid lime.
- **📱 Responsive, motion-aware experience** — Mobile-friendly fallbacks, reduced-motion support, and installable PWA support.

---

## 🛠️ Built With

- **Frontend:** React 19, TypeScript, Vite
- **Motion & Shader Effects:** React Bits, Framer Motion, GSAP ScrollTrigger, Lenis
- **Styling:** Tailwind CSS
- **Backend & Storage:** Supabase (Auth, Database, Storage)
- **Deployment:** Vercel

---

## 📬 Contact the Artist

- **Email:** [quantumvoyager2005@gmail.com](mailto:quantumvoyager2005@gmail.com)
- **Instagram:** [@crafted.strokes.42](https://instagram.com/crafted.strokes.42)
- **Location:** Chennai, India

---

© 2026 Artville Gallery of Imagination. Handcrafted with patience and silence.
