import { ReactNode } from 'react';

export interface FeatureCard {
  icon: ReactNode;
  title: string;
  description: string;
}

export interface DestinationCard {
  city: string;
  imageUrl: string;
  country: string;
}