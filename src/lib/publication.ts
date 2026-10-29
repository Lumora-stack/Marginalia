export const CURATOR_EMAIL = 'gpraveenkumar2005@gmail.com';

export type PublicationKind = 'tech' | 'food' | 'travel' | 'watched';

export type PublicationEntry = {
  id: string;
  kind: PublicationKind;
  title: string;
  summary: string | null;
  content: string | null;
  category: string | null;
  location: string | null;
  map_url: string | null;
  visited_on: string | null;
  year: number | null;
  rating: number | null;
  price_range: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
};
