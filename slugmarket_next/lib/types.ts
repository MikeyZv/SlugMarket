export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'] as const
export type Condition = typeof CONDITIONS[number]

export interface ListingForm {
  title: string
  price: string
  description: string
  condition: Condition | ''
}

export type LocalImage  = { kind: "local";  file: File; url: string }
export type RemoteImage = { kind: "remote"; url: string }
export type ListingImage = LocalImage | RemoteImage

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

export type Notification = {
  id: string;
  user_id: string;
  message: string;
  link?: string | null;
  read: boolean;
  created_at: string;
};