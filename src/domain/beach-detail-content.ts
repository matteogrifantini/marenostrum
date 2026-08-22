export type BeachDetailReport = {
  id: string;
  emoji: string;
  title: string;
  detail: string;
  age: string;
};

export type BeachParking = {
  id: string;
  name: string;
  price: string;
  type: string;
  walking: string;
  updated: string;
  sourceUrl?: string;
};

export type BeachFact = {
  emoji: string;
  label: string;
  value: string;
};

export type BeachReview = {
  id: string;
  author: string;
  age: string;
  text: string;
};

export type BeachMedia = {
  id: string;
  src: string;
  alt: string;
  age: string;
};

export type BeachReel = BeachMedia & {
  author: string;
  caption: string;
};

export type BeachReviews = {
  rating: number;
  recommendedPercent: number;
  total: number;
  items: BeachReview[];
};

export type BeachReviewProfile = {
  provider: string;
  mapsUrl: string;
  verificationStatus: "draft" | "verified" | "stale";
};

export type BeachWebcam = {
  name: string;
  distanceKm?: number;
  image?: string;
  alt?: string;
  updated: string;
  live: boolean;
  pageUrl?: string;
};

export type BeachDetailContent = {
  reports: BeachDetailReport[];
  parkings: BeachParking[];
  facts: BeachFact[];
  reviews: BeachReviews | null;
  reviewProfile?: BeachReviewProfile | null;
  recentPhotos: BeachMedia[];
  reels: BeachReel[];
  webcam: BeachWebcam | null;
};

export const emptyBeachDetailContent: BeachDetailContent = {
  reports: [],
  parkings: [],
  facts: [],
  reviews: null,
  reviewProfile: null,
  recentPhotos: [],
  reels: [],
  webcam: null,
};
