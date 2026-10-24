# Manual testing

## Gallery and curator flows

1. Set `VITE_MOCK_GALLERIES=true`, restart the dev server, and open each collection. Confirm sample artworks appear in masonry, carousel, and gallery-wall modes without Supabase credentials.
2. Set `VITE_MOCK_GALLERIES=false` and remove or invalidate the Supabase environment values. Confirm galleries and `/admin` show a friendly configuration message and do not make requests to a placeholder endpoint.
3. Configure a Supabase project and sign in as the curator. Upload a large image with a title and collection. Confirm it appears in the selected room, the grid uses the thumbnail, and opening it loads the original.
4. Try an invalid image and interrupt an upload. Confirm the failure is announced in the upload dialog, then retry with a valid image.
5. Delete an uploaded artwork as the curator. Confirm the database item and both stored image files are removed; cancel once and confirm nothing is deleted.

## Lightbox, motion, and mobile

1. Open an artwork with mouse and keyboard. Confirm the title is its accessible name, focus remains inside the lightbox, Tab and Shift+Tab wrap, arrow keys navigate, and Escape closes and restores focus.
2. Test zoom controls, wheel/pinch zoom, swipe navigation, and opening the full-resolution original.
3. Enable the operating system's reduced-motion preference. Confirm the hero remains legible without WebGL and the gallery wall falls back to its responsive grid.
4. At a mobile viewport, open the navigation menu. Confirm focus is trapped, Escape closes it, focus returns to the menu trigger, and links navigate and dismiss the menu.
5. In browser dev tools, enable Save-Data or throttle to 3G. Confirm the CSS hero poster displays without loading the hero 3D scene.

## Production bundle

Run `npm run build` and `npm run lint`. Confirm the production output contains `.gz` and `.br` assets, and the PWA precache does not include compressed duplicates.
