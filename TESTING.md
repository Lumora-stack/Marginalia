# Manual testing

## Gallery and curator flows

1. Set `VITE_MOCK_GALLERIES=true`, restart the dev server, and open each collection. Confirm sample artworks appear in masonry and carousel modes without Supabase credentials.
2. Set `VITE_MOCK_GALLERIES=false` and remove or invalidate the Supabase environment values. Confirm galleries and `/admin` show a friendly configuration message and do not make requests to a placeholder endpoint.
3. Configure a Supabase project and sign in as the curator. Upload a large image with a title and collection. Confirm it appears in the selected room, the grid uses the thumbnail, and opening it loads the original.
4. Try an invalid image and interrupt an upload. Confirm the failure is announced in the upload dialog, then retry with a valid image.
5. Delete an uploaded artwork as the curator. Confirm the database item and both stored image files are removed; cancel once and confirm nothing is deleted.

## Lightbox, motion, and mobile

1. Open an artwork with mouse and keyboard. Confirm the title is its accessible name, focus remains inside the lightbox, Tab and Shift+Tab wrap, arrow keys navigate, and Escape closes and restores focus.
2. Test zoom controls, wheel/pinch zoom, swipe navigation, and opening the full-resolution original.
3. Enable the operating system's reduced-motion preference. Confirm the hero remains legible without WebGL and gallery browsing remains usable.
4. At a mobile viewport, open the navigation menu. Confirm focus is trapped, Escape closes it, focus returns to the menu trigger, and links navigate and dismiss the menu.
5. In browser dev tools, enable Save-Data or throttle to 3G. Confirm the CSS hero poster displays without loading the hero 3D scene.

## Production bundle

Run `npm run build` and `npm run lint`. Confirm the production output contains `.gz` and `.br` assets, and the PWA precache does not include compressed duplicates.

## Smoothness, themes, and responsive layout

1. In development, open `/?debug=1`. Confirm the FPS/frame-time overlay appears, updates about twice a second, and stops sampling while the tab is hidden. Confirm it is absent in a production build.
2. With `?fx=high`, scroll through the home page and back, navigate away and return, and toggle the theme. Confirm the pinned room rail and museum fly-through stay aligned and no old animation remains active.
3. Scroll past the hero and fly-through, switch browser tabs, and return. Confirm offscreen/hidden 3D scenes pause and resume normally.
4. On a desktop pointer, move over text, links, and artwork, then open the lightbox. Confirm the custom cursor follows correctly. On touch/mobile emulation, confirm the custom cursor is absent.
5. Switch themes on Home, all six collections, Games, About, Admin, and 404. Confirm body text, labels, focus rings, nav, gallery scenes, and game controls remain legible; check the browser toolbar theme color updates.
6. Check Home, all six collections, Games, About, Admin, and 404 at 375px, 768px, and 1440px widths in both themes. Confirm no horizontal page scroll, clipped controls, or overlapping content.
7. At mobile width, open the carousel and lightbox, rotate the device or show/hide the browser toolbar, and confirm artwork remains within the visible viewport.
8. Enable reduced motion and verify the hero remains usable without 3D, navigation and gallery controls still work, and no content is hidden.
9. In the browser console, verify there are no runtime errors or rejected promises while switching themes, navigating between routes, loading galleries, and opening/closing the lightbox. A Three.js `Clock` deprecation warning may appear from the installed R3F/Three integration.
