export type Channel = "Hostaway" | "Google" | "Airbnb" | "Booking" | "Other";

export interface RatingItems {
  cleanliness?: number;
  communication?: number;
  location?: number;
  value?: number;
  checkin?: number;
  accuracy?: number;
  [key: string]: number | undefined;
}

export interface ReviewRow {
  id: string;
  listingId: string;
  listingName: string;
  channel: Channel;
  type?: string | null;
  status?: string | null;
  ratingOverall: number | null; // 0-10
  ratingItems?: RatingItems | null;
  publicText?: string | null;
  authorName?: string | null;
  submittedAt?: string | null; // ISO
  approved: boolean;
  sentimentScore?: number; // -1..1 basic sentiment
}

export interface ListingSummary {
  id: string;
  name: string;
  total: number;
  approved: number;
  avgAll: number | null;
  avgApproved: number | null;
  monthlySeries?: Array<{ month: string; avg: number | null }>;
}
