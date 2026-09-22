export interface Category {
  id: string;
  label: string;
  num: string;
  desc: string;
  img: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'pencil-arts',
    label: 'Pencil Arts',
    num: '01',
    desc: 'The timeless beauty of graphite and shadow.',
    img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 'pixel-arts',
    label: 'Pixel Arts',
    num: '02',
    desc: 'Retro aesthetics meeting modern imagination.',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'sketches',
    label: 'Sketches',
    num: '03',
    desc: 'Raw ideas and spontaneous strokes.',
    img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'doodles',
    label: 'Doodles',
    num: '04',
    desc: 'Wandering minds on paper.',
    img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'diy-crafts',
    label: 'DIY Crafts',
    num: '05',
    desc: 'Handmade creations from the heart.',
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2000&auto=format&fit=crop',
  },
];

export const getCategoryById = (id: string): Category | undefined =>
  CATEGORIES.find(c => c.id === id);
