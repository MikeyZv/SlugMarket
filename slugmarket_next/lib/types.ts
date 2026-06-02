export type Listing = {
  id: string;
  title: string;
  price: number;
  description: string;
  condition: string;
  image_urls: string[];
  seller_id: string;
  sold: boolean;
  buyer_id?: string | null;
  created_at: string;
};
