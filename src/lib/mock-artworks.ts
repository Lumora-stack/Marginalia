import type { Artwork } from './supabase'

const makeArtwork = (
  id: string,
  title: string,
  section: string,
  colors: [string, string],
  shape: string,
): Artwork => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs><rect width="800" height="1000" fill="url(#g)"/><circle cx="400" cy="480" r="235" fill="none" stroke="#f2d77b" stroke-opacity=".65" stroke-width="2"/><path d="${shape}" fill="none" stroke="#f2d77b" stroke-width="5" stroke-linecap="round"/><text x="400" y="900" fill="#f6edda" font-family="serif" font-size="32" text-anchor="middle">${title}</text></svg>`
  const image = `data:image/svg+xml,${encodeURIComponent(svg)}`

  return {
    id,
    section,
    title,
    description: 'A sample work shown while mock gallery mode is enabled.',
    image_url: image,
    thumbnail_url: image,
    year: '2025',
    medium: 'Digital study',
    width: 800,
    height: 1000,
    display_order: 0,
    created_at: new Date(Date.now() - Number(id) * 86400000).toISOString(),
    user_id: 'mock-curator',
  }
}

const samples: Artwork[] = [
  makeArtwork('1', 'Afterglow', 'pencil-arts', ['#332619', '#120f16'], 'M180 480 Q400 120 620 480 T180 480'),
  makeArtwork('2', 'Quiet Orbit', 'pencil-arts', ['#182c32', '#11121b'], 'M250 360 C500 180 600 720 300 620 C120 560 270 250 520 380'),
  makeArtwork('3', 'Golden Hour', 'pencil-arts', ['#563b23', '#1a1319'], 'M400 245 L470 420 L655 430 L510 545 L560 720 L400 615 L240 720 L290 545 L145 430 L330 420 Z'),
  { ...makeArtwork('4', 'Museum Dash', 'games', ['#332619', '#120f16'], 'M180 480 Q400 120 620 480 T180 480'), link_url: 'https://example.com' },
  makeArtwork('5', 'Quiet Quest', 'games', ['#182c32', '#11121b'], 'M250 360 C500 180 600 720 300 620 C120 560 270 250 520 380'),
]

export const getMockArtworks = (section: string): Artwork[] =>
  (section.startsWith('games') ? samples.slice(3) : samples.slice(0, 3))
    .map((artwork) => ({ ...artwork, section }))
