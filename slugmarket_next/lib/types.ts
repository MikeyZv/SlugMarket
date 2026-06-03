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

export type Profile = { username: string; avatar_url: string | null }

export type Conversation = {
  id: string
  user1_id: string
  user2_id: string
  updated_at: string
  last_message_body: string | null
  last_message_at: string | null
  user1: Profile
  user2: Profile
}

export type OfferDetails = {
  id: string
  amount: number
  status: "pending" | "accepted" | "declined" | "withdrawn"
  seller_id: string
  buyer_id: string
  listing: { id: string; title: string; image_urls: string[] } | null
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
  read_at: string | null
  offer_id: string | null
  offer?: OfferDetails | null
}