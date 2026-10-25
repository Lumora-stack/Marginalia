# Manual testing

## Collections, uploads, and lightbox

1. Set `VITE_MOCK_GALLERIES=true`, restart the dev server, and open each collection. Confirm sample artworks appear in masonry and carousel modes without Supabase credentials.
2. Set `VITE_MOCK_GALLERIES=false` and remove or invalidate the Supabase environment values. Confirm galleries and `/admin` show a friendly configuration message and do not request a placeholder endpoint.
3. Configure Supabase and sign in as the curator. Upload a large image with a title and collection. Confirm it appears in the selected room, the grid uses the thumbnail, and opening it loads the original.
4. Try an invalid image and interrupt an upload. Confirm the failure is announced in the upload dialog, then retry with a valid image.
5. Delete an uploaded artwork as the curator. Confirm the database item and both stored image files are removed; cancel once and confirm nothing is deleted.
6. Open an artwork with mouse and keyboard. Confirm focus remains inside the lightbox, Tab and Shift+Tab wrap, arrow keys navigate, Escape closes and restores focus, and zoom and swipe controls work.

## React Bits, themes, and motion

1. On Home, confirm the hero background, animated title, six room cards, and room marquee load and remain usable. Confirm all six room cards are visible in a single-column stack on narrow screens, in two columns from 768px, and in three columns on wide desktops.
2. Open About. Confirm the profile card matches the selected theme, the story reveals on scroll, and the room and milestone counters count up once when they enter view.
3. Open the Games collection and both game modes. Confirm the arcade introduction and game choices animate in, Memory Match score counters update after each move, card matching and restart work, and Tic-Tac-Toe turns, win/draw messages, and restart work.
4. Use the footer marquee, FX quality toggle, sound toggle, and back-to-top control. Confirm each remains keyboard accessible.
5. Switch between dark and light themes on Home, all six collections, Games, About, Admin, and 404. Confirm text, gold accents, card borders, profile card, cursor, focus rings, and navigation remain legible.
6. Enable reduced motion in the operating system. Confirm the content is visible immediately, motion effects are reduced, and menus, galleries, uploads, and games still work.
7. In browser dev tools, enable Save-Data or throttle to 3G. Confirm the CSS hero poster displays without loading heavy hero canvas shaders.

## Navigation, mobile, and responsive layout

1. In both themes at 320px, 375px, and 390px widths, confirm the header has one theme control and one menu trigger, each at least 44px square, with no overlap or horizontal overflow.
2. Open the mobile menu. Confirm it fills the visible viewport with safe-area spacing, shows seven vertically stacked collection/About links with at least 48px tap targets, plus theme and close controls. Tap a blank backdrop area, a link, and the close control; also test Escape. Each action closes the menu and returns focus appropriately.
3. While the menu is open, confirm page scrolling is locked, the cursor and upload control do not cover the panel, and browser back/route changes release the lock.
4. At 375px, 768px, 1440px, and 1920px widths in both themes, confirm all sections share consistent aligned container edges and spacing, with no blank pinned bands, horizontal page scroll, clipped controls, or overlapping content. Verify Home uses a two-column room grid at 768–1099px and a three-column grid at 1100px and wider.
5. Navigate between routes. Confirm the gold transition always clears and the destination page is usable, including on a slow connection.
6. Check Home, all six collections, Games, About, Admin, and 404 at 375px, 768px, and 1440px widths in both themes. Confirm no horizontal page scroll, clipped controls, or overlapping content.
7. On touch/mobile emulation, confirm the custom cursor is absent and ClickSpark responds to taps. Confirm artwork swipe, gallery carousel gestures, and game controls remain usable.
8. Rotate a mobile device or show/hide the browser toolbar while a gallery and lightbox are open. Confirm content stays within the visible viewport.
9. Verify the PWA install prompt still appears under its supported conditions and can be dismissed.

## Desktop spacing checklist

1. In both themes at 1280px, 1440px, and 1920px widths, check that Home, each gallery, Games, About, and the footer use the same centered 1280px maximum container and aligned side gutters.
2. In both themes, scroll through the home page and confirm the hero is one viewport high, the room cards are a balanced 3-by-2 grid, and no pinned/spacer region leaves a blank band.
3. In both themes, check gallery, game, and About content widths, card gutters, heading gaps, and the footer's compact spacing.

## Production checks

Run `npm run build` and `npm run lint`. Confirm the production output contains `.gz` and `.br` assets and the PWA precache does not include compressed duplicates.
